import { NextResponse } from "next/server"
import { sendLoginNotificationEmail } from "@/lib/mail"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: "E-mail é obrigatório." },
        { status: 400 }
      )
    }

    await sendLoginNotificationEmail(email)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao enviar notificação de login:", error)
    return NextResponse.json(
      { error: "Erro ao enviar notificação de login." },
      { status: 500 }
    )
  }
}
