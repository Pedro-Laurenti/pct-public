import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyAuth, isUnauthorized } from "@/lib/auth";
import { enrollStudentInCourse } from "@/lib/enrollment";
import { RowDataPacket } from "mysql2/promise";

// Acesso gratuito (price=0 ou cupom 100%)
export async function POST(request: NextRequest) {
  if (process.env.NEXT_PUBLIC_ENABLE_PAYMENTS !== "true") {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const auth = await verifyAuth();
  if (isUnauthorized(auth)) return auth;

  const { courseId, couponCode } = await request.json();
  if (!courseId) return NextResponse.json({ message: "Curso inválido." }, { status: 400 });

  const [courses] = await pool.query<RowDataPacket[]>(
    "SELECT id, price FROM Courses WHERE id = ? AND is_active = 1",
    [courseId]
  );

  if (courses.length === 0) {
    return NextResponse.json({ message: "Curso não encontrado." }, { status: 404 });
  }

  const course = courses[0];
  let finalPrice = parseFloat(course.price);

  // Aplicar cupom se fornecido
  if (couponCode && finalPrice > 0) {
    const [promos] = await pool.query<RowDataPacket[]>(
      `SELECT discount_type, discount_value, course_id
       FROM Promotions
       WHERE code = ? AND is_active = 1
         AND (expires_at IS NULL OR expires_at > NOW())
         AND (max_uses IS NULL OR current_uses < max_uses)`,
      [couponCode.toUpperCase()]
    );
    if (promos.length > 0) {
      const p = promos[0];
      if (!p.course_id || p.course_id === courseId) {
        const disc = p.discount_type === "percent"
          ? (finalPrice * p.discount_value) / 100
          : p.discount_value;
        finalPrice = Math.max(0, finalPrice - disc);
        if (finalPrice === 0) {
          await pool.query("UPDATE Promotions SET current_uses = current_uses + 1 WHERE code = ?", [couponCode.toUpperCase()]);
        }
      }
    }
  }

  if (finalPrice > 0) {
    return NextResponse.json({ message: "Este curso não é gratuito." }, { status: 400 });
  }

  // Registra pagamento e matricula
  await pool.query(
    "INSERT INTO Payments (user_id, course_id, status, amount) VALUES (?, ?, 'approved', 0)",
    [auth.userId, courseId]
  );

  await enrollStudentInCourse(auth.userId, courseId);

  return NextResponse.json({ message: "Acesso liberado!" });
}
