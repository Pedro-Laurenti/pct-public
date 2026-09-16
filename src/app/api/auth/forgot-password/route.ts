import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import crypto from "crypto";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.example.com",
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER || "user@example.com",
    pass: process.env.EMAIL_PASSWORD || "password",
  },
});

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ message: "Email é obrigatório." }, { status: 400 });
    }

    const [users]: any = await pool.query(
      "SELECT id, name, email FROM Users WHERE email = ?",
      [email]
    );

    // Always return 200 to prevent email enumeration
    if (users.length === 0) {
      return NextResponse.json({ message: "Se o email existir, você receberá as instruções em breve." });
    }

    const user = users[0];
    const resetToken = crypto.randomInt(100000, 999999).toString();
    const hashUrl = crypto.randomBytes(20).toString("hex");
    const expiryTime = new Date();
    expiryTime.setHours(expiryTime.getHours() + 1);

    await pool.query("DELETE FROM PwdResetTokens WHERE user_id = ?", [user.id]);
    await pool.query(
      "INSERT INTO PwdResetTokens (user_id, token, hash_url, expires_at) VALUES (?, ?, ?, ?)",
      [user.id, resetToken, hashUrl, expiryTime]
    );

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Portal do Aluno" <noreply@example.com>',
      to: user.email,
      subject: "Redefinicao de Senha - Portal do Aluno",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Redefinicao de Senha</h2>
          <p>Ola ${user.name},</p>
          <p>Recebemos uma solicitacao para redefinir sua senha.</p>
          <p>Clique no link abaixo para continuar:</p>
          <p><a href="${baseUrl}/pwd/${hashUrl}" style="background:#4f46e5;color:#fff;padding:10px 20px;border-radius:4px;text-decoration:none;">Redefinir Senha</a></p>
          <p>Ou acesse: ${baseUrl}/pwd/${hashUrl}</p>
          <p>Em seguida, use o codigo de verificacao: <strong>${resetToken}</strong></p>
          <p>Este link e codigo sao validos por 1 hora.</p>
          <p>Se voce nao solicitou esta operacao, ignore este email.</p>
        </div>
      `,
    });

    return NextResponse.json({ message: "Se o email existir, voce recebera as instrucoes em breve." });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ message: "Erro interno do servidor." }, { status: 500 });
  }
}
