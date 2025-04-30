import { NextApiRequest, NextApiResponse } from "next";
import pool from "@/lib/db";
import { jwtVerify } from "jose";

// Chave secreta para verificar o token JWT
const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret_key");

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  // Autenticação e extração de dados do token
  const token = req.cookies.auth_token;
  if (!token) {
    return res.status(401).json({ message: "Não autenticado" });
  }

  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    const userId = payload.userId as number;

    switch (method) {
      case "GET": {
        try {
          const { month, year, startDate, endDate } = req.query;
          
          // Se não fornecido, use o mês e ano atuais
          const currentDate = new Date();
          const currentMonth = month ? parseInt(month as string) : currentDate.getMonth() + 1;
          const currentYear = year ? parseInt(year as string) : currentDate.getFullYear();
          
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
          
          let params = [userId];

          // Filtrar por intervalo de datas se fornecido
          if (startDate && endDate) {
            query += ` AND rs.scheduled_date BETWEEN ? AND ?`;
            params.push(startDate as any, endDate as any);
          } else {
            // Caso contrário, filtra por mês e ano
            query += ` AND MONTH(rs.scheduled_date) = ? AND YEAR(rs.scheduled_date) = ?`;
            params.push(currentMonth, currentYear);
          }
          
          query += ` ORDER BY rs.scheduled_date, rs.scheduled_time`;

          // Executar consulta
          const [reunions]: any = await pool.query(query, params);

          res.status(200).json({ 
            reunions, 
            month: currentMonth, 
            year: currentYear,
            startDate: startDate || null,
            endDate: endDate || null
          });
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: "Internal server error" });
        }
        break;
      }

      case "POST": {
        try {
          const { reunion_id, scheduled_date, scheduled_time, duration_minutes } = req.body;

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
            return res.status(403).json({ message: "Acesso negado a esta reunião" });
          }

          const [result] = await pool.query(
            `INSERT INTO ReunionSchedules (reunion_id, scheduled_date, scheduled_time, duration_minutes) 
             VALUES (?, ?, ?, ?)`,
            [reunion_id, scheduled_date, scheduled_time, duration_minutes]
          );

          res.status(201).json({ id: (result as any).insertId, message: "Reunion scheduled successfully" });
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: "Internal server error" });
        }
        break;
      }

      case "PUT": {
        try {
          const { id, scheduled_date, scheduled_time, duration_minutes } = req.body;

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
            return res.status(403).json({ message: "Acesso negado a esta reunião" });
          }

          await pool.query(
            `UPDATE ReunionSchedules 
             SET scheduled_date = ?, scheduled_time = ?, duration_minutes = ? 
             WHERE id = ?`,
            [scheduled_date, scheduled_time, duration_minutes, id]
          );

          res.status(200).json({ message: "Reunion updated successfully" });
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: "Internal server error" });
        }
        break;
      }

      case "DELETE": {
        try {
          const { id } = req.query;

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
            return res.status(403).json({ message: "Acesso negado a esta reunião" });
          }

          await pool.query(`DELETE FROM ReunionSchedules WHERE id = ?`, [id]);

          res.status(200).json({ message: "Reunion deleted successfully" });
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: "Internal server error" });
        }
        break;
      }

      default:
        res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
        res.status(405).json({ message: `Method ${method} Not Allowed` });
        break;
    }
  } catch (error) {
    console.error('JWT verification error:', error);
    res.status(401).json({ message: "Token inválido ou expirado" });
  }
}