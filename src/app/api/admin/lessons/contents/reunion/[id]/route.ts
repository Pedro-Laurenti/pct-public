import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2/promise";

export async function PUT(request: NextRequest) {
    // Get route parameters from URL
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.indexOf('reunion') + 1];
    const body = await request.json();
    const { reunionTitle, reunionUrl, reunionDescription, date, durationMinutes } = body;
    
    // Validação
    if (!reunionTitle || !reunionUrl || !date || !durationMinutes) {
        return NextResponse.json(
            { message: "Campos obrigatórios faltando" },
            { status: 400 }
        );
    }
    
    try {
        // Começar uma transação para garantir consistência
        await pool.query("START TRANSACTION");
        
        try {
            // Verificar se o conteúdo base existe e é do tipo reunião
            const [contentCheck] = await pool.query<RowDataPacket[]>(
                "SELECT lc.id, lc.content_type FROM LessonContents lc WHERE lc.id = ?",
                [id]
            );
            
            if (contentCheck.length === 0) {
                throw new Error("Conteúdo não encontrado");
            }
            
            if (contentCheck[0].content_type !== 'reunion') {
                throw new Error("O conteúdo não é do tipo reunião");
            }
            
            // Verificar se existe o registro na tabela LessonReunions
            const [reunionCheck] = await pool.query<RowDataPacket[]>(
                "SELECT id FROM LessonReunions WHERE lesson_content_id = ?",
                [id]
            );
            
            if (reunionCheck.length === 0) {
                throw new Error("Detalhes da reunião não encontrados");
            }
            
            const reunionId = reunionCheck[0].id;
            
            // Atualizar o conteúdo da reunião
            await pool.query(
                "UPDATE LessonReunions SET reunion_title = ?, reunion_url = ?, reunion_description = ? WHERE lesson_content_id = ?",
                [reunionTitle, reunionUrl, reunionDescription || null, id]
            );
            
            // Atualizar o agendamento da reunião
            await pool.query(
                "UPDATE ReunionSchedules SET scheduled_date = ?, duration_minutes = ? WHERE reunion_id = ?",
                [new Date(date), durationMinutes, reunionId]
            );
            
            // Confirmar a transação
            await pool.query("COMMIT");
            
            return NextResponse.json({ message: "Reunião atualizada com sucesso" });
        } catch (error) {
            // Reverter a transação em caso de erro
            await pool.query("ROLLBACK");
            throw error;
        }
    } catch (error: any) {
        return NextResponse.json(
            { message: `Erro ao atualizar reunião: ${error.message}` },
            { status: 500 }
        );
    }
}