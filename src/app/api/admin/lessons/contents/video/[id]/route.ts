import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2/promise";

export async function PUT(request: NextRequest) {
    // Get route parameters from URL
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.indexOf('video') + 1];
    const body = await request.json();
    const { videoTitle, videoUrl, videoContent } = body;
    
    // Validação
    if (!videoTitle || !videoUrl) {
        return NextResponse.json(
            { message: "Título e URL são obrigatórios" },
            { status: 400 }
        );
    }
    
    try {
        // Verificar se o conteúdo base existe e é do tipo vídeo
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
        
        if (contentCheck[0].content_type !== 'video') {
            return NextResponse.json(
                { message: "O conteúdo não é do tipo vídeo" },
                { status: 400 }
            );
        }
        
        // Verificar se existe o registro na tabela LessonVideo
        const [videoCheck] = await pool.query<RowDataPacket[]>(
            "SELECT id FROM LessonVideo WHERE lesson_content_id = ?",
            [id]
        );
        
        if (videoCheck.length === 0) {
            return NextResponse.json(
                { message: "Detalhes do vídeo não encontrados" },
                { status: 404 }
            );
        }
        
        // Atualizar o conteúdo de vídeo
        await pool.query(
            "UPDATE LessonVideo SET video_title = ?, video_url = ?, video_content = ? WHERE lesson_content_id = ?",
            [videoTitle, videoUrl, videoContent || null, id]
        );
        
        return NextResponse.json({ message: "Conteúdo de vídeo atualizado com sucesso" });
    } catch (error: any) {
        return NextResponse.json(
            { message: `Erro ao atualizar conteúdo de vídeo: ${error.message}` },
            { status: 500 }
        );
    }
}