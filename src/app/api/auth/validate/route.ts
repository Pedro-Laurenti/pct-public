import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import pool from "@/lib/db";

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret_key");

export async function GET(request: NextRequest) {
  // Obter o token do cookie
  const token = request.cookies.get("auth_token")?.value;

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // Verificar o token JWT usando jose
    const { payload } = await jwtVerify(token, SECRET_KEY);
    
    // Extrair userId do payload do token
    const userId = payload.userId;
    
    if (!userId) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }
    
    // Verificar se o usuário existe no banco de dados e está ativo
    const [rows]: any = await pool.query(
      "SELECT id, role FROM Users WHERE id = ?",
      [userId]
    );
    
    if (rows.length === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 401 });
    }
    
    // Usuário é válido, retornar status autenticado
    return NextResponse.json({ 
      message: "Authenticated",
      user: {
        id: rows[0].id,
        role: rows[0].role
      }
    }, { status: 200 });
  } catch (error) {
    console.error("Token verification failed:", error);
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}