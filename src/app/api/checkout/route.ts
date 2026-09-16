import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyAuth, isUnauthorized } from "@/lib/auth";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";

// Cria preferência de pagamento no Mercado Pago (Checkout Pro)
export async function POST(request: NextRequest) {
  if (process.env.NEXT_PUBLIC_ENABLE_PAYMENTS !== "true") {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const auth = await verifyAuth();
  if (isUnauthorized(auth)) return auth;

  const { courseId, couponCode } = await request.json();
  if (!courseId) return NextResponse.json({ message: "Curso inválido." }, { status: 400 });

  // Buscar dados do curso
  const [courses] = await pool.query<RowDataPacket[]>(
    "SELECT id, name, price FROM Courses WHERE id = ? AND is_active = 1",
    [courseId]
  );
  if (courses.length === 0) {
    return NextResponse.json({ message: "Curso não encontrado." }, { status: 404 });
  }

  const course = courses[0];
  let finalPrice: number = parseFloat(course.price);
  let discountAmount = 0;

  // Aplicar cupom
  if (couponCode && finalPrice > 0) {
    const [promos] = await pool.query<RowDataPacket[]>(
      `SELECT id, discount_type, discount_value, course_id
       FROM Promotions
       WHERE code = ? AND is_active = 1
         AND (expires_at IS NULL OR expires_at > NOW())
         AND (max_uses IS NULL OR current_uses < max_uses)`,
      [couponCode.toUpperCase()]
    );
    if (promos.length > 0) {
      const p = promos[0];
      if (!p.course_id || p.course_id === courseId) {
        discountAmount = p.discount_type === "percent"
          ? (finalPrice * p.discount_value) / 100
          : p.discount_value;
        finalPrice = Math.max(0, finalPrice - discountAmount);
      }
    }
  }

  if (finalPrice <= 0) {
    return NextResponse.json({ message: "Use o endpoint de acesso gratuito." }, { status: 400 });
  }

  // Criar registro de pagamento pendente
  const [paymentResult] = await pool.query<ResultSetHeader>(
    "INSERT INTO Payments (user_id, course_id, status, amount) VALUES (?, ?, 'pending', ?)",
    [auth.userId, courseId, finalPrice]
  );
  const paymentId = paymentResult.insertId;

  // Buscar dados do usuário
  const [users] = await pool.query<RowDataPacket[]>(
    "SELECT name, email FROM Users WHERE id = ?",
    [auth.userId]
  );
  const user = users[0];

  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  // Criar preferência no Mercado Pago
  const mpRes = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      items: [
        {
          id: String(course.id),
          title: course.name,
          quantity: 1,
          unit_price: parseFloat(finalPrice.toFixed(2)),
          currency_id: "BRL",
        },
      ],
      payer: {
        name: user?.name ?? "",
        email: user?.email ?? "",
      },
      external_reference: String(paymentId),
      back_urls: {
        success: `${baseUrl}/pagamento/sucesso`,
        failure: `${baseUrl}/pagamento/erro`,
        pending: `${baseUrl}/pagamento/sucesso`,
      },
      payment_methods: {
        installments: 12,
      },
      // auto_return só funciona com URLs públicas HTTPS — não usar em localhost
      ...(baseUrl.startsWith("https://") && { auto_return: "approved" }),
      // notification_url só faz sentido com URL pública
      ...(baseUrl.startsWith("https://") && {
        notification_url: `${baseUrl}/api/webhooks/mercadopago`,
      }),
    }),
  });

  if (!mpRes.ok) {
    const mpError = await mpRes.json();
    console.error("MP preference error:", mpError);
    return NextResponse.json({ message: "Erro ao criar pagamento." }, { status: 500 });
  }

  const mpData = await mpRes.json();

  // Salvar preference_id
  await pool.query(
    "UPDATE Payments SET mp_preference_id = ? WHERE id = ?",
    [mpData.id, paymentId]
  );

  return NextResponse.json({ initPoint: mpData.init_point });
}
