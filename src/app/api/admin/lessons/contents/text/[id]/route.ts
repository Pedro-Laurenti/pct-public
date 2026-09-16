import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2/promise";

export async function PUT(request: NextRequest) {
    // Get route parameters from URL
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.indexOf('text') + 1];
    const body = await request.json();
    const { textTitle, textContent } = body;
    
    // Validação
    if (!textTitle || !textContent) {
        return NextResponse.json(
            { message: "Título e conteúdo são obrigatórios" },
            { status: 400 }
        );
    }
    
    try {
        // Verificar se o conteúdo base existe e é do tipo texto
        const [contentCheck] = await pool.query<RowDataPacket[]>(
            "SELECT lc.id, lc.content_type FROM LessonContents lc WHERE lc.id = ?",
            [id]
        );
        
        if (contentCheck.length === 0) {
            return NextResponse.json(
                { message: "Conteúdo não encontrado" },
                { status: 404 }
            );
        }
        
        if (contentCheck[0].content_type !== 'text') {
            return NextResponse.json(
                { message: "O conteúdo não é do tipo texto" },
                { status: 400 }
            );
        }
        
        // Verificar se existe o registro na tabela LessonText
        const [textCheck] = await pool.query<RowDataPacket[]>(
            "SELECT id FROM LessonText WHERE lesson_content_id = ?",
            [id]
        );
        
        if (textCheck.length === 0) {
            return NextResponse.json(
                { message: "Detalhes do texto não encontrados" },
                { status: 404 }
            );
        }
        
        // Atualizar o conteúdo de texto
        await pool.query(
            "UPDATE LessonText SET text_title = ?, text_content = ? WHERE lesson_content_id = ?",
            [textTitle, textContent, id]
        );
        
        return NextResponse.json({ message: "Conteúdo de texto atualizado com sucesso" });
    } catch (error: any) {
        return NextResponse.json(
            { message: `Erro ao atualizar conteúdo de texto: ${error.message}` },
            { status: 500 }
        );
    }
}