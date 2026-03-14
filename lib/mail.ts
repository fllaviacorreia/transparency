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
