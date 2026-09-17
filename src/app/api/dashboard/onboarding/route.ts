import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyAuth, isUnauthorized } from "@/lib/auth";

export async function GET() {
  const auth = await verifyAuth();
  if (isUnauthorized(auth)) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }

  const [rows]: any = await pool.query(
    "SELECT name, phone_number, onboarding_complete FROM Users WHERE id = ?",
    [auth.userId]
  );

  if (rows.length === 0) {
    return NextResponse.json({ message: "Usuário não encontrado" }, { status: 404 });
  }

  return NextResponse.json(rows[0]);
}

export async function PUT(request: NextRequest) {
  const auth = await verifyAuth();
  if (isUnauthorized(auth)) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }

  const body = await request.json();
  const name = (body.name ?? "").trim();
  const phone_number = (body.phone_number ?? "").trim() || null;

  if (!name) {
    return NextResponse.json({ message: "Nome é obrigatório" }, { status: 400 });
  }

  await pool.query(
    "UPDATE Users SET name = ?, phone_number = ?, onboarding_complete = 1 WHERE id = ?",
    [name, phone_number, auth.userId]
  );

  return NextResponse.json({ message: "Onboarding concluído" });
}
