import { NextApiRequest, NextApiResponse } from "next";
import pool from "@/lib/db";
import { jwtVerify } from "jose";

// Chave secreta para verificar o token JWT
const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret_key");

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  // Autenticação e extração de dados do token
  const token = req.cookies.auth_token;
  if (!token) {
    return res.status(401).json({ message: "Não autenticado" });
  }

  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    const userId = payload.userId as number;

    switch (method) {
      case "GET": {
        try {
          // Buscar dados do usuário
          const [users]: any = await pool.query(
            `SELECT id, name, email, phone_number FROM Users WHERE id = ?`,
            [userId]
          );

          if (users.length === 0) {
            return res.status(404).json({ message: "Usuário não encontrado" });
          }

          const user = users[0];
          return res.status(200).json({ user });
        } catch (error) {
          console.error("Erro ao buscar perfil:", error);
          return res.status(500).json({ message: "Erro interno do servidor" });
        }
      }

      case "PUT": {
        try {
          const { name, email, phone_number } = req.body;

          // Validar dados
          if (!name || !email) {
            return res.status(400).json({ message: "Nome e email são obrigatórios" });
          }

          // Verificar se o email já está em uso (exceto pelo próprio usuário)
          const [existingUsers]: any = await pool.query(
            `SELECT id FROM Users WHERE email = ? AND id != ?`, 
            [email, userId]
          );
          
          if (existingUsers.length > 0) {
            return res.status(400).json({ message: "Este email já está em uso" });
          }

          // Atualizar dados do usuário
          await pool.query(
            `UPDATE Users SET name = ?, email = ?, phone_number = ? WHERE id = ?`,
            [name, email, phone_number || null, userId]
          );

          // Buscar dados atualizados
          const [users]: any = await pool.query(
            `SELECT id, name, email, phone_number FROM Users WHERE id = ?`,
            [userId]
          );

          const updatedUser = users[0];
          return res.status(200).json({ 
            message: "Perfil atualizado com sucesso",
            user: updatedUser
          });
        } catch (error) {
          console.error("Erro ao atualizar perfil:", error);
          return res.status(500).json({ message: "Erro interno do servidor" });
        }
      }

      default:
        res.setHeader("Allow", ["GET", "PUT"]);
        res.status(405).json({ message: `Method ${method} not allowed` });
        break;
    }
  } catch (error) {
    console.error('JWT verification error:', error);
    return res.status(401).json({ message: "Token inválido ou expirado" });
  }
}