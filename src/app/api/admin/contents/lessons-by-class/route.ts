import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2/promise";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const classId = searchParams.get('classId');

  if (!classId) {
    return NextResponse.json(
      { message: "Class ID is required" },
      { status: 400 }
    );
  }

  try {
    // Primeiro, obter o course_id da turma selecionada
    const [classRows] = await pool.query<RowDataPacket[]>(
      `SELECT course_id FROM Classes WHERE id = ?`,
      [classId]
    );

    if (classRows.length === 0) {
      return NextResponse.json(
        { message: "Class not found" },
        { status: 404 }
      );
    }

    const courseId = classRows[0].course_id;

    // Buscar todas as aulas do curso associado à turma
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        id, 
        title, 
        lesson_description,
        course_id,
        created_at
      FROM Lessons
      WHERE course_id = ?
      ORDER BY title ASC`,
      [courseId]
    );

    return NextResponse.json({
      lessons: rows
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: `Error fetching lessons: ${error.message}` },
      { status: 500 }
    );
  }
}