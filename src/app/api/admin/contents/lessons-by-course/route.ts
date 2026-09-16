import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2/promise";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const courseId = searchParams.get('courseId');

  if (!courseId) {
    return NextResponse.json(
      { message: "courseId é obrigatório" },
      { status: 400 }
    );
  }

  try {
    // Buscar todas as aulas do curso selecionado
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        l.id,
        l.title,
        l.course_id,
        l.lesson_description,
        c.name as course_name
      FROM Lessons l
      INNER JOIN Courses c ON l.course_id = c.id
      WHERE l.course_id = ?
      ORDER BY l.title ASC`,
      [courseId]
    );

    return NextResponse.json({
      lessons: rows
    });
  } catch (error) {
    console.error("Error fetching lessons by course:", error);
    return NextResponse.json(
      { message: "Erro interno ao buscar aulas do curso." },
      { status: 500 }
    );
  }
}
