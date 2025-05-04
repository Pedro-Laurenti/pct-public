import { NextRequest, NextResponse } from 'next/server';
import pool from "@/lib/db";
import { jwtVerify } from "jose";
import { cookies } from 'next/headers';

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret_key");

export async function POST(request: NextRequest) {
  // Get route parameters from URL
  const url = new URL(request.url);
  const pathSegments = url.pathname.split('/');
  const lessonId = pathSegments[pathSegments.indexOf('lessons') + 1];
  const contentId = pathSegments[pathSegments.indexOf(lessonId) + 1];
  
  // Autenticação e extração de dados do token
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }

  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    const userId = payload.userId as number;
    
    // Get request body
    const body = await request.json();
    const { statement_id, option_id } = body;

    if (!lessonId || !contentId || !statement_id || !option_id) {
      return NextResponse.json({ message: "Parâmetros insuficientes" }, { status: 400 });
    }

    // Verificar se o usuário tem acesso a este conteúdo
    const [hasAccess]: any = await pool.query(
      `SELECT 1
       FROM LessonContents lc
       JOIN Lessons l ON lc.lesson_id = l.id
       JOIN Courses c ON l.course_id = c.id
       JOIN Classes cl ON c.id = cl.course_id
       JOIN ClassUsers cu ON cl.id = cu.class_id
       WHERE lc.id = ? AND l.id = ? AND cu.user_id = ? AND lc.content_type = 'activity'`,
      [contentId, lessonId, userId]
    );

    if (!hasAccess || hasAccess.length === 0) {
      return NextResponse.json({ message: "Você não tem acesso a esta atividade" }, { status: 403 });
    }

    // Verificar se o enunciado pertence a esta atividade
    const [validStatement]: any = await pool.query(
      `SELECT 1
       FROM ActivityStatements ast
       WHERE ast.id = ? AND ast.lesson_content_id = ?`,
      [statement_id, contentId]
    );

    if (!validStatement || validStatement.length === 0) {
      return NextResponse.json({ message: "Enunciado inválido para esta atividade" }, { status: 400 });
    }

    // Verificar se a opção pertence ao enunciado
    const [optionCheck]: any = await pool.query(
      `SELECT ao.is_correct
       FROM ActivityOptions ao
       WHERE ao.id = ? AND ao.statement_id = ?`,
      [option_id, statement_id]
    );

    if (!optionCheck || optionCheck.length === 0) {
      return NextResponse.json({ message: "Opção inválida para este enunciado" }, { status: 400 });
    }

    const isCorrect = optionCheck[0].is_correct === 1;

    // Verificar se o usuário já respondeu este enunciado
    const [existingAnswer]: any = await pool.query(
      `SELECT sa.id
       FROM StudentAnswers sa
       JOIN ActivityOptions ao ON sa.option_id = ao.id
       WHERE ao.statement_id = ? AND sa.user_id = ?`,
      [statement_id, userId]
    );

    // Se já existe uma resposta, atualizá-la
    if (existingAnswer && existingAnswer.length > 0) {
      await pool.query(
        `UPDATE StudentAnswers
         SET option_id = ?
         WHERE id = ?`,
        [option_id, existingAnswer[0].id]
      );
    } else {
      // Caso contrário, inserir nova resposta
      await pool.query(
        `INSERT INTO StudentAnswers (option_id, user_id)
         VALUES (?, ?)`,
        [option_id, userId]
      );
    }

    // Verificar se todas as questões foram respondidas
    const [totalStatements]: any = await pool.query(
      `SELECT COUNT(*) as total
       FROM ActivityStatements
       WHERE lesson_content_id = ?`,
      [contentId]
    );

    const [answeredStatements]: any = await pool.query(
      `SELECT COUNT(DISTINCT ast.id) as answered
       FROM ActivityStatements ast
       JOIN ActivityOptions ao ON ast.id = ao.statement_id
       JOIN StudentAnswers sa ON ao.id = sa.option_id
       WHERE ast.lesson_content_id = ? AND sa.user_id = ?`,
      [contentId, userId]
    );

    const allCompleted = totalStatements[0].total === answeredStatements[0].answered;

    return NextResponse.json({
      correct: isCorrect,
      completed: allCompleted
    });
  } catch (error) {
    console.error('Activity Answer API Error:', error);
    return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 });
  }
}