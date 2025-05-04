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
       WHERE lc.id = ? AND l.id = ? AND cu.user_id = ? AND lc.content_type = 'text'`,
      [contentId, lessonId, userId]
    );

    if (!hasAccess || hasAccess.length === 0) {
      return res.status(403).json({ message: "Você não tem acesso a este conteúdo ou o tipo de conteúdo não é texto" });
    }

    // Obter informações da aula para o breadcrumb
    const [lessonRows]: any = await pool.query(
      `SELECT l.id, l.title, l.lesson_description, c.name as course_name
       FROM Lessons l
       JOIN Courses c ON l.course_id = c.id
       WHERE l.id = ?`,
      [lessonId]
    );

    // Obter conteúdo de texto
    const [contentRows]: any = await pool.query(
      `SELECT lt.id, lt.lesson_content_id, lt.text_title, lt.text_content, lt.created_at
       FROM LessonText lt
       JOIN LessonContents lc ON lt.lesson_content_id = lc.id
       WHERE lc.id = ? AND lc.content_type = 'text'`,
      [contentId]
    );

    if (contentRows.length === 0) {
      return res.status(404).json({ message: "Conteúdo de texto não encontrado" });
    }

    return res.status(200).json({
      lesson: lessonRows[0],
      content: contentRows[0]
    });
  } catch (error) {
    console.error('Text Content API Error:', error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
}