import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { jwtVerify } from "jose";

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret_key");

// Query helpers para maior manutenibilidade e concisão do código
const queries = {
  getUserInfo: "SELECT id, name, email, role FROM Users WHERE id = ?",
  
  getUserCourses: `
    SELECT c.id, c.name, c.description 
    FROM Courses c
    JOIN Classes cl ON c.id = cl.course_id
    JOIN ClassUsers cu ON cl.id = cu.class_id
    WHERE cu.user_id = ?
    GROUP BY c.id
  `,
  
  getCourseLessons: `
    SELECT l.id, l.title, l.lesson_description
    FROM Lessons l
    WHERE l.course_id = ?
    ORDER BY l.created_at DESC
    LIMIT 5
  `,
  
  getTotalActivities: `
    SELECT COUNT(DISTINCT lc.id) as total
    FROM LessonContents lc
    JOIN Lessons l ON lc.lesson_id = l.id
    WHERE l.course_id = ?
    AND lc.content_type = 'activity'
  `,
  
  getCompletedActivities: `
    SELECT COUNT(DISTINCT lc.id) as completed
    FROM LessonContents lc
    JOIN Lessons l ON lc.lesson_id = l.id
    JOIN ActivityStatements ast ON lc.id = ast.lesson_content_id
    JOIN ActivityOptions ao ON ast.id = ao.statement_id
    JOIN StudentAnswers sa ON ao.id = sa.option_id
    WHERE l.course_id = ?
    AND lc.content_type = 'activity'
    AND sa.user_id = ?
    GROUP BY l.course_id
  `,
  
  getTotalContents: `
    SELECT COUNT(*) as total
    FROM LessonContents lc
    JOIN Lessons l ON lc.lesson_id = l.id
    WHERE l.course_id = ?
  `,
  
  getContentCountsByType: `
    SELECT 
      content_type,
      COUNT(*) as count
    FROM LessonContents lc
    JOIN Lessons l ON lc.lesson_id = l.id
    WHERE l.course_id = ?
    GROUP BY content_type
  `,
  
  getTotalCompletedActivities: `
    SELECT COUNT(DISTINCT lc.id) as total
    FROM LessonContents lc
    JOIN ActivityStatements ast ON lc.id = ast.lesson_content_id
    JOIN ActivityOptions ao ON ast.id = ao.statement_id
    JOIN StudentAnswers sa ON ao.id = sa.option_id
    WHERE sa.user_id = ?
    AND lc.content_type = 'activity'
  `,
  
  getPendingActivities: `
    SELECT 
      lc.id AS content_id,
      lc.content_type,
      l.id AS lesson_id,
      l.title AS lesson_title,
      c.id AS course_id,
      c.name AS course_name,
      (SELECT COUNT(*) FROM ActivityStatements WHERE lesson_content_id = lc.id) as statement_count,
      (
        SELECT statement_text 
        FROM ActivityStatements 
        WHERE lesson_content_id = lc.id 
        ORDER BY question_order 
        LIMIT 1
      ) as first_statement
    FROM LessonContents lc
    JOIN Lessons l ON lc.lesson_id = l.id
    JOIN Courses c ON l.course_id = c.id
    JOIN Classes cl ON c.id = cl.course_id
    JOIN ClassUsers cu ON cl.id = cu.class_id
    WHERE cu.user_id = ? 
    AND lc.content_type = 'activity'
    AND lc.id NOT IN (
      SELECT DISTINCT ast.lesson_content_id
      FROM ActivityStatements ast
      JOIN ActivityOptions ao ON ast.id = ao.statement_id
      JOIN StudentAnswers sa ON ao.id = sa.option_id
      WHERE sa.user_id = ?
    )
    ORDER BY l.created_at DESC
    LIMIT 10
  `,
  
  getTotalAllActivities: `
    SELECT COUNT(DISTINCT lc.id) as total
    FROM LessonContents lc
    JOIN Lessons l ON lc.lesson_id = l.id
    JOIN Courses c ON l.course_id = c.id
    JOIN Classes cl ON c.id = cl.course_id
    JOIN ClassUsers cu ON cl.id = cu.class_id
    WHERE cu.user_id = ? 
    AND lc.content_type = 'activity'
  `,
  
  getUpcomingReunions: `
    SELECT 
      lr.id, 
      lr.reunion_title, 
      lr.reunion_url, 
      lr.reunion_description,
      rs.scheduled_date, 
      rs.scheduled_time, 
      rs.duration_minutes,
      l.id as lesson_id,
      l.title as lesson_title,
      c.id as course_id,
      c.name as course_name
    FROM LessonContents lc
    JOIN Lessons l ON lc.lesson_id = l.id
    JOIN LessonReunions lr ON lc.id = lr.lesson_content_id
    JOIN ReunionSchedules rs ON lr.id = rs.reunion_id
    JOIN Courses c ON l.course_id = c.id
    JOIN Classes cl ON c.id = cl.course_id
    JOIN ClassUsers cu ON cl.id = cu.class_id
    WHERE cu.user_id = ?
    AND lc.content_type = 'reunion'
    AND (
      rs.scheduled_date > CURDATE() OR 
      (rs.scheduled_date = CURDATE() AND rs.scheduled_time >= CURTIME())
    )
    ORDER BY rs.scheduled_date, rs.scheduled_time
    LIMIT 5
  `,
  
  getPastReunions: `
    SELECT 
      lr.id, 
      lr.reunion_title, 
      lr.reunion_url, 
      lr.reunion_description,
      rs.scheduled_date, 
      rs.scheduled_time, 
      rs.duration_minutes,
      l.id as lesson_id,
      l.title as lesson_title,
      c.id as course_id,
      c.name as course_name
    FROM LessonContents lc
    JOIN Lessons l ON lc.lesson_id = l.id
    JOIN LessonReunions lr ON lc.id = lr.lesson_content_id
    JOIN ReunionSchedules rs ON lr.id = rs.reunion_id
    JOIN Courses c ON l.course_id = c.id
    JOIN Classes cl ON c.id = cl.course_id
    JOIN ClassUsers cu ON cl.id = cu.class_id
    WHERE cu.user_id = ?
    AND lc.content_type = 'reunion'
    AND (
      rs.scheduled_date < CURDATE() OR 
      (rs.scheduled_date = CURDATE() AND rs.scheduled_time < CURTIME())
    )
    ORDER BY rs.scheduled_date DESC, rs.scheduled_time DESC
    LIMIT 3
  `
};

