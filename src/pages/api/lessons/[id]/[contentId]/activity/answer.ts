import { NextApiRequest, NextApiResponse } from "next";
import pool from "@/lib/db";
import { jwtVerify } from "jose";

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret_key");

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Apenas método POST é permitido
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
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
    const { statement_id, option_id } = req.body;

    if (!lessonId || !contentId || !statement_id || !option_id) {
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
      return res.status(403).json({ message: "Você não tem acesso a esta atividade" });
    }

    // Verificar se o enunciado pertence a esta atividade
    const [validStatement]: any = await pool.query(
      `SELECT 1
       FROM ActivityStatements ast
       WHERE ast.id = ? AND ast.lesson_content_id = ?`,
      [statement_id, contentId]
    );

    if (!validStatement || validStatement.length === 0) {
      return res.status(400).json({ message: "Enunciado inválido para esta atividade" });
    }

    // Verificar se a opção pertence ao enunciado
    const [optionCheck]: any = await pool.query(
      `SELECT ao.is_correct
       FROM ActivityOptions ao
       WHERE ao.id = ? AND ao.statement_id = ?`,
      [option_id, statement_id]
    );

    if (!optionCheck || optionCheck.length === 0) {
      return res.status(400).json({ message: "Opção inválida para este enunciado" });
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

    return res.status(200).json({
      correct: isCorrect,
      completed: allCompleted
    });
  } catch (error) {
    console.error('Activity Answer API Error:', error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
}