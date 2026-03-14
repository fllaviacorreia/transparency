import { NextResponse } from "next/server"
import { sendWelcomeEmail } from "@/lib/mail"

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json()

    if (!email || !name) {
      return NextResponse.json(
        { error: "E-mail e nome são obrigatórios." },
        { status: 400 }
      )
    }

    await sendWelcomeEmail(email, name)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao enviar e-mail de boas-vindas:", error)
    return NextResponse.json(
      { error: "Erro ao enviar e-mail de boas-vindas." },
      { status: 500 }
    )
  }
}
