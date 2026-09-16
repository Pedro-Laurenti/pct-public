import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { lessonContentId, textTitle, textContent } = body;

  // Validação
  if (!lessonContentId || !textTitle || !textContent) {
    return NextResponse.json(
      { message: "Todos os campos são obrigatórios" },
      { status: 400 }
    );
  }

  try {
    // Verificar se o conteúdo base existe e é do tipo texto
    const [contentCheck] = await pool.query<RowDataPacket[]>(
      "SELECT id, content_type FROM LessonContents WHERE id = ?",
      [lessonContentId]
    );

    if (contentCheck.length === 0) {
      return NextResponse.json(
        { message: "Conteúdo base não encontrado" },
        { status: 404 }
      );
    }

    if (contentCheck[0].content_type !== 'text') {
      return NextResponse.json(
        { message: "O conteúdo base não é do tipo texto" },
        { status: 400 }
      );
    }

    // Criar o conteúdo de texto
    const [result] = await pool.query<ResultSetHeader>(
      "INSERT INTO LessonText (lesson_content_id, text_title, text_content) VALUES (?, ?, ?)",
      [lessonContentId, textTitle, textContent]
    );

    return NextResponse.json({ 
      message: "Conteúdo de texto criado com sucesso", 
      textId: result.insertId 
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { message: `Erro ao criar conteúdo de texto: ${error.message}` },
      { status: 500 }
    );
  }
}