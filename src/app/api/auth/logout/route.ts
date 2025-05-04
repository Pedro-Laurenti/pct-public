import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Criar uma resposta e limpar o cookie
    const response = NextResponse.json(
      { message: "Logout successful" },
      { status: 200 }
    );
    
    // Limpar o cookie definindo sua idade máxima como 0
    response.cookies.set({
      name: "auth_token",
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 0, // Expirar imediatamente
    });

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}