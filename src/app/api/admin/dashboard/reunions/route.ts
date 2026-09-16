import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2/promise";

export async function GET(request: NextRequest) {
  try {
    // Estatísticas gerais de reuniões
    const [reunionStats] = await pool.query<RowDataPacket[]>(`
      SELECT 
        COUNT(*) as total_reunions,
        COUNT(DISTINCT l.id) as lessons_with_reunions,
        COUNT(DISTINCT c.id) as courses_with_reunions
      FROM LessonReunions lr
      JOIN LessonContents lc ON lr.lesson_content_id = lc.id
      JOIN Lessons l ON lc.lesson_id = l.id
      JOIN Courses c ON l.course_id = c.id
    `);

    // Próximas reuniões agendadas
    const [upcomingReunions] = await pool.query<RowDataPacket[]>(`
      SELECT 
        rs.id,
        lr.id as reunion_id,
        rs.scheduled_date,
        rs.scheduled_time,
        rs.duration_minutes,
        lr.reunion_title,
        l.title as lesson_title,
        c.name as course_name,
        COUNT(DISTINCT cu.user_id) as participant_count
      FROM ReunionSchedules rs
      JOIN LessonReunions lr ON rs.reunion_id = lr.id
      JOIN LessonContents lc ON lr.lesson_content_id = lc.id
      JOIN Lessons l ON lc.lesson_id = l.id
      JOIN Courses c ON l.course_id = c.id
      LEFT JOIN Classes cls ON c.id = cls.course_id
      LEFT JOIN ClassUsers cu ON cls.id = cu.class_id
      WHERE rs.scheduled_date >= CURDATE()
      GROUP BY rs.id, lr.id, rs.scheduled_date, rs.scheduled_time, rs.duration_minutes, lr.reunion_title, l.title, c.name
      ORDER BY rs.scheduled_date, rs.scheduled_time
      LIMIT 5
    `);

    // Reuniões por curso
    const [reunionsByCourse] = await pool.query<RowDataPacket[]>(`
      SELECT 
        c.id,
        c.name,
        COUNT(DISTINCT lr.id) as reunion_count
      FROM Courses c
      JOIN Lessons l ON c.id = l.course_id
      JOIN LessonContents lc ON l.id = lc.lesson_id
      JOIN LessonReunions lr ON lc.id = lr.lesson_content_id
      GROUP BY c.id
      ORDER BY reunion_count DESC
      LIMIT 5
    `);

    // Horários mais populares para reuniões
    const [popularTimes] = await pool.query<RowDataPacket[]>(`
      SELECT 
        HOUR(rs.scheduled_time) as hour,
        COUNT(*) as count
      FROM ReunionSchedules rs
      GROUP BY HOUR(rs.scheduled_time)
      ORDER BY count DESC
      LIMIT 5
    `);

    // Dias da semana mais populares para reuniões
    const [popularDays] = await pool.query<RowDataPacket[]>(`
      SELECT 
        DAYOFWEEK(rs.scheduled_date) as day_of_week,
        COUNT(*) as count
      FROM ReunionSchedules rs
      GROUP BY DAYOFWEEK(rs.scheduled_date)
      ORDER BY count DESC
    `);

    // Preparar dados de dias da semana
    const dayNames = ["", "Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    const daysOfWeek = popularDays.map((day: RowDataPacket) => ({
      day: dayNames[day.day_of_week],
      count: day.count
    }));

    // Responder com os dados
    return NextResponse.json({
      statistics: reunionStats[0],
      upcomingReunions,
      reunionsByCourse,
      popularTimes,
      daysOfWeek
    });
  } catch (error) {
    console.error("Erro ao buscar estatísticas de reuniões:", error);
    return NextResponse.json(
      { message: "Erro ao buscar estatísticas de reuniões" },
      { status: 500 }
    );
  }
}