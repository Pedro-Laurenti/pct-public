import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { lessonContentId, reunionTitle, reunionUrl, reunionDescription, date, durationMinutes } = body;

  // Validação
  if (!lessonContentId || !reunionTitle || !reunionUrl || !date || !durationMinutes) {
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
        "SELECT id, content_type FROM LessonContents WHERE id = ?",
        [lessonContentId]
      );

      if (contentCheck.length === 0) {
        throw new Error("Conteúdo base não encontrado");
      }

      if (contentCheck[0].content_type !== 'reunion') {
        throw new Error("O conteúdo base não é do tipo reunião");
      }

      // Criar o conteúdo de reunião
      const [reunionResult] = await pool.query<ResultSetHeader>(
        "INSERT INTO LessonReunions (lesson_content_id, reunion_title, reunion_url, reunion_description) VALUES (?, ?, ?, ?)",
        [lessonContentId, reunionTitle, reunionUrl, reunionDescription || null]
      );

      // Converter a string ISO para objeto Date
      const dateObj = new Date(date);
      
      // Extrair a data e hora separadamente
      const scheduledDate = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD
      const scheduledTime = dateObj.toISOString().split('T')[1].substring(0, 8); // HH:MM:SS

      // Adicionar o agendamento da reunião com data e hora separados
      await pool.query(
        "INSERT INTO ReunionSchedules (reunion_id, scheduled_date, scheduled_time, duration_minutes) VALUES (?, ?, ?, ?)",
        [reunionResult.insertId, scheduledDate, scheduledTime, durationMinutes]
      );

      // Confirmar a transação
      await pool.query("COMMIT");

      return NextResponse.json({ 
        message: "Reunião criada com sucesso", 
        reunionId: reunionResult.insertId 
      }, { status: 201 });
    } catch (error) {
      // Reverter a transação em caso de erro
      await pool.query("ROLLBACK");
      throw error;
    }
  } catch (error: any) {
    return NextResponse.json(
      { message: `Erro ao criar reunião: ${error.message}` },
      { status: 500 }
    );
  }
}