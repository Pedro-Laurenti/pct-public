import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET(request: NextRequest) {
    // Get route parameters from URL
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.indexOf('courses') + 1];

    if (!id || isNaN(Number(id))) {
        return NextResponse.json(
            { message: "ID do curso inválido." }, 
            { status: 400 }
        );
    }

    try {
        const [rows] = await pool.query<RowDataPacket[]>(
            `
            SELECT 
                Classes.id, 
                Classes.name, 
                COUNT(ClassUsers.user_id) AS student_count
            FROM Classes
            LEFT JOIN ClassUsers ON Classes.id = ClassUsers.class_id
            WHERE Classes.course_id = ?
            GROUP BY Classes.id
            `,
            [id]
        );

        return NextResponse.json({ classes: rows });
    } catch (error) {
        return NextResponse.json(
            { message: "Erro interno ao buscar turmas." }, 
            { status: 500 }
        );
    }
}