import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { lessonContentId, videoTitle, videoUrl, videoContent } = body;

  // Validação
  if (!lessonContentId || !videoTitle || !videoUrl) {
    return NextResponse.json(
      { message: "ID do conteúdo, título e URL são obrigatórios" },
      { status: 400 }
    );
  }

  try {
    // Verificar se o conteúdo base existe e é do tipo vídeo
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

    if (contentCheck[0].content_type !== 'video') {
      return NextResponse.json(
        { message: "O conteúdo base não é do tipo vídeo" },
        { status: 400 }
      );
    }

    // Criar o conteúdo de vídeo
    const [result] = await pool.query<ResultSetHeader>(
      "INSERT INTO LessonVideo (lesson_content_id, video_title, video_url, video_content) VALUES (?, ?, ?, ?)",
      [lessonContentId, videoTitle, videoUrl, videoContent || null]
    );

    return NextResponse.json({ 
      message: "Conteúdo de vídeo criado com sucesso", 
      videoId: result.insertId 
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { message: `Erro ao criar conteúdo de vídeo: ${error.message}` },
      { status: 500 }
    );
  }
}