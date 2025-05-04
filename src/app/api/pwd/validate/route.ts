import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const hash = searchParams.get("hash");

  if (!hash) {
    return NextResponse.json(
      { message: "Hash não fornecido" },
      { status: 400 }
    );
  }

  try {
    // Verificar se existe um token com este hash_url e que não expirou
    const [tokens]: any = await pool.query(
      `SELECT * FROM PwdResetTokens 
       WHERE hash_url = ? AND expires_at > NOW()`,
      [hash]
    );

    if (tokens.length === 0) {
      return NextResponse.json(
        { message: "Link inválido ou expirado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Hash válido" });
  } catch (error) {
    console.error("Erro ao validar hash:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { hash, token } = body;

  if (!hash || !token) {
    return NextResponse.json(
      { message: "Hash e token são obrigatórios" },
      { status: 400 }
    );
  }

  if (!/^\d{6}$/.test(token)) {
    return NextResponse.json(
      { message: "Formato de token inválido" },
      { status: 400 }
    );
  }

  try {
    // Buscar o token no banco de dados
    const [tokens]: any = await pool.query(
      `SELECT * FROM PwdResetTokens 
       WHERE hash_url = ? AND token = ? AND expires_at > NOW()`,
      [hash, token]
    );

    if (tokens.length === 0) {
      return NextResponse.json(
        { message: "Código inválido ou expirado" },
        { status: 400 }
      );
    }

    // Token válido
    return NextResponse.json({ message: "Código validado com sucesso" });
  } catch (error) {
    console.error("Erro ao validar token:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}