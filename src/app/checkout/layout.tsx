import { redirect } from "next/navigation";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2/promise";

export default async function CheckoutLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  if (process.env.NEXT_PUBLIC_ENABLE_PAYMENTS === "true") {
    let enrollmentRedirect: string | null = null;

    try {
      const cookieStore = await cookies();
      const token = cookieStore.get("auth_token")?.value;

      if (token) {
        const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET!);
        const { payload } = await jwtVerify(token, SECRET_KEY);
        const { userId, role } = payload as { userId: number; role: string };

        if (role === "mentor") {
          enrollmentRedirect = "/admin";
        } else if (role === "student") {
          const [rows] = await pool.query<RowDataPacket[]>(
            "SELECT 1 FROM ClassUsers WHERE user_id = ? LIMIT 1",
            [userId]
          );
          // Já matriculado — não precisa de checkout
          if (rows.length > 0) {
            enrollmentRedirect = "/dashboard";
          }
        }
      }
    } catch {
      // Erro inesperado — deixa passar, o proxy já validou o JWT
    }

    if (enrollmentRedirect) redirect(enrollmentRedirect);
  }

  return <>{children}</>;
}
