import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    
    // Se não fornecido, use o mês e ano atuais
    const currentDate = new Date();
    const currentMonth = month ? parseInt(month) : currentDate.getMonth() + 1;
    const currentYear = year ? parseInt(year) : currentDate.getFullYear();
    
    // Query para buscar reuniões para o mês/ano especificado
    const [reunions] = await pool.query<RowDataPacket[]>(
      `SELECT rs.id, rs.scheduled_date, rs.scheduled_time, rs.duration_minutes, 
       lr.id AS reunion_id, lr.reunion_title, lr.reunion_description, lr.reunion_url,
       lr.lesson_content_id
       FROM ReunionSchedules rs 
       INNER JOIN LessonReunions lr ON rs.reunion_id = lr.id 
       WHERE MONTH(rs.scheduled_date) = ? AND YEAR(rs.scheduled_date) = ?
       ORDER BY rs.scheduled_date, rs.scheduled_time`,
      [currentMonth, currentYear]
    );

    return NextResponse.json({
      reunions,
      month: currentMonth,
      year: currentYear
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reunion_id, scheduled_date, scheduled_time, duration_minutes } = body;

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO ReunionSchedules (reunion_id, scheduled_date, scheduled_time, duration_minutes) 
       VALUES (?, ?, ?, ?)`,
      [reunion_id, scheduled_date, scheduled_time, duration_minutes]
    );

    return NextResponse.json(
      { id: result.insertId, message: "Reunion scheduled successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, scheduled_date, scheduled_time, duration_minutes } = body;

    await pool.query(
      `UPDATE ReunionSchedules 
       SET scheduled_date = ?, scheduled_time = ?, duration_minutes = ? 
       WHERE id = ?`,
      [scheduled_date, scheduled_time, duration_minutes, id]
    );

    return NextResponse.json(
      { message: "Reunion updated successfully" }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { message: "ID parameter is required" },
        { status: 400 }
      );
    }

    await pool.query(
      `DELETE FROM ReunionSchedules WHERE id = ?`,
      [id]
    );

    return NextResponse.json(
      { message: "Reunion deleted successfully" }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}