import { NextApiRequest, NextApiResponse } from "next";
import pool from "@/lib/db";
import { jwtVerify } from "jose";
import crypto from "crypto";
import nodemailer from "nodemailer";

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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Esse endpoint só aceita requisições POST
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  // Verificar se o usuário está autenticado
  const token = req.cookies.auth_token;
  if (!token) {
    return res.status(401).json({ message: "Não autenticado" });
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
      return res.status(404).json({ message: "Usuário não encontrado" });
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
    
    return res.status(200).json({ 
      message: "Código de redefinição de senha enviado para seu email"
    });
    
  } catch (error) {
    console.error("Erro na solicitação de redefinição de senha:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
}