export async function GET(request: NextRequest) {
  try {
    // Autenticação e extração de dados do token
    const token = request.cookies.get("auth_token")?.value;
    
    if (!token) {
      return NextResponse.json(
        { message: "Não autenticado" },
        { status: 401 }
      );
    }

    const { payload } = await jwtVerify(token, SECRET_KEY);
    const userId = payload.userId as number;
    
    // Função para executar queries no banco de dados
    const executeQuery = async (query: string, params: any[] = []): Promise<any> => {
      try {
        const [rows]: any = await pool.query(query, params);
        return rows;
      } catch (error) {
        console.error(`Query error: ${query.substring(0, 50)}...`, error);
        throw error;
      }
    };

    // Buscar dados do usuário e cursos em paralelo
    const [userRows, coursesRows] = await Promise.all([
      executeQuery(queries.getUserInfo, [userId]),
      executeQuery(queries.getUserCourses, [userId])
    ]);

    if (userRows.length === 0) {
      return NextResponse.json(
        { message: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    const user = userRows[0];

    // Buscar detalhes dos cursos com progresso e lições
    const coursesWithLessons = await Promise.all(
      coursesRows.map(async (course: any) => {
        // Buscar lições do curso e métricas de progresso em paralelo
        const [
          lessonRows, 
          totalActivitiesResult, 
          completedActivitiesResult, 
          totalContentsResult,
          contentCountsResult
        ] = await Promise.all([
          executeQuery(queries.getCourseLessons, [course.id]),
          executeQuery(queries.getTotalActivities, [course.id]),
          executeQuery(queries.getCompletedActivities, [course.id, userId]),
          executeQuery(queries.getTotalContents, [course.id]),
          executeQuery(queries.getContentCountsByType, [course.id])
        ]);
        
        // Calcular progresso do curso
        const totalActivities = totalActivitiesResult[0]?.total || 0;
        const completedActivities = completedActivitiesResult[0]?.completed || 0;
        const totalContents = totalContentsResult[0]?.total || 0;
        
        const progressPercentage = totalActivities > 0 
          ? Math.round((completedActivities / totalActivities) * 100) 
          : 0;

        // Processar contagens por tipo de conteúdo
        const contentCounts = {
          videos: 0,
          texts: 0,
          activities: 0,
          reunions: 0
        };
        
        contentCountsResult.forEach((item: any) => {
          if (item.content_type === 'video') contentCounts.videos = item.count;
          else if (item.content_type === 'text') contentCounts.texts = item.count;
          else if (item.content_type === 'activity') contentCounts.activities = item.count;
          else if (item.content_type === 'reunion') contentCounts.reunions = item.count;
        });

        return {
          ...course,
          lessons: lessonRows,
          progress: {
            totalActivities,
            completedActivities,
            progressPercentage,
            totalContents,
            contentCounts
          }
        };
      })
    );

    // Buscar dados de atividades e reuniões em paralelo
    const [
      totalCompletedActivities,
      pendingActivitiesRows,
      totalAllActivities,
      reunionsRows,
      pastReunionsRows
    ] = await Promise.all([
      executeQuery(queries.getTotalCompletedActivities, [userId]),
      executeQuery(queries.getPendingActivities, [userId, userId]),
      executeQuery(queries.getTotalAllActivities, [userId]),
      executeQuery(queries.getUpcomingReunions, [userId]),
      executeQuery(queries.getPastReunions, [userId])
    ]);

    // Calcular estatísticas gerais do usuário
    const completedActivitiesCount = totalCompletedActivities[0]?.total || 0;
    const totalActivitiesCount = totalAllActivities[0]?.total || 0;
    const pendingActivitiesCount = pendingActivitiesRows.length;
    
    const overallProgress = totalActivitiesCount > 0 
      ? Math.round((completedActivitiesCount / totalActivitiesCount) * 100) 
      : 0;

    // Retornar todos os dados coletados
    return NextResponse.json({
      user,
      courses: coursesWithLessons,
      pendingActivities: pendingActivitiesRows,
      upcomingReunions: reunionsRows,
      pastReunions: pastReunionsRows,
      stats: {
        completedActivities: completedActivitiesCount,
        pendingActivities: pendingActivitiesCount,
        totalActivities: totalActivitiesCount,
        overallProgress
      }
    });
    
  } catch (error) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}