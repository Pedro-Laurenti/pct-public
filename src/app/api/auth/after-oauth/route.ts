import { NextRequest, NextResponse } from "next/server";
import { verifyAuth, isUnauthorized } from "@/lib/auth";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2/promise";

// Chamado após Google OAuth — decide para onde redirecionar
export async function GET(request: NextRequest) {
  const auth = await verifyAuth();
  if (isUnauthorized(auth)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (auth.role === "mentor") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // Verifica se o onboarding foi concluído (coluna adicionada em step_d.sql)
  const [userRows] = await pool.query<RowDataPacket[]>(
    "SELECT onboarding_complete FROM Users WHERE id = ? LIMIT 1",
    [auth.userId]
  );
  const onboardingComplete = userRows[0]?.onboarding_complete ?? 1;
  if (!onboardingComplete) {
    return NextResponse.redirect(new URL("/dashboard/onboarding", request.url));
  }

  const paymentsEnabled = process.env.NEXT_PUBLIC_ENABLE_PAYMENTS === "true";

  // Verifica se aluno tem alguma turma
  const [classes] = await pool.query<RowDataPacket[]>(
    "SELECT 1 FROM ClassUsers WHERE user_id = ? LIMIT 1",
    [auth.userId]
  );

  if (classes.length === 0 && paymentsEnabled) {
    return NextResponse.redirect(new URL("/checkout", request.url));
  }

  return NextResponse.redirect(new URL("/dashboard", request.url));
}
