import { NextRequest, NextResponse } from 'next/server';
import pool from "@/lib/db";
import { jwtVerify } from "jose";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { cookies } from 'next/headers';

// Chave secreta para verificar o token JWT
const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret_key");

// Configuração do nodemailer (ajuste conforme suas necessidades)
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
  // Verificar se o usuário está autenticado
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }

  try {
    // Extrair ID do usuário a partir do token
    const { payload } = await jwtVerify(token, SECRET_KEY);
    const userId = payload.userId as number;

    // Buscar dados do usuário
    const [users]: any = await pool.query(
      `SELECT id, name, email FROM Users WHERE id = ?`,
      [userId]
    );

    if (users.length === 0) {
      return NextResponse.json({ message: "Usuário não encontrado" }, { status: 404 });
    }
    
    const user = users[0];
    
    // Gerar token aleatório de 6 dígitos
    const resetToken = crypto.randomInt(100000, 999999).toString();
    
    // Gerar uma URL hash única para identificar o token
    const hashUrl = crypto.randomBytes(20).toString('hex');
    
    // Salvar token na tabela PwdResetTokens com validade de 1 hora
    const expiryTime = new Date();
    expiryTime.setHours(expiryTime.getHours() + 1); // Token válido por 1 hora
    
    // Limpar tokens antigos para esse usuário
    await pool.query(
      `DELETE FROM PwdResetTokens WHERE user_id = ?`,
      [userId]
    );
    
    // Inserir novo token
    await pool.query(
      `INSERT INTO PwdResetTokens (user_id, token, hash_url, expires_at) 
       VALUES (?, ?, ?, ?)`,
      [userId, resetToken, hashUrl, expiryTime]
    );
    
    // Configurar e-mail
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Portal do Aluno" <noreply@example.com>',
      to: user.email,
      subject: "Código de Redefinição de Senha",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Redefinição de Senha</h2>
          <p>Olá ${user.name},</p>
          <p>Recebemos uma solicitação para redefinir sua senha.</p>
          <p>Seu código de verificação é: <strong>${resetToken}</strong></p>
          <p>Este código é válido por 1 hora.</p>
          <p>Se você não solicitou esta redefinição de senha, por favor ignore este e-mail.</p>
          <p>Atenciosamente,<br>Equipe do Portal do Aluno</p>
        </div>
      `
    };
    
    // Enviar e-mail
    await transporter.sendMail(mailOptions);
    
    return NextResponse.json({ 
      message: "Código de redefinição de senha enviado para seu email"
    });
    
  } catch (error) {
    console.error("Erro na solicitação de redefinição de senha:", error);
    return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 });
  }
}