import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { hashPassword, SECRET_KEY } from "@/lib/auth";
import { SignJWT } from "jose";

// Retorna 404 se o auto-cadastro estiver desabilitado
const OAUTH_ENABLED = process.env.NEXT_PUBLIC_ENABLE_OAUTH === "true";

export async function POST(request: Request) {
  if (!OAUTH_ENABLED) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  try {
    const { name, email, password } = await request.json();

    if (!name?.trim() || !email?.trim() || !password) {
      return NextResponse.json({ message: "Todos os campos são obrigatórios." }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ message: "A senha deve ter pelo menos 6 caracteres." }, { status: 400 });
    }

    // Checar se email já existe
    const [existing]: any = await pool.query(
      "SELECT id FROM Users WHERE email = ?",
      [email.trim().toLowerCase()]
    );
    if (existing.length > 0) {
      return NextResponse.json({ message: "Este e-mail já está cadastrado." }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);

    const [result]: any = await pool.query(
      "INSERT INTO Users (name, email, password_hash, role) VALUES (?, ?, ?, 'student')",
      [name.trim(), email.trim().toLowerCase(), passwordHash]
    );

    const userId = result.insertId;

    // Gera auth_token igual ao login normal
    const sessionToken = await new SignJWT({ userId, role: "student" })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("2h")
      .sign(SECRET_KEY);

    const response = NextResponse.json(
      { message: "Conta criada com sucesso!", role: "student" },
      { status: 201 }
    );

    response.cookies.set({
      name: "auth_token",
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 2 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ message: "Erro interno." }, { status: 500 });
  }
}
