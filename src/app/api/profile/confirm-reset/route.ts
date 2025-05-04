import { NextRequest, NextResponse } from 'next/server';
import pool from "@/lib/db";
import { jwtVerify } from "jose";
import { subtle } from "crypto";
import { cookies } from 'next/headers';

// Chave secreta para verificar o token JWT
const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret_key");

// Função para gerar hash da senha usando o mesmo método do login.ts
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const hashBuffer = await subtle.digest("SHA-256", encoder.encode(password));
  
  // Convert ArrayBuffer to hexadecimal string
  const hashHex = Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  return hashHex;
}

export async function POST(request: NextRequest) {
  // Verificar se o usuário está autenticado
  const cookieStore = await cookies();
  const jwtToken = cookieStore.get('auth_token')?.value;
  if (!jwtToken) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }

  // Get request body
  const body = await request.json();
  const { token, newPassword } = body;

  // Validar parâmetros
  if (!token || !newPassword) {
    return NextResponse.json({ message: "Token e nova senha são obrigatórios" }, { status: 400 });
  }

  // Validar formato do token (6 dígitos)
  if (!/^\d{6}$/.test(token)) {
    return NextResponse.json({ message: "Formato de token inválido" }, { status: 400 });
  }

  // Validar tamanho da senha
  if (newPassword.length < 8) {
    return NextResponse.json({ message: "A senha deve ter pelo menos 8 caracteres" }, { status: 400 });
  }

  try {
    // Extrair ID do usuário a partir do token JWT
    const { payload } = await jwtVerify(jwtToken, SECRET_KEY);
    const userId = payload.userId as number;

    // Verificar se o token é válido e não expirou
    const [resetTokens]: any = await pool.query(
      `SELECT * FROM PwdResetTokens 
       WHERE user_id = ? AND token = ? AND expires_at > NOW()`,
      [userId, token]
    );

    if (resetTokens.length === 0) {
      return NextResponse.json({ 
        message: "Token inválido ou expirado. Solicite um novo código de redefinição."
      }, { status: 400 });
    }

    // Gerar hash da nova senha usando SHA-256 (o mesmo método do login.ts)
    const hashedPassword = await hashPassword(newPassword);

    // Atualizar senha do usuário
    await pool.query(
      `UPDATE Users SET password_hash = ? WHERE id = ?`,
      [hashedPassword, userId]
    );

    // Remover todos os tokens de redefinição deste usuário
    await pool.query(
      `DELETE FROM PwdResetTokens WHERE user_id = ?`,
      [userId]
    );

    return NextResponse.json({ 
      message: "Senha atualizada com sucesso"
    });

  } catch (error) {
    console.error("Erro na confirmação de redefinição de senha:", error);
    return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 });
  }
}