import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import pool from "@/lib/db";
import { SECRET_KEY } from "@/lib/auth";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    const userId = payload.userId;

    if (!userId) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const [rows]: any = await pool.query(
      "SELECT id, name, email, role FROM Users WHERE id = ?",
      [userId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 401 });
    }

    return NextResponse.json({
      message: "Authenticated",
      user: { id: rows[0].id, name: rows[0].name, email: rows[0].email, role: rows[0].role },
    });
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}
