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
       WHERE lc.id = ? AND l.id = ? AND cu.user_id = ? AND lc.content_type = 'reunion'`,
      [contentId, lessonId, userId]
    );

    if (!hasAccess || hasAccess.length === 0) {
      return NextResponse.json({ message: "Você não tem acesso a este conteúdo ou o tipo de conteúdo não é reunião" }, { status: 403 });
    }

    // Obter informações da aula para o breadcrumb
    const [lessonRows]: any = await pool.query(
      `SELECT l.id, l.title, l.lesson_description, c.name as course_name
       FROM Lessons l
       JOIN Courses c ON l.course_id = c.id
       WHERE l.id = ?`,
      [lessonId]
    );

    // Obter conteúdo da reunião
    const [contentRows]: any = await pool.query(
      `SELECT lr.id, lr.lesson_content_id, lr.reunion_title, 
              lr.reunion_url, lr.reunion_description, lr.created_at
       FROM LessonReunions lr
       JOIN LessonContents lc ON lr.lesson_content_id = lc.id
       WHERE lc.id = ? AND lc.content_type = 'reunion'`,
      [contentId]
    );

    if (contentRows.length === 0) {
      return NextResponse.json({ message: "Conteúdo de reunião não encontrado" }, { status: 404 });
    }

    // Obter todos os agendamentos para esta reunião
    const [schedulesRows]: any = await pool.query(
      `SELECT id, reunion_id, scheduled_date, scheduled_time, duration_minutes
       FROM ReunionSchedules
       WHERE reunion_id = ?
       ORDER BY scheduled_date, scheduled_time`,
      [contentRows[0].id]  // Use lr.id como reunion_id
    );

    // Adicionar os agendamentos ao objeto de conteúdo
    contentRows[0].schedule = schedulesRows;

    return NextResponse.json({
      lesson: lessonRows[0],
      content: contentRows[0]
    });
  } catch (error) {
    console.error('Reunion Content API Error:', error);
    return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 });
  }
}