import { NextApiRequest, NextApiResponse } from "next";
import pool from "@/lib/db";
import { jwtVerify } from "jose";
import { subtle } from "crypto";

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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Esse endpoint só aceita requisições POST
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  // Verificar se o usuário está autenticado
  const jwtToken = req.cookies.auth_token;
  if (!jwtToken) {
    return res.status(401).json({ message: "Não autenticado" });
  }

  const { token, newPassword } = req.body;

  // Validar parâmetros
  if (!token || !newPassword) {
    return res.status(400).json({ message: "Token e nova senha são obrigatórios" });
  }

  // Validar formato do token (6 dígitos)
  if (!/^\d{6}$/.test(token)) {
    return res.status(400).json({ message: "Formato de token inválido" });
  }

  // Validar tamanho da senha
  if (newPassword.length < 8) {
    return res.status(400).json({ message: "A senha deve ter pelo menos 8 caracteres" });
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
      return res.status(400).json({ 
        message: "Token inválido ou expirado. Solicite um novo código de redefinição."
      });
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

    return res.status(200).json({ 
      message: "Senha atualizada com sucesso"
    });

  } catch (error) {
    console.error("Erro na confirmação de redefinição de senha:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
}