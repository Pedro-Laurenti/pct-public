import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2/promise";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = searchParams.get('page') || '1';
  const limit = searchParams.get('limit') || '10';
  const sortColumn = searchParams.get('sortColumn') || 'lc.id';
  const sortDirection = searchParams.get('sortDirection') || 'asc';

  const offset = (Number(page) - 1) * Number(limit);

  try {
    // Query que busca todos os conteúdos com suas respectivas aulas e turmas
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        lc.id as content_id,
        lc.content_type,
        l.id as lesson_id,
        l.title as lesson_title,
        GROUP_CONCAT(DISTINCT cl.name SEPARATOR ', ') as class_names,
        CASE 
          WHEN lc.content_type = 'text' THEN lt.text_title
          WHEN lc.content_type = 'video' THEN lv.video_title
          WHEN lc.content_type = 'reunion' THEN lr.reunion_title
          WHEN lc.content_type = 'activity' THEN 'Atividade' -- Título fixo para atividades
        END as title,
        lc.created_at
      FROM LessonContents lc
      INNER JOIN Lessons l ON lc.lesson_id = l.id
      INNER JOIN Courses c ON l.course_id = c.id
      LEFT JOIN Classes cl ON cl.course_id = c.id
      LEFT JOIN LessonText lt ON lc.id = lt.lesson_content_id AND lc.content_type = 'text'
      LEFT JOIN LessonVideo lv ON lc.id = lv.lesson_content_id AND lc.content_type = 'video'
      LEFT JOIN LessonReunions lr ON lc.id = lr.lesson_content_id AND lc.content_type = 'reunion'
      GROUP BY lc.id, lc.content_type, l.id, l.title, lc.created_at, lt.text_title, lv.video_title, lr.reunion_title
      ORDER BY ${sortColumn} ${sortDirection}
      LIMIT ? OFFSET ?`,
      [Number(limit), offset]
    );

    const [totalRows] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(DISTINCT lc.id) as total 
      FROM LessonContents lc`
    );

    return NextResponse.json({
      contents: rows,
      total: totalRows[0].total
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: `Error fetching contents: ${error.message}` },
      { status: 500 }
    );
  }
}