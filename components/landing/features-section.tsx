import {
  FolderKanban,
  Receipt,
  BarChart3,
  Upload,
  CreditCard,
  Lock,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const features = [
  {
    icon: FolderKanban,
    title: "Multiplos Projetos",
    description:
      "Gerencie ate 5 projetos simultaneamente, cada um com seu proprio controle financeiro independente.",
  },
  {
    icon: Receipt,
    title: "Entradas e Saidas",
    description:
      "Registre todas as suas transacoes com detalhes como valor, forma de pagamento e descricao.",
  },
  {
    icon: Upload,
    title: "Comprovantes",
    description:
      "Anexe comprovantes em imagem ou PDF para cada transacao. Tudo organizado e acessivel.",
  },
  {
    icon: BarChart3,
    title: "Graficos Intuitivos",
    description:
      "Visualize suas financas com graficos de pizza e barras. Entenda para onde vai seu dinheiro.",
  },
  {
    icon: CreditCard,
    title: "Formas de Pagamento",
    description:
      "Categorize por PIX, cartao ou dinheiro. Saiba exatamente como o dinheiro entra e sai.",
  },
  {
    icon: Lock,
    title: "Seguranca",
    description:
      "Seus dados estao protegidos com autenticacao segura e criptografia de ponta a ponta.",
  },
]

export function FeaturesSection() {
  return (
    <section id="recursos" className="bg-muted/30 px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Tudo que voce precisa para uma gestao transparente
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Recursos pensados para simplificar sua vida financeira e manter 
            total controle sobre seus projetos.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="border-border/50 bg-card transition-all hover:border-primary/30 hover:shadow-md"
            >
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
