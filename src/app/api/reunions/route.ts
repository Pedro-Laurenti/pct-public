import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

// Chave secreta para verificar o token JWT
const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret_key");

export async function GET(request: NextRequest) {
  try {
    // Autenticação e extração de dados do token
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { message: "Não autenticado" },
        { status: 401 }
      );
    }

    const { payload } = await jwtVerify(token, SECRET_KEY);
    const userId = payload.userId as number;
    
    // Obter parâmetros da URL
    const searchParams = request.nextUrl.searchParams;
    const month = searchParams.get("month");
    const year = searchParams.get("year");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    
    // Se não fornecido, use o mês e ano atuais
    const currentDate = new Date();
    const currentMonth = month ? parseInt(month) : currentDate.getMonth() + 1;
    const currentYear = year ? parseInt(year) : currentDate.getFullYear();
    
    let query = `
      SELECT 
        rs.id, rs.scheduled_date, rs.scheduled_time, rs.duration_minutes, 
        lr.id AS reunion_id, lr.reunion_title, lr.reunion_description, lr.reunion_url,
        lr.lesson_content_id,
        l.id as lesson_id, l.title as lesson_title,
        c.id as course_id, c.name as course_name
      FROM ReunionSchedules rs 
      INNER JOIN LessonReunions lr ON rs.reunion_id = lr.id 
      INNER JOIN LessonContents lc ON lr.lesson_content_id = lc.id
      INNER JOIN Lessons l ON lc.lesson_id = l.id
      INNER JOIN Courses c ON l.course_id = c.id
      INNER JOIN Classes cl ON c.id = cl.course_id
      INNER JOIN ClassUsers cu ON cl.id = cu.class_id
      WHERE cu.user_id = ?
      AND lc.content_type = 'reunion'
    `;
    
    let params: any[] = [userId];

    // Filtrar por intervalo de datas se fornecido
    if (startDate && endDate) {
      query += ` AND rs.scheduled_date BETWEEN ? AND ?`;
      params.push(startDate, endDate);
    } else {
      // Caso contrário, filtra por mês e ano
      query += ` AND MONTH(rs.scheduled_date) = ? AND YEAR(rs.scheduled_date) = ?`;
      params.push(currentMonth, currentYear);
    }
    
    query += ` ORDER BY rs.scheduled_date, rs.scheduled_time`;

    // Executar consulta
    const [reunions]: any = await pool.query(query, params);

    return NextResponse.json({ 
      reunions, 
      month: currentMonth, 
      year: currentYear,
      startDate: startDate || null,
      endDate: endDate || null
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Autenticação e extração de dados do token
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { message: "Não autenticado" },
        { status: 401 }
      );
    }

    const { payload } = await jwtVerify(token, SECRET_KEY);
    const userId = payload.userId as number;
    
    // Obter dados do corpo da requisição
    const { reunion_id, scheduled_date, scheduled_time, duration_minutes } = await request.json();

    // Verificar se o usuário tem acesso a esta reunião
    const [reunionAccess]: any = await pool.query(
      `SELECT 1
        FROM LessonReunions lr
        JOIN LessonContents lc ON lr.lesson_content_id = lc.id
        JOIN Lessons l ON lc.lesson_id = l.id
        JOIN Courses c ON l.course_id = c.id
        JOIN Classes cl ON c.id = cl.course_id
        JOIN ClassUsers cu ON cl.id = cu.class_id
        WHERE lr.id = ? AND cu.user_id = ?`,
      [reunion_id, userId]
    );

    if (!reunionAccess || reunionAccess.length === 0) {
      return NextResponse.json(
        { message: "Acesso negado a esta reunião" },
        { status: 403 }
      );
    }

    const [result] = await pool.query(
      `INSERT INTO ReunionSchedules (reunion_id, scheduled_date, scheduled_time, duration_minutes) 
        VALUES (?, ?, ?, ?)`,
      [reunion_id, scheduled_date, scheduled_time, duration_minutes]
    );

    return NextResponse.json(
      { id: (result as any).insertId, message: "Reunion scheduled successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Autenticação e extração de dados do token
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { message: "Não autenticado" },
        { status: 401 }
      );
    }

    const { payload } = await jwtVerify(token, SECRET_KEY);
    const userId = payload.userId as number;
    
    // Obter dados do corpo da requisição
    const { id, scheduled_date, scheduled_time, duration_minutes } = await request.json();

    // Verificar se o usuário tem acesso a esta reunião
    const [reunionAccess]: any = await pool.query(
      `SELECT 1
        FROM ReunionSchedules rs
        JOIN LessonReunions lr ON rs.reunion_id = lr.id
        JOIN LessonContents lc ON lr.lesson_content_id = lc.id
        JOIN Lessons l ON lc.lesson_id = l.id
        JOIN Courses c ON l.course_id = c.id
        JOIN Classes cl ON c.id = cl.course_id
        JOIN ClassUsers cu ON cl.id = cu.class_id
        WHERE rs.id = ? AND cu.user_id = ?`,
      [id, userId]
    );

    if (!reunionAccess || reunionAccess.length === 0) {
      return NextResponse.json(
        { message: "Acesso negado a esta reunião" },
        { status: 403 }
      );
    }

    await pool.query(
      `UPDATE ReunionSchedules 
        SET scheduled_date = ?, scheduled_time = ?, duration_minutes = ? 
        WHERE id = ?`,
      [scheduled_date, scheduled_time, duration_minutes, id]
    );

    return NextResponse.json({ message: "Reunion updated successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Autenticação e extração de dados do token
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { message: "Não autenticado" },
        { status: 401 }
      );
    }

    const { payload } = await jwtVerify(token, SECRET_KEY);
    const userId = payload.userId as number;
    
    // Obter o ID da URL
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");
    
    if (!id) {
      return NextResponse.json(
        { message: "ID da reunião não fornecido" },
        { status: 400 }
      );
    }

    // Verificar se o usuário tem acesso a esta reunião
    const [reunionAccess]: any = await pool.query(
      `SELECT 1
        FROM ReunionSchedules rs
        JOIN LessonReunions lr ON rs.reunion_id = lr.id
        JOIN LessonContents lc ON lr.lesson_content_id = lc.id
        JOIN Lessons l ON lc.lesson_id = l.id
        JOIN Courses c ON l.course_id = c.id
        JOIN Classes cl ON c.id = cl.course_id
        JOIN ClassUsers cu ON cl.id = cu.class_id
        WHERE rs.id = ? AND cu.user_id = ?`,
      [id, userId]
    );

    if (!reunionAccess || reunionAccess.length === 0) {
      return NextResponse.json(
        { message: "Acesso negado a esta reunião" },
        { status: 403 }
      );
    }

    await pool.query(`DELETE FROM ReunionSchedules WHERE id = ?`, [id]);

    return NextResponse.json({ message: "Reunion deleted successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}