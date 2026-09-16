import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2/promise";

export async function PUT(request: NextRequest) {
    // Get route parameters from URL
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.indexOf('activity') + 1];
    const body = await request.json();
    const { questions } = body;
    
    // Validação
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
        return NextResponse.json(
            { message: "Campos obrigatórios faltando" },
            { status: 400 }
        );
    }
    
    try {
        // Começar uma transação para garantir consistência
        await pool.query("START TRANSACTION");
        
        try {
            // Verificar se o conteúdo base existe e é do tipo atividade
            const [contentCheck] = await pool.query<RowDataPacket[]>(
                "SELECT lc.id, lc.content_type FROM LessonContents lc WHERE lc.id = ?",
                [id]
            );
            
            if (contentCheck.length === 0) {
                throw new Error("Conteúdo não encontrado");
            }
            
            if (contentCheck[0].content_type !== 'activity') {
                throw new Error("O conteúdo não é do tipo atividade");
            }
            
            // Pegar todos os enunciados existentes para este conteúdo
            const [existingStatements] = await pool.query<RowDataPacket[]>(
                "SELECT id FROM ActivityStatements WHERE lesson_content_id = ? ORDER BY question_order",
                [id]
            );
            
            // Para cada pergunta na requisição
            for (let i = 0; i < questions.length; i++) {
                const question = questions[i];
                const questionOrder = i + 1;
                
                if (question.id) {
                    // Atualizar enunciado existente
                    await pool.query(
                        "UPDATE ActivityStatements SET statement_text = ?, question_order = ? WHERE id = ?",
                        [question.statement, questionOrder, question.id]
                    );
                    
                    // Obter todas as opções existentes para este enunciado
                    const [existingOptions] = await pool.query<RowDataPacket[]>(
                        "SELECT id FROM ActivityOptions WHERE statement_id = ?",
                        [question.id]
                    );
                    
                    // Mapear os IDs das opções existentes
                    const existingOptionIds = existingOptions.map((o: RowDataPacket) => o.id);
                    // Mapear os IDs das opções enviadas pelo cliente
                    const sentOptionIds = question.options
                        .filter((o: any) => o.id)
                        .map((o: any) => o.id);
                    
                    // Encontrar opções que foram removidas (estão no banco mas não vieram na requisição)
                    const optionsToDelete = existingOptionIds.filter(id => !sentOptionIds.includes(id));
                    
                    // Excluir as opções removidas
                    if (optionsToDelete.length > 0) {
                        await pool.query(
                            "DELETE FROM ActivityOptions WHERE id IN (?)",
                            [optionsToDelete]
                        );
                    }
                    
                    // Atualizar ou criar opções
                    for (let j = 0; j < question.options.length; j++) {
                        const option = question.options[j];
                        const optionOrder = j + 1;
                        
                        if (option.id) {
                            // Atualizar opção existente
                            await pool.query(
                                "UPDATE ActivityOptions SET option_text = ?, option_order = ?, is_correct = ? WHERE id = ?",
                                [option.text, optionOrder, option.correct, option.id]
                            );
                        } else {
                            // Criar nova opção
                            await pool.query(
                                "INSERT INTO ActivityOptions (statement_id, option_order, option_text, is_correct) VALUES (?, ?, ?, ?)",
                                [question.id, optionOrder, option.text, option.correct]
                            );
                        }
                    }
                    
                } else {
                    // Criar novo enunciado
                    const [newStatement]: any = await pool.query(
                        "INSERT INTO ActivityStatements (lesson_content_id, question_order, statement_text) VALUES (?, ?, ?)",
                        [id, questionOrder, question.statement]
                    );
                    
                    const newStatementId = newStatement.insertId;
                    
                    // Criar opções para o novo enunciado
                    for (let j = 0; j < question.options.length; j++) {
                        const option = question.options[j];
                        const optionOrder = j + 1;
                        
                        await pool.query(
                            "INSERT INTO ActivityOptions (statement_id, option_order, option_text, is_correct) VALUES (?, ?, ?, ?)",
                            [newStatementId, optionOrder, option.text, option.correct]
                        );
                    }
                }
            }
            
            // Remover enunciados que não foram enviados na requisição
            const statementIdsInRequest = questions
                .filter(q => q.id)
                .map(q => q.id);
            
            const statementsToRemove = existingStatements
                .filter((s: RowDataPacket) => !statementIdsInRequest.includes(s.id))
                .map((s: RowDataPacket) => s.id);
            
            if (statementsToRemove.length > 0) {
                await pool.query(
                    "DELETE FROM ActivityStatements WHERE id IN (?)",
                    [statementsToRemove]
                );
            }
            
            // Confirmar a transação
            await pool.query("COMMIT");
            
            return NextResponse.json({ message: "Atividade atualizada com sucesso" });
        } catch (error) {
            // Reverter a transação em caso de erro
            await pool.query("ROLLBACK");
            throw error;
        }
    } catch (error: any) {
        console.error(error);
        return NextResponse.json(
            { message: `Erro ao atualizar atividade: ${error.message}` },
            { status: 500 }
        );
    }
}