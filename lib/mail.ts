import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  secure: process.env.MAIL_SECURE === "true",
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
})

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject: "Redefinição de Senha - Transparency",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Redefinição de Senha</h2>
        <p>Você solicitou a redefinição da sua senha. Clique no botão abaixo para criar uma nova senha:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #0f172a; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Redefinir Senha
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">
          Se você não solicitou essa alteração, ignore este e-mail. O link expira em 1 hora.
        </p>
        <p style="color: #666; font-size: 14px;">
          Caso o botão não funcione, copie e cole o link abaixo no seu navegador:
        </p>
        <p style="word-break: break-all; font-size: 13px; color: #888;">${resetUrl}</p>
      </div>
    `,
  })
}

export async function sendWelcomeEmail(to: string, name: string) {
  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject: "Bem-vindo(a) ao Transparency!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Bem-vindo(a), ${name}! 🎉</h2>
        <p>Sua conta no <strong>Transparency</strong> foi criada com sucesso.</p>
        <p>Agora você pode gerenciar seus projetos com total transparência financeira. Aqui estão algumas coisas que você pode fazer:</p>
        <ul style="color: #555; line-height: 1.8;">
          <li>Criar projetos e registrar transações</li>
          <li>Compartilhar a transparência dos seus projetos com um código público</li>
          <li>Acompanhar entradas, saídas e saldo em tempo real</li>
        </ul>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.PROJECT_URL}/dashboard" 
             style="background-color: #0f172a; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Acessar Dashboard
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">
          Se você não criou esta conta, por favor ignore este e-mail.
        </p>
      </div>
    `,
  })
}

export async function sendLoginNotificationEmail(to: string) {
  const now = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })
  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject: "Novo login detectado - Transparency",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Novo login na sua conta</h2>
        <p>Detectamos um novo login na sua conta do <strong>Transparency</strong>.</p>
        <div style="background-color: #f8f9fa; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="margin: 0; color: #555;"><strong>Data/Hora:</strong> ${now}</p>
        </div>
        <p style="color: #666; font-size: 14px;">
          Se foi você, pode ignorar este e-mail. Caso não reconheça este acesso, recomendamos alterar sua senha imediatamente.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.PROJECT_URL}/recuperar-senha" 
             style="background-color: #dc2626; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Alterar Senha
          </a>
        </div>
      </div>
    `,
  })
}
