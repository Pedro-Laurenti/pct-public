import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { SignJWT } from "jose";
import { cookies } from "next/headers";
import { subtle } from "crypto";

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret_key");

async function verifyPassword(inputPassword: string, storedHash: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const inputHashBuffer = await subtle.digest("SHA-256", encoder.encode(inputPassword));
  
  // Convert ArrayBuffer to hexadecimal string
  const inputHashHex = Array.from(new Uint8Array(inputHashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  return inputHashHex === storedHash;
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    const [rows]: any = await pool.query(
      "SELECT id, role, password_hash FROM Users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const user = rows[0];

    // Verify password securely
    const isPasswordValid = await verifyPassword(password, user.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Generate a JWT token
    const sessionToken = await new SignJWT({ userId: user.id, role: user.role })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("2h")
      .sign(SECRET_KEY);

    // Set cookie in the response
    const response = NextResponse.json(
      { message: "Login successful" },
      { status: 200 }
    );

    // Set cookie using the cookies() API from next/headers
    response.cookies.set({
      name: "auth_token",
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 2 * 60 * 60, // 2 hours
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