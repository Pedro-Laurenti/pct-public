import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyAuth, isUnauthorized } from "@/lib/auth";
import { RowDataPacket } from "mysql2/promise";

export async function GET(request: NextRequest) {
  if (process.env.NEXT_PUBLIC_ENABLE_PAYMENTS !== "true") {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const auth = await verifyAuth();
  if (isUnauthorized(auth)) return auth;

  const code = request.nextUrl.searchParams.get("code");
  if (!code) return NextResponse.json({ message: "Código inválido." }, { status: 400 });

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT id, discount_type, discount_value, course_id, max_uses, current_uses, expires_at
     FROM Promotions
     WHERE code = ? AND is_active = 1`,
    [code.toUpperCase()]
  );

  if (rows.length === 0) {
    return NextResponse.json({ message: "Cupom não encontrado ou inativo." }, { status: 404 });
  }

  const promo = rows[0];

  if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
    return NextResponse.json({ message: "Cupom expirado." }, { status: 410 });
  }

  if (promo.max_uses !== null && promo.current_uses >= promo.max_uses) {
    return NextResponse.json({ message: "Cupom esgotado." }, { status: 410 });
  }

  return NextResponse.json({
    id: promo.id,
    discount_type: promo.discount_type,
    discount_value: promo.discount_value,
    course_id: promo.course_id,
  });
}
