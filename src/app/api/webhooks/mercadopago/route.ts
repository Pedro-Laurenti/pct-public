import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import pool from "@/lib/db";
import { enrollStudentInCourse } from "@/lib/enrollment";
import { RowDataPacket } from "mysql2/promise";

export async function POST(request: NextRequest) {
  const body = await request.text();

  // Verificar assinatura HMAC-SHA256 do Mercado Pago
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (secret) {
    const xSignature = request.headers.get("x-signature") ?? "";
    const xRequestId = request.headers.get("x-request-id") ?? "";
    const dataId = new URL(request.url).searchParams.get("data.id") ?? "";

    const signedTemplate = `id:${dataId};request-id:${xRequestId};ts:${xSignature.split(",").find(p => p.startsWith("ts="))?.split("=")[1] ?? ""}`;
    const expectedHmac = crypto
      .createHmac("sha256", secret)
      .update(signedTemplate)
      .digest("hex");

    const receivedV1 = xSignature.split(",").find(p => p.startsWith("v1="))?.split("=")[1] ?? "";
    if (receivedV1 && receivedV1 !== expectedHmac) {
      return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
    }
  }

  let payload: { type?: string; data?: { id?: string } };
  try {
    payload = JSON.parse(body);
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }

  // Só processar notificações de pagamento
  if (payload.type !== "payment" || !payload.data?.id) {
    return NextResponse.json({ message: "ok" });
  }

  const mpPaymentId = payload.data.id;

  // Consultar detalhes do pagamento no MP
  const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${mpPaymentId}`, {
    headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` },
  });

  if (!mpRes.ok) {
    console.error("MP payment fetch error:", await mpRes.text());
    return NextResponse.json({ message: "MP error" }, { status: 500 });
  }

  const mpPayment = await mpRes.json();
  const externalRef = mpPayment.external_reference;
  const mpStatus: string = mpPayment.status;

  if (!externalRef) {
    return NextResponse.json({ message: "ok" });
  }

  const paymentId = Number(externalRef);
  if (isNaN(paymentId)) {
    return NextResponse.json({ message: "ok" });
  }

  // Mapear status do MP para nosso enum
  const statusMap: Record<string, string> = {
    approved: "approved",
    rejected: "rejected",
    cancelled: "cancelled",
    pending: "pending",
    in_process: "pending",
    authorized: "pending",
    refunded: "cancelled",
    charged_back: "cancelled",
  };
  const ourStatus = statusMap[mpStatus] ?? "pending";

  // Atualizar Payment
  await pool.query(
    "UPDATE Payments SET mp_payment_id = ?, status = ?, updated_at = NOW() WHERE id = ?",
    [String(mpPaymentId), ourStatus, paymentId]
  );

  // Se aprovado, matricular aluno
  if (ourStatus === "approved") {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT user_id, course_id FROM Payments WHERE id = ?",
      [paymentId]
    );
    if (rows.length > 0) {
      await enrollStudentInCourse(rows[0].user_id, rows[0].course_id);
    }
  }

  return NextResponse.json({ message: "ok" });
}
