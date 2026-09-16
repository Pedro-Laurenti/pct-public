import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2/promise";
import { verifyAuth, isUnauthorized } from "@/lib/auth";

interface UserRow extends RowDataPacket {
  id: number;
  name: string;
  email: string;
}

export async function GET() {
  const auth = await verifyAuth();
  if (isUnauthorized(auth)) return auth;

  const { userId } = auth;

  try {
    const [rows] = await pool.query<UserRow[]>(
      "SELECT id, name, email FROM Users WHERE id = ?",
      [userId]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json({ message: "Usuário não encontrado." }, { status: 404 });
    }

    const { id, name, email } = rows[0];

    return NextResponse.json({ user: { id, name, email } });
  } catch (error) {
    console.error("Erro ao buscar perfil:", error);
    return NextResponse.json({ message: "Erro interno do servidor." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const auth = await verifyAuth();
  if (isUnauthorized(auth)) return auth;

  const { userId } = auth;

  try {
    const body = await request.json();
    const { name, email } = body;

    if (!name || !email) {
      return NextResponse.json({ message: "Nome e email são obrigatórios." }, { status: 400 });
    }

    await pool.query(
      "UPDATE Users SET name = ?, email = ? WHERE id = ?",
      [name, email, userId]
    );

    return NextResponse.json({ message: "Perfil atualizado com sucesso." });
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    return NextResponse.json({ message: "Erro interno do servidor." }, { status: 500 });
  }
}
