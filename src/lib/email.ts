import nodemailer from 'nodemailer';

// Configuração do transportador de email
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.example.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_PORT === '465', // Automatically set secure based on port
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASSWORD || '',
  },
  // Add timeout settings to prevent hanging connections
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 10000,  // 10 seconds
  socketTimeout: 15000,    // 15 seconds
  debug: process.env.NODE_ENV !== 'production', // Enable debug output in development
});

// Interface para dados de email
interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Envia um email usando as configurações definidas
 * @param emailData - Dados do email a ser enviado
 * @returns Promise resolvida quando o email é enviado
 */
export async function sendEmail(emailData: EmailData): Promise<boolean> {
  try {
    const { to, subject, html, text } = emailData;
    
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'no-reply@psicologiacatolicatradicional.com',
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Remove tags HTML se text não for fornecido
    });
    
    return true;
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return false;
  }
}

/**
 * Envia um email de boas-vindas com instruções para definição de senha
 * @param name Nome do usuário
 * @param email Email do usuário
 * @param hashUrl URL de redefinição de senha
 * @param token Token de acesso
 * @returns Promise resolvida quando o email é enviado
 */
export async function sendWelcomeEmail(
  name: string,
  email: string,
  hashUrl: string,
  token: string
): Promise<boolean> {
  const resetUrl = `https://psicologiacatolicatradicional.com/pwd/${hashUrl}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Bem-vindo à Psicologia Católica Tradicional</h2>
      <p>Olá ${name},</p>
      <p>Sua conta foi criada com sucesso!</p>
      <p>Para completar seu cadastro, acesse o link abaixo e defina sua senha:</p>
      <p><a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px;">Definir minha senha</a></p>
      <p>Ou copie e cole este link no seu navegador: <br/>
      <a href="${resetUrl}">${resetUrl}</a></p>
      <p><strong>Seu token de acesso:</strong> ${token}</p>
      <p>Este token e URL terão validade de 5 dias. Após esse período, não será possível acessar a página de definição de senha.</p>
      <p>Caso tenha dúvidas, entre em contato com o suporte.</p>
      <p>Atenciosamente,<br/>Equipe PCT</p>
    </div>
  `;

  const text = `
    Bem-vindo à Psicologia Católica Tradicional
    
    Olá ${name},
    
    Sua conta foi criada com sucesso!
    
    Para completar seu cadastro, acesse o link abaixo e defina sua senha:
    ${resetUrl}
    
    Seu token de acesso: ${token}
    
    Este token e URL terão validade de 5 dias. Após esse período, não será possível acessar a página de definição de senha.
    
    Caso tenha dúvidas, entre em contato com o suporte.
    
    Atenciosamente,
    Equipe PCT
  `;

  return sendEmail({
    to: email,
    subject: 'Bem-vindo à PCT - Defina sua senha',
    html,
    text
  });
}