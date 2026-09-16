import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2/promise";

export async function GET(request: NextRequest) {
  try {
    // Buscar estatísticas do banco de dados
    const [userCount] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) as total FROM Users"
    );

    const [courseCount] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) as total FROM Courses"
    );

    const [classCount] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) as total FROM Classes"
    );

    const [lessonCount] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) as total FROM Lessons"
    );

    const [contentCount] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) as total FROM LessonContents"
    );

    // Responder com as estatísticas
    return NextResponse.json({
      totalUsers: userCount[0].total,
      totalCourses: courseCount[0].total,
      totalClasses: classCount[0].total,
      totalLessons: lessonCount[0].total,
      totalContents: contentCount[0].total
    });
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error);
    return NextResponse.json(
      { message: "Erro ao buscar estatísticas do dashboard" },
      { status: 500 }
    );
  }
}