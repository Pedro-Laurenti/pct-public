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
  
  // Autenticação e extração de dados do token
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
       WHERE lc.id = ? AND l.id = ? AND cu.user_id = ?`,
      [contentId, lessonId, userId]
    );

    if (!hasAccess || hasAccess.length === 0) {
      return NextResponse.json({ message: "Você não tem acesso a este conteúdo" }, { status: 403 });
    }

    // Obter tipo de conteúdo
    const [contentInfo]: any = await pool.query(
      `SELECT id, lesson_id, content_type
       FROM LessonContents
       WHERE id = ?`,
      [contentId]
    );

    if (contentInfo.length === 0) {
      return NextResponse.json({ message: "Conteúdo não encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      content: contentInfo[0]
    });
  } catch (error) {
    console.error('Content API Error:', error);
    return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 });
  }
}