"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Shield, LayoutDashboard } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export function Header() {
  const { user, loading } = useAuth()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight">
            Transparency
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/transparencia"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Transparência
          </Link>
          <Link
            href="#recursos"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Recursos
          </Link>
          <Link
            href="#como-funciona"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Como Funciona
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {!loading && (
            user ? (
              <Button asChild>
                <Link href="/dashboard">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Acessar Dashboard
                </Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild className="hidden sm:inline-flex">
                  <Link href="/login">Entrar</Link>
                </Button>
                <Button asChild>
                  <Link href="/login">Começar Agora</Link>
                </Button>
              </>
            )
          )}
        </div>
      </div>
    </header>
  )
}
