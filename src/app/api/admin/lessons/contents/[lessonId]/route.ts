import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2/promise";

export async function GET(request: NextRequest) {
    // Get route parameters from URL
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const lessonId = pathSegments[pathSegments.indexOf('contents') + 1];
    
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';
    const sortColumn = searchParams.get('sortColumn') || 'lc.id';
    const sortDirection = searchParams.get('sortDirection') || 'asc';
    const filters = searchParams.get('filters') || '[]';

    const offset = (Number(page) - 1) * Number(limit);

    try {
        // First check if the lesson exists
        const [lessonCheck] = await pool.query<RowDataPacket[]>(
            "SELECT id, title FROM Lessons WHERE id = ?",
            [lessonId]
        );

        if (lessonCheck.length === 0) {
            return NextResponse.json(
                { message: "Aula não encontrada" },
                { status: 404 }
            );
        }

        const lessonInfo = lessonCheck[0];

        // Simplificada a consulta para não retornar múltiplos enunciados por atividade
        const [rows] = await pool.query<RowDataPacket[]>(
            `SELECT 
                lc.id,
                lc.content_type,
                lc.created_at,
                CASE 
                    WHEN lc.content_type = 'text' THEN lt.text_title
                    WHEN lc.content_type = 'video' THEN lv.video_title
                    WHEN lc.content_type = 'reunion' THEN lr.reunion_title
                    WHEN lc.content_type = 'activity' THEN 'Atividade' -- Título fixo para atividades
                END as title,
                CASE 
                    WHEN lc.content_type = 'video' THEN lv.video_url
                    WHEN lc.content_type = 'reunion' THEN lr.reunion_url
                    ELSE NULL
                END as url,
                CASE 
                    WHEN lc.content_type = 'text' THEN lt.text_content
                    WHEN lc.content_type = 'video' THEN lv.video_content
                    WHEN lc.content_type = 'reunion' THEN lr.reunion_description
                    ELSE NULL
                END as description
            FROM LessonContents lc
            LEFT JOIN LessonText lt ON lc.id = lt.lesson_content_id AND lc.content_type = 'text'
            LEFT JOIN LessonVideo lv ON lc.id = lv.lesson_content_id AND lc.content_type = 'video'
            LEFT JOIN LessonReunions lr ON lc.id = lr.lesson_content_id AND lc.content_type = 'reunion'
            WHERE lc.lesson_id = ?
            ORDER BY ${sortColumn === "title" ? "title" : sortColumn} ${sortDirection}
            LIMIT ? OFFSET ?`,
            [lessonId, Number(limit), offset]
        );

        const [totalRows] = await pool.query<RowDataPacket[]>(
            `SELECT COUNT(*) as total 
            FROM LessonContents lc
            WHERE lc.lesson_id = ?`,
            [lessonId]
        );

        return NextResponse.json({
            lesson: lessonInfo,
            contents: rows,
            total: totalRows[0].total
        });
    } catch (error: any) {
        return NextResponse.json(
            { message: `Error fetching lesson contents: ${error.message}` },
            { status: 500 }
        );
    }
}