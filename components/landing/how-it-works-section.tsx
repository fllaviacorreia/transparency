import { UserPlus, FolderPlus, PlusCircle, BarChart3 } from "lucide-react"

const steps = [
  {
    step: "01",
    icon: UserPlus,
    title: "Crie sua conta",
    description: "Cadastre-se com seu e-mail em segundos e acesse a plataforma.",
  },
  {
    step: "02",
    icon: FolderPlus,
    title: "Adicione um projeto",
    description: "Crie projetos para organizar suas finanças por categoria ou objetivo.",
  },
  {
    step: "03",
    icon: PlusCircle,
    title: "Registre transações",
    description: "Adicione entradas e saídas com valores, formas de pagamento e comprovantes.",
  },
  {
    step: "04",
    icon: BarChart3,
    title: "Acompanhe tudo",
    description: "Visualize gráficos e relatórios para tomar melhores decisões.",
  },
]

export function HowItWorksSection() {
  return (
    <section id="como-funciona" className="px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Como funciona
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Em poucos passos você começa a ter controle total das suas finanças.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-4xl">
          <div className="relative">
            {/* Connecting line */}
            <div className="absolute left-8 top-0 hidden h-full w-0.5 bg-border lg:left-1/2 lg:-translate-x-1/2 lg:block" />

            <div className="space-y-12 lg:space-y-0">
              {steps.map((item, index) => (
                <div
                  key={item.step}
                  className={`relative flex flex-col gap-6 lg:flex-row lg:gap-12 ${
                    index % 2 === 1 ? "lg:flex-row-reverse" : ""
                  }`}
                >
                  {/* Content */}
                  <div className={`flex-1 lg:py-8 ${index % 2 === 1 ? "lg:text-right" : ""}`}>
                    <div
                      className={`flex items-start gap-4 ${
                        index % 2 === 1 ? "lg:flex-row-reverse" : ""
                      }`}
                    >
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 lg:hidden">
                        <item.icon className="h-7 w-7 text-primary" />
                      </div>
                      <div>
                        <span className="font-display text-sm font-bold text-primary">
                          Passo {item.step}
                        </span>
                        <h3 className="mt-1 font-display text-xl font-bold text-foreground">
                          {item.title}
                        </h3>
                        <p className="mt-2 text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Center icon - desktop only */}
                  <div className="relative z-10 hidden lg:flex lg:items-center lg:justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-4 border-background bg-primary shadow-lg">
                      <item.icon className="h-7 w-7 text-primary-foreground" />
                    </div>
                  </div>

                  {/* Spacer */}
                  <div className="hidden flex-1 lg:block" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
