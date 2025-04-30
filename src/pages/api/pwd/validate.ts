import { NextApiRequest, NextApiResponse } from "next";
import pool from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // GET: Valida apenas o hash da URL
  if (req.method === "GET") {
    const { hash } = req.query;

    if (!hash || typeof hash !== "string") {
      return res.status(400).json({ message: "Hash não fornecido" });
    }

    try {
      // Verificar se existe um token com este hash_url e que não expirou
      const [tokens]: any = await pool.query(
        `SELECT * FROM PwdResetTokens 
         WHERE hash_url = ? AND expires_at > NOW()`,
        [hash]
      );

      if (tokens.length === 0) {
        return res.status(404).json({ message: "Link inválido ou expirado" });
      }

      return res.status(200).json({ message: "Hash válido" });
    } catch (error) {
      console.error("Erro ao validar hash:", error);
      return res.status(500).json({ message: "Erro interno do servidor" });
    }
  }
  
  // POST: Valida o hash da URL e o token fornecido pelo usuário
  else if (req.method === "POST") {
    const { hash, token } = req.body;

    if (!hash || !token) {
      return res.status(400).json({ message: "Hash e token são obrigatórios" });
    }

    if (!/^\d{6}$/.test(token)) {
      return res.status(400).json({ message: "Formato de token inválido" });
    }

    try {
      // Buscar o token no banco de dados
      const [tokens]: any = await pool.query(
        `SELECT * FROM PwdResetTokens 
         WHERE hash_url = ? AND token = ? AND expires_at > NOW()`,
        [hash, token]
      );

      if (tokens.length === 0) {
        return res.status(400).json({ message: "Código inválido ou expirado" });
      }

      // Token válido
      return res.status(200).json({ message: "Código validado com sucesso" });
    } catch (error) {
      console.error("Erro ao validar token:", error);
      return res.status(500).json({ message: "Erro interno do servidor" });
    }
  }
  
  // Método não permitido
  else {
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}