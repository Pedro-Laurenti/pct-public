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

    if (request.method === "GET") {
        try {
            const [rows] = await pool.query(
                `
                SELECT id, name
                FROM Classes
                WHERE course_id IS NULL OR course_id != ?
                `,
                [id]
            );

            return NextResponse.json({ classes: rows }, { status: 200 });
        } catch (error) {
            return NextResponse.json({ message: "Erro interno ao buscar turmas." }, { status: 500 });
        }
    } else if (request.method === "POST") {
        const body = await request.json();
        const { classIds } = body;

        if (!Array.isArray(classIds) || classIds.some((classId) => isNaN(Number(classId)))) {
            return NextResponse.json({ message: "IDs de turmas inválidos." }, { status: 400 });
        }

        try {
            await pool.query(
                `
                UPDATE Classes
                SET course_id = ?
                WHERE id IN (?)
                `,
                [id, classIds]
            );

            return NextResponse.json({ message: "Turmas vinculadas ao curso com sucesso." }, { status: 200 });
        } catch (error) {
            return NextResponse.json({ message: "Erro interno ao vincular turmas." }, { status: 500 });
        }
    } else {
        return NextResponse.json({ message: "Método não permitido." }, { status: 405 });
    }
}