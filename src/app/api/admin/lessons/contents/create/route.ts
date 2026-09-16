import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { lessonId, contentType } = body;

  // Validação
  if (!lessonId || !contentType) {
    return NextResponse.json(
      { message: "ID da aula e tipo de conteúdo são obrigatórios" },
      { status: 400 }
    );
  }

  // Validar tipo de conteúdo
  const validTypes = ['text', 'video', 'activity', 'reunion'];
  if (!validTypes.includes(contentType)) {
    return NextResponse.json(
      { message: "Tipo de conteúdo inválido" },
      { status: 400 }
    );
  }

  try {
    // Verificar se a aula existe
    const [lessonCheck] = await pool.query<RowDataPacket[]>(
      "SELECT id FROM Lessons WHERE id = ?",
      [lessonId]
    );

    if (lessonCheck.length === 0) {
      return NextResponse.json(
        { message: "Aula não encontrada" },
        { status: 404 }
      );
    }

    // Criar o registro básico de conteúdo
    const [result] = await pool.query<ResultSetHeader>(
      "INSERT INTO LessonContents (lesson_id, content_type) VALUES (?, ?)",
      [lessonId, contentType]
    );

    return NextResponse.json({ 
      message: "Conteúdo base criado com sucesso", 
      contentId: result.insertId 
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { message: `Erro ao criar conteúdo: ${error.message}` },
      { status: 500 }
    );
  }
}