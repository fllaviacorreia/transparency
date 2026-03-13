import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CTASection() {
  return (
    <section className="bg-primary px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="font-display text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
          Pronto para ter controle total das suas financas?
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-primary-foreground/80">
          Comece agora gratuitamente e experimente a tranquilidade de uma gestao 
          financeira verdadeiramente transparente.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
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
          <Button
            size="lg"
            variant="outline"
            asChild
            className="w-full border-primary-foreground/20 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground sm:w-auto"
          >
            <Link href="/transparencia">Ver Demonstracao</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
