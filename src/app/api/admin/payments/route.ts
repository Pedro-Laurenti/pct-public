import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { enrollStudentInCourse } from "@/lib/enrollment";

// POST /api/admin/payments
// Registra um pagamento manual e matricula o aluno no curso.
// Uso: casos pontuais após deploy (aluno que pagou fora do sistema).
export async function POST(req: NextRequest) {
  let userId: number, courseId: number, amount: number;

  try {
    const body = await req.json();
    userId   = Number(body.userId);
    courseId = Number(body.courseId);
    amount   = parseFloat(String(body.amount ?? 0)) || 0;
  } catch {
    return NextResponse.json({ message: "Payload inválido." }, { status: 400 });
  }

  if (!userId || !courseId) {
    return NextResponse.json(
      { message: "userId e courseId são obrigatórios." },
      { status: 400 }
    );
  }

  // Verifica se já existe pagamento aprovado para este par user+course
  const [existing] = await pool.execute(
    "SELECT id FROM Payments WHERE user_id = ? AND course_id = ? AND status = 'approved' LIMIT 1",
    [userId, courseId]
  );

  if ((existing as unknown[]).length > 0) {
    return NextResponse.json(
      { message: "Este aluno já possui acesso aprovado a este curso." },
      { status: 409 }
    );
  }

  // Insere o pagamento manual
  await pool.execute(
    `INSERT INTO Payments (user_id, course_id, status, amount, mp_preference_id, mp_payment_id)
     VALUES (?, ?, 'approved', ?, NULL, NULL)`,
    [userId, courseId, amount]
  );

  // Matricula o aluno (idempotente via INSERT IGNORE em ClassUsers)
  await enrollStudentInCourse(userId, courseId);

  return NextResponse.json({ ok: true });
}

// GET /api/admin/payments — lista todos os cursos ativos para o seletor do modal
export async function GET() {
  const [rows] = await pool.execute(
    "SELECT id, name, price FROM Courses WHERE is_active = 1 ORDER BY name"
  );
  return NextResponse.json({ courses: rows });
}
