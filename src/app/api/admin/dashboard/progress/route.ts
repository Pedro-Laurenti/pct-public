import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2/promise";

export async function GET(request: NextRequest) {
  try {
    // Buscar estatísticas de atividades realizadas e pendentes por classe
    const [classProgress] = await pool.query<RowDataPacket[]>(`
      SELECT 
        c.id as class_id,
        c.name as class_name,
        COUNT(DISTINCT cu.user_id) as total_students,
        COUNT(DISTINCT l.id) as total_lessons,
        COUNT(DISTINCT lc.id) as total_contents,
        (
          SELECT COUNT(DISTINCT sa.id) 
          FROM StudentAnswers sa 
          JOIN Users u ON sa.user_id = u.id
          JOIN ClassUsers cu2 ON u.id = cu2.user_id
          WHERE cu2.class_id = c.id
        ) as completed_activities
      FROM Classes c
      LEFT JOIN ClassUsers cu ON c.id = cu.class_id
      LEFT JOIN Courses co ON c.course_id = co.id
      LEFT JOIN Lessons l ON co.id = l.course_id
      LEFT JOIN LessonContents lc ON l.id = lc.lesson_id
      GROUP BY c.id
      LIMIT 5
    `);

    // Buscar progresso por tipo de conteúdo
    const [contentProgress] = await pool.query<RowDataPacket[]>(`
      SELECT 
        lc.content_type,
        COUNT(lc.id) as total,
        SUM(CASE WHEN sa.id IS NOT NULL THEN 1 ELSE 0 END) as completed
      FROM LessonContents lc
      LEFT JOIN ActivityStatements ast ON lc.id = ast.lesson_content_id AND lc.content_type = 'activity'
      LEFT JOIN ActivityOptions ao ON ast.id = ao.statement_id
      LEFT JOIN StudentAnswers sa ON ao.id = sa.option_id
      GROUP BY lc.content_type
    `);

    // Buscar atividades recentes com taxa de acerto
    const [recentActivitiesPerformance] = await pool.query<RowDataPacket[]>(`
      SELECT 
        ast.id as activity_id,
        l.id as lesson_id,
        l.title as lesson_name,
        COUNT(DISTINCT sa.user_id) as students_attempted,
        SUM(CASE WHEN ao.is_correct = 1 THEN 1 ELSE 0 END) as correct_answers,
        COUNT(sa.id) as total_answers,
        (SUM(CASE WHEN ao.is_correct = 1 THEN 1 ELSE 0 END) / COUNT(sa.id) * 100) as success_rate
      FROM ActivityStatements ast
      JOIN LessonContents lc ON ast.lesson_content_id = lc.id
      JOIN Lessons l ON lc.lesson_id = l.id
      LEFT JOIN ActivityOptions ao ON ast.id = ao.statement_id
      LEFT JOIN StudentAnswers sa ON ao.id = sa.option_id
      WHERE sa.id IS NOT NULL
      GROUP BY ast.id, l.id, l.title
      ORDER BY ast.id DESC
      LIMIT 5
    `);

    // Responder com os dados
    return NextResponse.json({
      classProgress,
      contentProgress,
      recentActivitiesPerformance
    });
  } catch (error) {
    console.error("Erro ao buscar progresso:", error);
    return NextResponse.json(
      { message: "Erro ao buscar dados de progresso" },
      { status: 500 }
    );
  }
}