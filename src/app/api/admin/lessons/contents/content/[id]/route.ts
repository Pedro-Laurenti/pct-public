import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2/promise";

export async function GET(request: NextRequest) {
    // Get route parameters from URL
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.indexOf('content') + 1];
    
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');

    try {
        // Verificar o tipo de conteúdo primeiro
        const [contentCheck] = await pool.query<RowDataPacket[]>(
            "SELECT id, content_type FROM LessonContents WHERE id = ?",
            [id]
        );

        if (contentCheck.length === 0) {
            return NextResponse.json(
                { message: "Conteúdo não encontrado" },
                { status: 404 }
            );
        }

        const contentType = type || contentCheck[0].content_type;

        // Buscar detalhes específicos com base no tipo
        let content: any = { id: contentCheck[0].id, content_type: contentCheck[0].content_type };

        if (contentType === 'text') {
            // Buscar detalhes de texto
            const [textDetails] = await pool.query<RowDataPacket[]>(
                "SELECT text_title, text_content FROM LessonText WHERE lesson_content_id = ?",
                [id]
            );

            if (textDetails.length > 0) {
                content.title = textDetails[0].text_title;
                content.textContent = textDetails[0].text_content;
            }
        } else if (contentType === 'video') {
            // Buscar detalhes de vídeo
            const [videoDetails] = await pool.query<RowDataPacket[]>(
                "SELECT video_title, video_url, video_content FROM LessonVideo WHERE lesson_content_id = ?",
                [id]
            );

            if (videoDetails.length > 0) {
                content.title = videoDetails[0].video_title;
                content.url = videoDetails[0].video_url;
                content.description = videoDetails[0].video_content;
            }
        } else if (contentType === 'reunion') {
            // Buscar detalhes de reunião
            const [reunionDetails] = await pool.query<RowDataPacket[]>(
                `SELECT r.reunion_title, r.reunion_url, r.reunion_description, 
                  s.scheduled_date, s.scheduled_time, s.duration_minutes 
                FROM LessonReunions r
                LEFT JOIN ReunionSchedules s ON s.reunion_id = r.id
                WHERE r.lesson_content_id = ?`,
                [id]
            );

            if (reunionDetails.length > 0) {
                content.title = reunionDetails[0].reunion_title;
                content.url = reunionDetails[0].reunion_url;
                content.description = reunionDetails[0].reunion_description;
                
                if (reunionDetails[0].scheduled_date && reunionDetails[0].scheduled_time) {
                    const date = new Date(reunionDetails[0].scheduled_date);
                    const timeParts = reunionDetails[0].scheduled_time.split(':');
                    date.setHours(parseInt(timeParts[0], 10));
                    date.setMinutes(parseInt(timeParts[1], 10));
                    content.date = date.toISOString();
                    content.time = `${timeParts[0]}:${timeParts[1]}`;
                }
                
                content.duration = reunionDetails[0].duration_minutes;
            }
        } else if (contentType === 'activity') {
            // Buscar perguntas e opções da atividade
            const [statements] = await pool.query<RowDataPacket[]>(
                `SELECT id, statement_text 
                FROM ActivityStatements 
                WHERE lesson_content_id = ?
                ORDER BY question_order ASC`,
                [id]
            );

            const questions = [];

            for (const statement of statements) {
                const [options] = await pool.query<RowDataPacket[]>(
                    `SELECT id, option_text, is_correct 
                    FROM ActivityOptions 
                    WHERE statement_id = ?
                    ORDER BY option_order ASC`,
                    [statement.id]
                );

                questions.push({
                    id: statement.id,
                    statement: statement.statement_text,
                    options: options.map((opt: any) => ({
                        id: opt.id,
                        text: opt.option_text,
                        correct: opt.is_correct === 1
                    }))
                });
            }

            content.questions = questions;
        }

        return NextResponse.json({ content });
    } catch (error: any) {
        console.error("Erro ao buscar detalhes do conteúdo:", error);
        return NextResponse.json(
            { message: `Erro ao buscar detalhes do conteúdo: ${error.message}` },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    // Get route parameters from URL
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.indexOf('content') + 1];

    try {
        // Verificar se o conteúdo existe
        const [contentCheck] = await pool.query<RowDataPacket[]>(
            "SELECT id, content_type FROM LessonContents WHERE id = ?",
            [id]
        );

        if (contentCheck.length === 0) {
            return NextResponse.json(
                { message: "Conteúdo não encontrado" },
                { status: 404 }
            );
        }

        const contentType = contentCheck[0].content_type;

        // Iniciar transação para garantir consistência
        await pool.query("START TRANSACTION");

        try {
            // Excluir o registro específico conforme o tipo
            if (contentType === 'text') {
                await pool.query("DELETE FROM LessonText WHERE lesson_content_id = ?", [id]);
            } else if (contentType === 'video') {
                await pool.query("DELETE FROM LessonVideo WHERE lesson_content_id = ?", [id]);
            } else if (contentType === 'activity') {
                const [statements] = await pool.query<RowDataPacket[]>(
                    "SELECT id FROM ActivityStatements WHERE lesson_content_id = ?", [id]
                );
                
                for (const statement of statements) {
                    await pool.query(
                        "DELETE FROM ActivityOptions WHERE statement_id = ?", 
                        [statement.id]
                    );
                }
                
                await pool.query("DELETE FROM ActivityStatements WHERE lesson_content_id = ?", [id]);
            } else if (contentType === 'reunion') {
                const [reunions] = await pool.query<RowDataPacket[]>(
                    "SELECT id FROM LessonReunions WHERE lesson_content_id = ?", [id]
                );
                
                for (const reunion of reunions) {
                    await pool.query(
                        "DELETE FROM ReunionSchedules WHERE reunion_id = ?", 
                        [reunion.id]
                    );
                }
                
                await pool.query("DELETE FROM LessonReunions WHERE lesson_content_id = ?", [id]);
            }

            // Finalmente, excluir o conteúdo base
            await pool.query("DELETE FROM LessonContents WHERE id = ?", [id]);
            
            // Confirmar transação
            await pool.query("COMMIT");
            
            return NextResponse.json({
                message: "Conteúdo excluído com sucesso"
            });
        } catch (error) {
            // Reverter transação em caso de erro
            await pool.query("ROLLBACK");
            throw error;
        }
    } catch (error: any) {
        console.error("Erro ao excluir conteúdo:", error);
        return NextResponse.json({ 
            message: `Erro ao excluir conteúdo: ${error.message}` 
        }, { status: 500 });
    }
}