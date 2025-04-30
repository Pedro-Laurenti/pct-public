import { NextApiRequest, NextApiResponse } from "next";
import pool from "@/lib/db";
import { jwtVerify } from "jose";

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret_key");

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Apenas método GET é permitido
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  // Autenticação e extração de dados do token
  const token = req.cookies.auth_token;
  if (!token) {
    return res.status(401).json({ message: "Não autenticado" });
  }

  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    const userId = payload.userId as number;
    const { id: lessonId, contentId } = req.query;

    if (!lessonId || !contentId) {
      return res.status(400).json({ message: "Parâmetros insuficientes" });
    }

    // Verificar se o usuário tem acesso a este conteúdo
    const [hasAccess]: any = await pool.query(
      `SELECT 1
       FROM LessonContents lc
       JOIN Lessons l ON lc.lesson_id = l.id
       JOIN Courses c ON l.course_id = c.id
       JOIN Classes cl ON c.id = cl.course_id
       JOIN ClassUsers cu ON cl.id = cu.class_id
       WHERE lc.id = ? AND l.id = ? AND cu.user_id = ?`,
      [contentId, lessonId, userId]
    );

    if (!hasAccess || hasAccess.length === 0) {
      return res.status(403).json({ message: "Você não tem acesso a este conteúdo" });
    }

    // Obter tipo de conteúdo
    const [contentInfo]: any = await pool.query(
      `SELECT id, lesson_id, content_type
       FROM LessonContents
       WHERE id = ?`,
      [contentId]
    );

    if (contentInfo.length === 0) {
      return res.status(404).json({ message: "Conteúdo não encontrado" });
    }

    return res.status(200).json({
      content: contentInfo[0]
    });
  } catch (error) {
    console.error('Content API Error:', error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
}