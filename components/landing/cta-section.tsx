"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, LayoutDashboard } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export function CTASection() {
  const { user, loading } = useAuth()

  return (
    <section className="bg-primary px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="font-display text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
          Pronto para ter controle total das suas finanças?
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-primary-foreground/80">
          Comece agora gratuitamente e experimente a tranquilidade de uma gestão 
          financeira verdadeiramente transparente.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          {!loading && (
            user ? (
              <Button
                size="lg"
                variant="secondary"
                asChild
                className="w-full sm:w-auto"
              >
                <Link href="/dashboard">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Acessar Dashboard
                </Link>
              </Button>
            ) : (
              <Button
                size="lg"
                variant="secondary"
                asChild
                className="w-full sm:w-auto"
              >
                <Link href="/login">
                  Criar Conta Gratuita
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )
          )}
          <Button
            size="lg"
            variant="outline"
            asChild
            className="w-full border-primary-foreground/20 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground sm:w-auto"
          >
            <Link href="/transparencia">Ver Demonstração</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
