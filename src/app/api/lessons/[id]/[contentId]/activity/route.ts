import { NextRequest, NextResponse } from 'next/server';
import pool from "@/lib/db";
import { jwtVerify } from "jose";
import { cookies } from 'next/headers';

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret_key");

export async function GET(request: NextRequest) {
  // Get route parameters from URL
  const url = new URL(request.url);
  const pathSegments = url.pathname.split('/');
  const lessonId = pathSegments[pathSegments.indexOf('lessons') + 1];
  const contentId = pathSegments[pathSegments.indexOf(lessonId) + 1];
  
  // Authentication and data extraction from token
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }

  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    const userId = payload.userId as number;

    if (!lessonId || !contentId) {
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
      return NextResponse.json({ message: "Você não tem acesso a este conteúdo ou o tipo de conteúdo não é atividade" }, { status: 403 });
    }

    // Obter informações da aula para o breadcrumb
    const [lessonRows]: any = await pool.query(
      `SELECT l.id, l.title, l.lesson_description, c.name as course_name
       FROM Lessons l
       JOIN Courses c ON l.course_id = c.id
       WHERE l.id = ?`,
      [lessonId]
    );

    // Obter enunciados da atividade
    const [statementsRows]: any = await pool.query(
      `SELECT ast.id, ast.lesson_content_id, ast.question_order, ast.statement_text
       FROM ActivityStatements ast
       WHERE ast.lesson_content_id = ?
       ORDER BY ast.question_order`,
      [contentId]
    );

    // Se não houver enunciados, retornar erro
    if (statementsRows.length === 0) {
      return NextResponse.json({ message: "Atividade não encontrada ou sem enunciados" }, { status: 404 });
    }

    // Para cada enunciado, obter suas opções
    for (const statement of statementsRows) {
      const [optionsRows]: any = await pool.query(
        `SELECT ao.id, ao.statement_id, ao.option_order, ao.option_text, ao.is_correct
         FROM ActivityOptions ao
         WHERE ao.statement_id = ?
         ORDER BY ao.option_order`,
        [statement.id]
      );
      statement.options = optionsRows;
    }

    // Verificar se o usuário já respondeu alguma questão
    const [userAnswers]: any = await pool.query(
      `SELECT ao.statement_id, sa.option_id
       FROM StudentAnswers sa
       JOIN ActivityOptions ao ON sa.option_id = ao.id
       JOIN ActivityStatements ast ON ao.statement_id = ast.id
       WHERE ast.lesson_content_id = ? AND sa.user_id = ?`,
      [contentId, userId]
    );

    // Verificar se a atividade está completamente concluída
    const completed = statementsRows.length > 0 && userAnswers.length >= statementsRows.length;

    return NextResponse.json({
      lesson: lessonRows[0],
      statements: statementsRows,
      userAnswers,
      completed
    });
  } catch (error) {
    console.error('Activity Content API Error:', error);
    return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 });
  }
}