import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { SignJWT } from "jose";
import { cookies } from "next/headers";
import { SECRET_KEY, verifyPasswordWithMigration } from "@/lib/auth";
import { ResultSetHeader } from "mysql2/promise";

export async function POST(request: Request) {
  try {
    const { email, password, rememberMe } = await request.json();

    const [rows]: any = await pool.query(
      "SELECT id, role, password_hash FROM Users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const user = rows[0];

    const isValid = await verifyPasswordWithMigration(
      password,
      user.password_hash,
      async (newHash) => {
        await pool.query<ResultSetHeader>(
          "UPDATE Users SET password_hash = ? WHERE id = ?",
          [newHash, user.id]
        );
      }
    );

    if (!isValid) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const tokenExpiry = rememberMe ? "30d" : "2h";
    const cookieMaxAge = rememberMe ? 30 * 24 * 60 * 60 : 2 * 60 * 60;

    const sessionToken = await new SignJWT({ userId: user.id, role: user.role })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime(tokenExpiry)
      .sign(SECRET_KEY);

    const response = NextResponse.json({ message: "Login successful", role: user.role }, { status: 200 });

    response.cookies.set({
      name: "auth_token",
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: cookieMaxAge,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
