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
    const { id: lessonId } = req.query;

    if (!lessonId) {
      return res.status(400).json({ message: "ID da aula não fornecido" });
    }

    // Verificar se o usuário tem acesso a esta aula
    const [hasAccess]: any = await pool.query(
      `SELECT 1
      FROM Lessons l
      JOIN Courses c ON l.course_id = c.id
      JOIN Classes cl ON c.id = cl.course_id
      JOIN ClassUsers cu ON cl.id = cu.class_id
      WHERE l.id = ? AND cu.user_id = ?`,
      [lessonId, userId]
    );

    if (!hasAccess || hasAccess.length === 0) {
      return res.status(403).json({ message: "Você não tem acesso a esta aula" });
    }

    // Obter informações da aula
    const [lessonRows]: any = await pool.query(
      `SELECT l.id, l.title, l.lesson_description, l.course_id, c.name as course_name
      FROM Lessons l
      JOIN Courses c ON l.course_id = c.id
      WHERE l.id = ?`,
      [lessonId]
    );

    if (lessonRows.length === 0) {
      return res.status(404).json({ message: "Aula não encontrada" });
    }

    const lesson = lessonRows[0];

    // Obter todos os conteúdos da aula
    const [contentsRows]: any = await pool.query(
      `SELECT 
        lc.id,
        lc.lesson_id,
        lc.content_type,
        CASE 
          WHEN lc.content_type = 'text' THEN lt.text_title
          WHEN lc.content_type = 'video' THEN lv.video_title
          WHEN lc.content_type = 'activity' THEN 'Atividade ' || lc.id
          WHEN lc.content_type = 'reunion' THEN lr.reunion_title
        END as title,
        CASE 
          WHEN lc.content_type = 'text' THEN SUBSTRING(lt.text_content, 1, 150)
          WHEN lc.content_type = 'video' THEN SUBSTRING(lv.video_content, 1, 150)
          WHEN lc.content_type = 'activity' THEN (
            SELECT SUBSTRING(statement_text, 1, 150) 
            FROM ActivityStatements 
            WHERE lesson_content_id = lc.id 
            ORDER BY question_order 
            LIMIT 1
          )
          WHEN lc.content_type = 'reunion' THEN SUBSTRING(lr.reunion_description, 1, 150)
        END as description,
        CASE 
          WHEN lc.content_type = 'activity' THEN (
            SELECT COUNT(*) > 0
            FROM ActivityStatements ast
            JOIN ActivityOptions ao ON ast.id = ao.statement_id
            JOIN StudentAnswers sa ON ao.id = sa.option_id
            WHERE ast.lesson_content_id = lc.id
            AND sa.user_id = ?
          )
          ELSE FALSE
        END as completed
      FROM LessonContents lc
      LEFT JOIN LessonText lt ON lc.id = lt.lesson_content_id AND lc.content_type = 'text'
      LEFT JOIN LessonVideo lv ON lc.id = lv.lesson_content_id AND lc.content_type = 'video'
      LEFT JOIN LessonReunions lr ON lc.id = lr.lesson_content_id AND lc.content_type = 'reunion'
      WHERE lc.lesson_id = ?
      ORDER BY lc.id`,
      [userId, lessonId]
    );

    return res.status(200).json({
      lesson,
      contents: contentsRows
    });
  } catch (error) {
    console.error('Lesson API Error:', error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
}