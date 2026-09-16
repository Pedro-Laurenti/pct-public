import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function PUT(request: NextRequest) {
  if (process.env.NEXT_PUBLIC_ENABLE_PAYMENTS !== "true") {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const url = new URL(request.url);
  const segments = url.pathname.split("/");
  const id = segments[segments.indexOf("promotions") + 1];
  if (!id || isNaN(Number(id))) {
    return NextResponse.json({ message: "ID inválido." }, { status: 400 });
  }

  const body = await request.json();
  const { code, discount_type, discount_value, course_id, max_uses, expires_at, is_active } = body;

  if (!code || !discount_type || discount_value == null) {
    return NextResponse.json({ message: "Campos obrigatórios: code, discount_type, discount_value." }, { status: 400 });
  }

  try {
    const [result] = await pool.query(
      `UPDATE Promotions SET code = ?, discount_type = ?, discount_value = ?,
       course_id = ?, max_uses = ?, expires_at = ?, is_active = ?
       WHERE id = ?`,
      [
        code.toUpperCase().trim(),
        discount_type,
        discount_value,
        course_id || null,
        max_uses || null,
        expires_at || null,
        is_active ?? 1,
        id,
      ]
    );
    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ message: "Promoção não encontrada." }, { status: 404 });
    }
    return NextResponse.json({ message: "Promoção atualizada com sucesso." });
  } catch (err: any) {
    if (err.code === "ER_DUP_ENTRY") {
      return NextResponse.json({ message: "Código já existe." }, { status: 409 });
    }
    return NextResponse.json({ message: "Erro ao atualizar promoção." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (process.env.NEXT_PUBLIC_ENABLE_PAYMENTS !== "true") {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const url = new URL(request.url);
  const segments = url.pathname.split("/");
  const id = segments[segments.indexOf("promotions") + 1];
  if (!id || isNaN(Number(id))) {
    return NextResponse.json({ message: "ID inválido." }, { status: 400 });
  }

  const [result] = await pool.query("DELETE FROM Promotions WHERE id = ?", [id]);
  if ((result as any).affectedRows === 0) {
    return NextResponse.json({ message: "Promoção não encontrada." }, { status: 404 });
  }
  return NextResponse.json({ message: "Promoção excluída com sucesso." });
}
