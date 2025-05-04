import { NextApiRequest, NextApiResponse } from "next";
import pool from "@/lib/db";
import { jwtVerify } from "jose";

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret_key");

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Apenas método GET é permitido
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  // Autenticação e extração de dados do token
  const token = req.cookies.auth_token;
  if (!token) {
    return res.status(401).json({ message: "Não autenticado" });
  }

  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    const userId = payload.userId as number;
    const { id: lessonId, contentId } = req.query;

    if (!lessonId || !contentId) {
      return res.status(400).json({ message: "Parâmetros insuficientes" });
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
      return res.status(403).json({ message: "Você não tem acesso a este conteúdo ou o tipo de conteúdo não é atividade" });
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
      return res.status(404).json({ message: "Atividade não encontrada ou sem enunciados" });
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

    return res.status(200).json({
      lesson: lessonRows[0],
      statements: statementsRows,
      userAnswers,
      completed
    });
  } catch (error) {
    console.error('Activity Content API Error:', error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
}