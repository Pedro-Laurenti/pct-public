import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { subtle } from "crypto";

// Função para gerar hash da senha usando o mesmo método utilizado no login
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
  try {
    const { hash, token, password } = await request.json();

    // Validar parâmetros
    if (!hash || !token || !password) {
      return NextResponse.json(
        { message: "Todos os campos são obrigatórios" }, 
        { status: 400 }
      );
    }

    // Validar formato do token (6 dígitos)
    if (!/^\d{6}$/.test(token)) {
      return NextResponse.json(
        { message: "Formato de token inválido" }, 
        { status: 400 }
      );
    }

    // Validar tamanho da senha
    if (password.length < 8) {
      return NextResponse.json(
        { message: "A senha deve ter pelo menos 8 caracteres" }, 
        { status: 400 }
      );
    }

    // Buscar o token e informações do usuário associado
    const [tokens]: any = await pool.query(
      `SELECT prt.*, u.id AS user_id 
       FROM PwdResetTokens prt 
       JOIN Users u ON prt.user_id = u.id 
       WHERE prt.hash_url = ? AND prt.token = ? AND prt.expires_at > NOW()`,
      [hash, token]
    );

    if (tokens.length === 0) {
      return NextResponse.json(
        { message: "Link ou código inválido ou expirado" }, 
        { status: 400 }
      );
    }

    const resetToken = tokens[0];
    
    // Gerar hash da nova senha
    const hashedPassword = await hashPassword(password);

    // Atualizar senha do usuário
    await pool.query(
      `UPDATE Users SET password_hash = ? WHERE id = ?`,
      [hashedPassword, resetToken.user_id]
    );

    // Remover todos os tokens de redefinição deste usuário
    await pool.query(
      `DELETE FROM PwdResetTokens WHERE user_id = ?`,
      [resetToken.user_id]
    );

    return NextResponse.json(
      { message: "Senha definida com sucesso! Você já pode fazer login." }, 
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro na redefinição de senha:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" }, 
      { status: 500 }
    );
  }
}