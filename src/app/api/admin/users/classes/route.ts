import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2/promise";

export async function GET(request: NextRequest) {
    try {
        const [rows] = await pool.query<RowDataPacket[]>(`
            SELECT 
                Classes.id AS class_id,
                Classes.name AS class_name,
                Courses.name AS course_name
            FROM Classes
            LEFT JOIN Courses ON Classes.course_id = Courses.id
        `);

        return NextResponse.json({ classes: rows });
    } catch (error) {
        return NextResponse.json(
            { message: "Erro ao buscar turmas." },
            { status: 500 }
        );
    }
}