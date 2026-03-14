"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { Shield, ArrowLeft, Mail, CheckCircle } from "lucide-react"
import { toast } from "sonner"

export default function RecuperarSenhaPage() {
  const router = useRouter()
  const { resetPassword, user, loading } = useAuth()
  
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [email, setEmail] = useState("")

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard")
    }
  }, [user, loading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await resetPassword(email)
      setEmailSent(true)
      toast.success("E-mail de recuperação enviado!")
    } catch (error: unknown) {
      const firebaseError = error as { code?: string }
      
      if (firebaseError.code === "auth/user-not-found") {
        toast.error("E-mail não encontrado.")
      } else {
        toast.error("Erro ao enviar e-mail. Tente novamente.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight">
              Transparency
            </span>
          </Link>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Login
            </Link>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md border-border/50 shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
              {emailSent ? (
                <CheckCircle className="h-8 w-8 text-primary" />
              ) : (
                <Mail className="h-8 w-8 text-primary" />
              )}
            </div>
            <CardTitle className="font-display text-2xl">
              {emailSent ? "E-mail Enviado!" : "Recuperar Senha"}
            </CardTitle>
            <CardDescription className="text-base">
              {emailSent
                ? "Verifique sua caixa de entrada e siga as instruções"
                : "Digite seu e-mail para receber o link de recuperação"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {emailSent ? (
              <div className="space-y-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Enviamos um e-mail para <strong>{email}</strong> com 
                  instruções para redefinir sua senha. O link expira em 1 hora.
                </p>
                <Button asChild className="w-full">
                  <Link href="/login">Voltar ao Login</Link>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => setEmailSent(false)}
                >
                  Enviar novamente
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Field>
                  <FieldLabel htmlFor="email">E-mail</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </Field>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Spinner className="mr-2" />
                      Enviando...
                    </>
                  ) : (
                    "Enviar Link de Recuperação"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
