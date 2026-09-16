import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2/promise";

export async function GET(request: NextRequest) {
  try {
    // Buscar usuários recentes
    const [recentUsers] = await pool.query<RowDataPacket[]>(
      "SELECT id, name, email, role, created_at FROM Users ORDER BY created_at DESC LIMIT 5"
    );

    // Buscar cursos mais populares (com mais classes ou alunos)
    const [popularCourses] = await pool.query<RowDataPacket[]>(`
      SELECT c.id, c.name, c.description, COUNT(cl.id) as class_count, 
        (SELECT COUNT(DISTINCT cu.user_id) FROM ClassUsers cu 
         JOIN Classes cls ON cu.class_id = cls.id 
         WHERE cls.course_id = c.id) as student_count
      FROM Courses c
      LEFT JOIN Classes cl ON c.id = cl.course_id
      GROUP BY c.id
      ORDER BY student_count DESC, class_count DESC
      LIMIT 5
    `);
    
    // Aulas recentes com contagem de alunos matriculados
    const [upcomingLessons] = await pool.query<RowDataPacket[]>(`
      SELECT l.id, l.title, l.course_id,
        c.name as course_name,
        COUNT(DISTINCT cu.user_id) as student_count
      FROM Lessons l
      LEFT JOIN Courses c ON l.course_id = c.id
      LEFT JOIN Classes cl ON c.id = cl.course_id
      LEFT JOIN ClassUsers cu ON cl.id = cu.class_id
      GROUP BY l.id, c.name
      ORDER BY l.created_at DESC
      LIMIT 5
    `);

    // Atividades recentes (respostas de alunos)
    const [recentActivities] = await pool.query<RowDataPacket[]>(`
      SELECT sa.id, sa.created_at, u.name as user_name, u.id as user_id,
        a.statement_text, a.id as statement_id,
        l.title as lesson_title, l.id as lesson_id
      FROM StudentAnswers sa
      JOIN Users u ON sa.user_id = u.id
      JOIN ActivityOptions ao ON sa.option_id = ao.id
      JOIN ActivityStatements a ON ao.statement_id = a.id
      JOIN LessonContents lc ON a.lesson_content_id = lc.id
      JOIN Lessons l ON lc.lesson_id = l.id
      ORDER BY sa.created_at DESC
      LIMIT 10
    `);

    // Estatísticas por tipo de conteúdo
    const [contentStats] = await pool.query<RowDataPacket[]>(`
      SELECT content_type, COUNT(*) as count 
      FROM LessonContents 
      GROUP BY content_type
    `);

    // Preparar dados de estatísticas por tipo de conteúdo
    const contentTypeStats = {
      video: 0,
      text: 0,
      activity: 0,
      reunion: 0
    };

    contentStats.forEach((stat: RowDataPacket) => {
      const contentType = stat.content_type as keyof typeof contentTypeStats;
      contentTypeStats[contentType] = stat.count;
    });

    // Responder com os dados
    return NextResponse.json({
      recentUsers,
      popularCourses,
      upcomingLessons,
      recentActivities,
      contentTypeStats
    });
  } catch (error) {
    console.error("Erro ao buscar estatísticas detalhadas:", error);
    return NextResponse.json(
      { message: "Erro ao buscar estatísticas detalhadas" },
      { status: 500 }
    );
  }
}