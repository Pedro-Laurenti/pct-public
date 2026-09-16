import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { SECRET_KEY } from "@/lib/auth";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }

  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    const userId = payload.userId as number;

    const [[pendingRows], [reunionRows]]: any = await Promise.all([
      pool.query(
        `SELECT
           lc.id AS content_id,
           l.id AS lesson_id,
           l.title AS lesson_title,
           c.name AS course_name
         FROM LessonContents lc
         JOIN Lessons l ON lc.lesson_id = l.id
         JOIN Courses c ON l.course_id = c.id
         JOIN Classes cl ON c.id = cl.course_id
         JOIN ClassUsers cu ON cl.id = cu.class_id AND cu.user_id = ?
         WHERE lc.content_type = 'activity'
           AND lc.id NOT IN (
             SELECT DISTINCT ast.lesson_content_id
             FROM ActivityStatements ast
             JOIN ActivityOptions ao ON ast.id = ao.statement_id
             JOIN StudentAnswers sa ON ao.id = sa.option_id AND sa.user_id = ?
           )
         ORDER BY lc.id DESC
         LIMIT 5`,
        [userId, userId]
      ),
      pool.query(
        `SELECT
           lc.id AS content_id,
           l.id AS lesson_id,
           lr.reunion_title,
           rs.scheduled_date,
           rs.scheduled_time
         FROM LessonContents lc
         JOIN Lessons l ON lc.lesson_id = l.id
         JOIN LessonReunions lr ON lc.id = lr.lesson_content_id
         JOIN ReunionSchedules rs ON lr.id = rs.reunion_id
         JOIN Classes cl ON l.course_id = cl.course_id
         JOIN ClassUsers cu ON cl.id = cu.class_id AND cu.user_id = ?
         WHERE lc.content_type = 'reunion'
           AND rs.scheduled_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
         ORDER BY rs.scheduled_date ASC, rs.scheduled_time ASC
         LIMIT 5`,
        [userId]
      ),
    ]);

    return NextResponse.json({
      pendingActivities: pendingRows,
      upcomingReunions: reunionRows,
      total: pendingRows.length + reunionRows.length,
    });
  } catch (error) {
    console.error("Notifications API Error:", error);
    return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 });
  }
}
