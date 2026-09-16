import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2/promise";
import { verifyAuth, isUnauthorized, hashPassword, verifyPasswordWithMigration } from "@/lib/auth";

interface PasswordRow extends RowDataPacket {
  password_hash: string;
}

export async function POST(request: NextRequest) {
  const auth = await verifyAuth();
  if (isUnauthorized(auth)) return auth;

  const { userId } = auth;

  try {
    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { message: "Senha atual e nova senha são obrigatórias." },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { message: "A nova senha deve ter pelo menos 8 caracteres." },
        { status: 400 }
      );
    }

    const [rows] = await pool.query<PasswordRow[]>(
      "SELECT password_hash FROM Users WHERE id = ?",
      [userId]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json({ message: "Usuário não encontrado." }, { status: 404 });
    }

    const { password_hash } = rows[0];

    const isValid = await verifyPasswordWithMigration(
      currentPassword,
      password_hash,
      async () => {
        // No-op: migration update handled separately below
      }
    );

    if (!isValid) {
      return NextResponse.json({ message: "Senha atual incorreta." }, { status: 401 });
    }

    const newHash = await hashPassword(newPassword);

    await pool.query("UPDATE Users SET password_hash = ? WHERE id = ?", [newHash, userId]);

    return NextResponse.json({ message: "Senha alterada com sucesso." });
  } catch (error) {
    console.error("Erro ao alterar senha:", error);
    return NextResponse.json({ message: "Erro interno do servidor." }, { status: 500 });
  }
}
