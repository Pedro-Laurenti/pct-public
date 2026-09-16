import { NextResponse } from 'next/server';
import pool from "@/lib/db";
import { jwtVerify } from "jose";
import { cookies } from 'next/headers';
import { SECRET_KEY } from "@/lib/auth";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }

  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    const userId = payload.userId as number;

    const [rows]: any = await pool.query(
      `SELECT
         lc.id AS content_id,
         l.id AS lesson_id,
         l.title AS lesson_title,
         c.name AS course_name,
         COUNT(DISTINCT ast.id) AS total_questions,
         SUM(CASE WHEN ao.is_correct = 1 AND sa.option_id IS NOT NULL THEN 1 ELSE 0 END) AS correct_answers,
         COUNT(DISTINCT CASE WHEN sa.user_id = ? AND sa.option_id IS NOT NULL THEN ast.id END) AS answered_questions
       FROM LessonContents lc
       JOIN Lessons l ON lc.lesson_id = l.id
       JOIN Courses c ON l.course_id = c.id
       JOIN Classes cl ON c.id = cl.course_id
       JOIN ClassUsers cu ON cl.id = cu.class_id AND cu.user_id = ?
       JOIN ActivityStatements ast ON lc.id = ast.lesson_content_id
       LEFT JOIN ActivityOptions ao ON ast.id = ao.statement_id
       LEFT JOIN StudentAnswers sa ON ao.id = sa.option_id AND sa.user_id = ?
       WHERE lc.content_type = 'activity'
       GROUP BY lc.id, l.id, l.title, c.name
       HAVING answered_questions > 0
       ORDER BY l.id`,
      [userId, userId, userId]
    );

    return NextResponse.json({ activities: rows });
  } catch (error) {
    console.error('Activities API Error:', error);
    return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 });
  }
}
