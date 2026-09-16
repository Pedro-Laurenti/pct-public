import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2/promise";

export async function GET(request: NextRequest) {
  try {
    // Buscar todos os cursos de forma simples
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        id,
        name,
        description
      FROM Courses
      ORDER BY name ASC`
    );

    return NextResponse.json({
      courses: rows
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { message: "Erro interno ao buscar cursos." },
      { status: 500 }
    );
  }
}
