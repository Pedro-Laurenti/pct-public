import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";

export async function DELETE(request: NextRequest) {
    // Get route parameters from URL
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.indexOf('lessons') + 1];

    if (!id) {
        return NextResponse.json(
            { message: "ID inválido" },
            { status: 400 }
        );
    }

    try {
        // Verifica se a aula existe
        const [lessonCheck] = await pool.query<RowDataPacket[]>(
            "SELECT id FROM Lessons WHERE id = ?",
            [id]
        );
        
        if (lessonCheck.length === 0) {
            return NextResponse.json(
                { message: "Aula não encontrada" },
                { status: 404 }
            );
        }
        
        // Verifica se existem conteúdos relacionados
        const [contentCheck] = await pool.query<RowDataPacket[]>(
            "SELECT id FROM LessonContents WHERE lesson_id = ?",
            [id]
        );
        
        if (contentCheck.length > 0) {
            // Se houver conteúdos, primeiro excluímos todos eles
            await pool.query(
                "DELETE FROM LessonContents WHERE lesson_id = ?",
                [id]
            );
        }
        
        // Agora excluímos a aula
        await pool.query(
            "DELETE FROM Lessons WHERE id = ?",
            [id]
        );
        
        return NextResponse.json(
            { message: "Aula excluída com sucesso" }
        );
    } catch (error: any) {
        return NextResponse.json(
            { message: `Erro ao excluir aula: ${error.message}` },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    // Get route parameters from URL
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.indexOf('lessons') + 1];

    try {
        // Buscar detalhes de uma aula específica
        const [lesson] = await pool.query<RowDataPacket[]>(
            `SELECT 
                l.id, l.title, l.lesson_description, l.course_id, 
                c.name as course_name, l.created_at
            FROM Lessons l
            JOIN Courses c ON l.course_id = c.id
            WHERE l.id = ?`,
            [id]
        );
        
        if (lesson.length === 0) {
            return NextResponse.json(
                { message: "Aula não encontrada" },
                { status: 404 }
            );
        }
        
        return NextResponse.json({ lesson: lesson[0] });
    } catch (error: any) {
        return NextResponse.json(
            { message: `Erro ao buscar detalhes da aula: ${error.message}` },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    // Get route parameters from URL
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.indexOf('lessons') + 1];
    const body = await request.json();
    const { title, lesson_description, course_id } = body;
    
    // Validação
    if (!title || !course_id) {
        return NextResponse.json(
            { message: "Título e curso são obrigatórios" },
            { status: 400 }
        );
    }
    
    try {
        // Verificar se o curso existe
        const [courseCheck] = await pool.query<RowDataPacket[]>(
            "SELECT id FROM Courses WHERE id = ?",
            [course_id]
        );
        
        if (courseCheck.length === 0) {
            return NextResponse.json(
                { message: "Curso não encontrado" },
                { status: 404 }
            );
        }
        
        // Atualizar a aula
        await pool.query(
            "UPDATE Lessons SET title = ?, lesson_description = ?, course_id = ? WHERE id = ?",
            [title, lesson_description || null, course_id, id]
        );
        
        return NextResponse.json({ message: "Aula atualizada com sucesso" });
    } catch (error: any) {
        return NextResponse.json(
            { message: `Erro ao atualizar aula: ${error.message}` },
            { status: 500 }
        );
    }
}