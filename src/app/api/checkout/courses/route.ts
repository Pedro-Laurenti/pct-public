import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyAuth, isUnauthorized } from "@/lib/auth";
import { RowDataPacket } from "mysql2/promise";

export async function GET() {
  if (process.env.NEXT_PUBLIC_ENABLE_PAYMENTS !== "true") {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const auth = await verifyAuth();
  if (isUnauthorized(auth)) return auth;

  const [courses] = await pool.query<RowDataPacket[]>(
    "SELECT id, name, description, price, cover_image FROM Courses WHERE is_active = 1 ORDER BY name"
  );

  return NextResponse.json({ courses });
}
