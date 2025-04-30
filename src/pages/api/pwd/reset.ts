import { NextApiRequest, NextApiResponse } from "next";
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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Esse endpoint só aceita requisições POST
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  const { hash, token, password } = req.body;

  // Validar parâmetros
  if (!hash || !token || !password) {
    return res.status(400).json({ message: "Todos os campos são obrigatórios" });
  }

  // Validar formato do token (6 dígitos)
  if (!/^\d{6}$/.test(token)) {
    return res.status(400).json({ message: "Formato de token inválido" });
  }

  // Validar tamanho da senha
  if (password.length < 8) {
    return res.status(400).json({ message: "A senha deve ter pelo menos 8 caracteres" });
  }

  try {
    // Buscar o token e informações do usuário associado
    const [tokens]: any = await pool.query(
      `SELECT prt.*, u.id AS user_id 
       FROM PwdResetTokens prt 
       JOIN Users u ON prt.user_id = u.id 
       WHERE prt.hash_url = ? AND prt.token = ? AND prt.expires_at > NOW()`,
      [hash, token]
    );

    if (tokens.length === 0) {
      return res.status(400).json({ message: "Link ou código inválido ou expirado" });
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

    return res.status(200).json({ message: "Senha definida com sucesso! Você já pode fazer login." });
  } catch (error) {
    console.error("Erro na redefinição de senha:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
}