import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";

interface ActivityOption {
  text: string;
  correct: boolean;
}

interface ActivityQuestion {
  statement: string;
  options: ActivityOption[];
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { lessonContentId, title, questions } = body;

  // Validação
  if (!lessonContentId || !title || !questions || !Array.isArray(questions) || questions.length === 0) {
    return NextResponse.json(
      { message: "Dados de atividade incompletos" },
      { status: 400 }
    );
  }

  try {
    // Começar uma transação
    await pool.query("START TRANSACTION");

    try {
      // Verificar se o conteúdo base existe e é do tipo atividade
      const [contentCheck] = await pool.query<RowDataPacket[]>(
        "SELECT id, content_type FROM LessonContents WHERE id = ?",
        [lessonContentId]
      );

      if (contentCheck.length === 0) {
        throw new Error("Conteúdo base não encontrado");
      }

      if (contentCheck[0].content_type !== 'activity') {
        throw new Error("O conteúdo base não é do tipo atividade");
      }

      // Para cada questão na atividade
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i] as ActivityQuestion;
        const orderIndex = i + 1; // Ordem da questão, começando de 1

        // Inserir a questão
        const [statementResult] = await pool.query<ResultSetHeader>(
          "INSERT INTO ActivityStatements (lesson_content_id, statement_text, question_order) VALUES (?, ?, ?)",
          [lessonContentId, question.statement, orderIndex]
        );

        const statementId = statementResult.insertId;

        // Inserir as opções para a questão
        for (let j = 0; j < question.options.length; j++) {
          const option = question.options[j];
          const optionOrder = j + 1; // Ordem da opção, começando de 1

          await pool.query(
            "INSERT INTO ActivityOptions (statement_id, option_text, is_correct, option_order) VALUES (?, ?, ?, ?)",
            [statementId, option.text, option.correct, optionOrder]
          );
        }
      }

      // Confirmar a transação
      await pool.query("COMMIT");

      return NextResponse.json({ 
        message: "Atividade criada com sucesso"
      }, { status: 201 });
    } catch (error) {
      // Reverter a transação em caso de erro
      await pool.query("ROLLBACK");
      throw error;
    }
  } catch (error: any) {
    return NextResponse.json(
      { message: `Erro ao criar atividade: ${error.message}` },
      { status: 500 }
    );
  }
}