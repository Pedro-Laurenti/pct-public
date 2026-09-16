import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2/promise";

export async function GET(request: NextRequest) {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        id, 
        name, 
        course_id,
        created_at
      FROM Classes
      ORDER BY name ASC`
    );

    return NextResponse.json({
      classes: rows
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: `Error fetching classes: ${error.message}` },
      { status: 500 }
    );
  }
}