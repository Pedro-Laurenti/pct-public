import { NextApiRequest, NextApiResponse } from "next";
import pool from "@/lib/db";
import { SignJWT } from "jose";
import { serialize } from "cookie";
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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { email, password } = req.body;

  try {
    const [rows]: any = await pool.query(
      "SELECT id, role, password_hash FROM Users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = rows[0];

    // Verify password securely
    const isPasswordValid = await verifyPassword(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Generate a JWT token
    const sessionToken = await new SignJWT({ userId: user.id, role: user.role })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("2h")
      .sign(SECRET_KEY);

    // Set cookie
    res.setHeader(
      "Set-Cookie",
      serialize("auth_token", sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 2 * 60 * 60, // 2 hours
      })
    );

    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}