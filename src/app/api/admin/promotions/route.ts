import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";

export async function GET() {
  if (process.env.NEXT_PUBLIC_ENABLE_PAYMENTS !== "true") {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT p.id, p.code, p.discount_type, p.discount_value,
            p.course_id, c.name AS course_name,
            p.max_uses, p.current_uses, p.expires_at, p.is_active, p.created_at
     FROM Promotions p
     LEFT JOIN Courses c ON p.course_id = c.id
     ORDER BY p.created_at DESC`
  );

  return NextResponse.json({ promotions: rows });
}

export async function POST(request: NextRequest) {
  if (process.env.NEXT_PUBLIC_ENABLE_PAYMENTS !== "true") {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const { code, discount_type, discount_value, course_id, max_uses, expires_at, is_active } = body;

  if (!code || !discount_type || discount_value == null) {
    return NextResponse.json({ message: "Campos obrigatórios: code, discount_type, discount_value." }, { status: 400 });
  }

  try {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO Promotions (code, discount_type, discount_value, course_id, max_uses, expires_at, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        code.toUpperCase().trim(),
        discount_type,
        discount_value,
        course_id || null,
        max_uses || null,
        expires_at || null,
        is_active ?? 1,
      ]
    );
    return NextResponse.json({ message: "Promoção criada com sucesso!", id: result.insertId }, { status: 201 });
  } catch (err: any) {
    if (err.code === "ER_DUP_ENTRY") {
      return NextResponse.json({ message: "Código já existe." }, { status: 409 });
    }
    return NextResponse.json({ message: "Erro ao criar promoção." }, { status: 500 });
  }
}
