"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { Shield, ArrowLeft, Eye, EyeOff, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function LoginPage() {
  const router = useRouter()
  const { signIn, signUp, isConfigured, user, loading } = useAuth()
  
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isNewUser, setIsNewUser] = useState(false)
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  })

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard")
    }
  }, [user, loading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (isNewUser) {
        await signUp(formData.email, formData.password, formData.name)
        toast.success("Conta criada com sucesso!")
      } else {
        await signIn(formData.email, formData.password)
        toast.success("Login realizado com sucesso!")
      }
      router.push("/dashboard")
    } catch (error: unknown) {
      const firebaseError = error as { code?: string }
      
      // Check if it's a new user error
      if (firebaseError.code === "auth/user-not-found" || firebaseError.code === "auth/invalid-credential") {
        setIsNewUser(true)
        toast.info("E-mail não cadastrado. Preencha seu nome para criar uma conta.")
      } else if (firebaseError.code === "auth/wrong-password") {
        toast.error("Senha incorreta.")
      } else if (firebaseError.code === "auth/email-already-in-use") {
        toast.error("Este e-mail já está em uso.")
      } else if (firebaseError.code === "auth/weak-password") {
        toast.error("A senha deve ter pelo menos 6 caracteres.")
      } else {
        toast.error("Erro ao processar. Tente novamente.")
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
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Link>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md border-border/50 shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="font-display text-2xl">
              {isNewUser ? "Criar Conta" : "Acessar Plataforma"}
            </CardTitle>
            <CardDescription className="text-base">
              {isNewUser
                ? "Complete seu cadastro para começar"
                : "Digite seu e-mail e senha para entrar"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {!isConfigured && (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Firebase não configurado</AlertTitle>
                <AlertDescription>
                  Configure as variáveis de ambiente do Firebase para habilitar o login.
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="email" required>E-mail</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                    disabled={isLoading}
                  />
                </Field>

                {isNewUser && (
                  <Field>
                    <FieldLabel htmlFor="name" required>Nome Completo</FieldLabel>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Seu nome"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required={isNewUser}
                      disabled={isLoading}
                    />
                  </Field>
                )}

                <Field>
                  <div className="flex items-center justify-between">
                    <FieldLabel htmlFor="password" required>Senha</FieldLabel>
                    {!isNewUser && (
                      <Link
                        href="/recuperar-senha"
                        className="text-sm text-primary hover:underline"
                      >
                        Esqueceu a senha?
                      </Link>
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Sua senha"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      required
                      disabled={isLoading}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </Field>
              </FieldGroup>

              <Button type="submit" className="w-full" disabled={isLoading || !isConfigured}>
                {isLoading ? (
                  <>
                    <Spinner className="mr-2" />
                    Processando...
                  </>
                ) : isNewUser ? (
                  "Criar Conta"
                ) : (
                  "Entrar"
                )}
              </Button>

              {isNewUser && (
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setIsNewUser(false)}
                >
                  Já tenho uma conta
                </Button>
              )}
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
