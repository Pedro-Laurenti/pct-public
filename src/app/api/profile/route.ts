import { NextRequest, NextResponse } from 'next/server';
import pool from "@/lib/db";
import { jwtVerify } from "jose";
import { cookies } from 'next/headers';

// Chave secreta para verificar o token JWT
const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret_key");

// GET handler for retrieving user profile
export async function GET(request: NextRequest) {
  // Autenticação e extração de dados do token
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }

  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    const userId = payload.userId as number;

    // Buscar dados do usuário
    const [users]: any = await pool.query(
      `SELECT id, name, email, phone_number FROM Users WHERE id = ?`,
      [userId]
    );

    if (users.length === 0) {
      return NextResponse.json({ message: "Usuário não encontrado" }, { status: 404 });
    }

    const user = users[0];
    return NextResponse.json({ user });
  } catch (error) {
    console.error("Erro ao buscar perfil:", error);
    return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 });
  }
}

// PUT handler for updating user profile
export async function PUT(request: NextRequest) {
  // Autenticação e extração de dados do token
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }

  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    const userId = payload.userId as number;
    
    // Get request body
    const body = await request.json();
    const { name, email, phone_number } = body;

    // Validar dados
    if (!name || !email) {
      return NextResponse.json({ message: "Nome e email são obrigatórios" }, { status: 400 });
    }

    // Verificar se o email já está em uso (exceto pelo próprio usuário)
    const [existingUsers]: any = await pool.query(
      `SELECT id FROM Users WHERE email = ? AND id != ?`, 
      [email, userId]
    );
    
    if (existingUsers.length > 0) {
      return NextResponse.json({ message: "Este email já está em uso" }, { status: 400 });
    }

    // Atualizar dados do usuário
    await pool.query(
      `UPDATE Users SET name = ?, email = ?, phone_number = ? WHERE id = ?`,
      [name, email, phone_number || null, userId]
    );

    // Buscar dados atualizados
    const [users]: any = await pool.query(
      `SELECT id, name, email, phone_number FROM Users WHERE id = ?`,
      [userId]
    );

    const updatedUser = users[0];
    return NextResponse.json({ 
      message: "Perfil atualizado com sucesso",
      user: updatedUser
    });
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 });
  }
}