import Link from "next/link"
import { Shield } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border bg-card px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Shield className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight">
              Transpareny
            </span>
          </Link>

          <nav className="flex flex-wrap items-center justify-center gap-6">
            <Link
              href="/transparencia"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Transparencia
            </Link>
            <Link
              href="#recursos"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Recursos
            </Link>
            <Link
              href="#como-funciona"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Como Funciona
            </Link>
            <Link
              href="/login"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Entrar
            </Link>
          </nav>
        </div>

        <div className="mt-8 border-t border-border pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            {new Date().getFullYear()} Transpareny. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
