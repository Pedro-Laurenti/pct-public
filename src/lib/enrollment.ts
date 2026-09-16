import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";

// Matricula um aluno na primeira turma do curso.
// Se não existir turma, cria automaticamente uma "Turma Geral".
export async function enrollStudentInCourse(userId: number, courseId: number): Promise<void> {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Busca primeira turma do curso
    const [classes] = await conn.query<RowDataPacket[]>(
      "SELECT id FROM Classes WHERE course_id = ? ORDER BY id LIMIT 1",
      [courseId]
    );

    let classId: number;

    if (classes.length === 0) {
      // Cria turma automática
      const [courseRows] = await conn.query<RowDataPacket[]>(
        "SELECT name FROM Courses WHERE id = ?",
        [courseId]
      );
      const courseName = courseRows[0]?.name ?? "Curso";
      const [result] = await conn.query<ResultSetHeader>(
        "INSERT INTO Classes (name, course_id) VALUES (?, ?)",
        [`Turma Geral — ${courseName}`, courseId]
      );
      classId = result.insertId;
    } else {
      classId = classes[0].id;
    }

    // Matricula (ignora duplicado)
    await conn.query(
      "INSERT IGNORE INTO ClassUsers (class_id, user_id) VALUES (?, ?)",
      [classId, userId]
    );

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
