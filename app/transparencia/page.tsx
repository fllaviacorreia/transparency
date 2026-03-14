"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { collection, query, orderBy, getDocs, where, Timestamp } from "firebase/firestore"
import { db, isFirebaseConfigured } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { Empty, EmptyMedia, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { 
  Shield, 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  CreditCard,
  Banknote,
  QrCode,
  Calendar,
  // RefreshCw,
  Search,
  Lock,
  Eye,
  AlertTriangle
} from "lucide-react"
import type { Transaction, Project } from "@/types"

const paymentMethodIcons = {
  pix: QrCode,
  cartao: CreditCard,
  dinheiro: Banknote,
}

const paymentMethodLabels = {
  pix: "PIX",
  cartao: "Cartão",
  dinheiro: "Dinheiro",
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

function formatDate(timestamp: Timestamp) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(timestamp.toDate())
}

function TransparenciaContent() {
  const searchParams = useSearchParams()
  const [code, setCode] = useState(searchParams.get("code") || "")
  const [project, setProject] = useState<Project | null>(null)
  const [entries, setEntries] = useState<Transaction[]>([])
  const [exits, setExits] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = useCallback(async (searchCode?: string) => {
    const codeToSearch = searchCode || code
    if (!codeToSearch.trim()) return
    if (!db) {
      setError("Sistema não configurado")
      return
    }

    setLoading(true)
    setError(null)
    setSearched(true)

    try {
      // Buscar projeto pelo código
      const projectQuery = query(
        collection(db, "projects"),
        where("publicCode", "==", codeToSearch.toUpperCase().trim()),
        where("isPublic", "==", true)
      )

      const projectSnap = await getDocs(projectQuery)

      if (projectSnap.empty) {
        setProject(null)
        setEntries([])
        setExits([])
        setError("Projeto não encontrado ou não é público")
        setLoading(false)
        return
      }

      const projectData = {
        id: projectSnap.docs[0].id,
        ...projectSnap.docs[0].data(),
      } as Project

      setProject(projectData)

      // Buscar transações do projeto
      const transactionsQuery = query(
        collection(db, "transactions"),
        where("projectId", "==", projectData.id),
        orderBy("createdAt", "desc")
      )

      const transactionsSnap = await getDocs(transactionsQuery)
      
      const allTransactions = transactionsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Transaction[]

      setEntries(allTransactions.filter((t) => t.type === "entrada"))
      setExits(allTransactions.filter((t) => t.type === "saida"))
    } catch (err) {
      console.error("Error fetching data:", err)
      setError("Erro ao buscar dados do projeto")
    } finally {
      setLoading(false)
    }
  }, [code])

  useEffect(() => {
    const initialCode = searchParams.get("code")
    if (initialCode) {
      handleSearch(initialCode)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const TransactionCard = ({ 
    transaction, 
    type 
  }: { 
    transaction: Transaction
    type: "entrada" | "saida" 
  }) => {
    const PaymentIcon = paymentMethodIcons[transaction.paymentMethod]
    
    return (
      <div className="flex items-start justify-between gap-4 rounded-lg border border-border/50 bg-card p-4 transition-colors hover:border-border">
        <div className="flex items-start gap-3">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
            type === "entrada" 
              ? "bg-income/10 text-income" 
              : "bg-expense/10 text-expense"
          }`}>
            {type === "entrada" ? (
              <TrendingUp className="h-5 w-5" />
            ) : (
              <TrendingDown className="h-5 w-5" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-foreground">
              {transaction.description || "Sem descrição"}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <PaymentIcon className="h-3 w-3" />
                {paymentMethodLabels[transaction.paymentMethod]}
              </Badge>
              {transaction.createdAt && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {formatDate(transaction.createdAt)}
                </span>
              )}
            </div>
          </div>
        </div>
        <p className={`whitespace-nowrap font-semibold ${
          type === "entrada" ? "text-income" : "text-expense"
        }`}>
          {type === "entrada" ? "+" : "-"}{formatCurrency(transaction.value)}
        </p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
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
      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Page Title */}
          <div className="mb-8 text-center">
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Transparência Financeira
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Insira o código do projeto para acompanhar as movimentações
            </p>
          </div>

          {/* Search Section */}
          <Card className="mx-auto mb-8 max-w-xl border-border/50">
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Eye className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Consultar Projeto</CardTitle>
              <CardDescription>
                Digite o código de 8 caracteres do projeto que deseja visualizar
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!isFirebaseConfigured && (
                <Alert variant="destructive" className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Sistema não configurado</AlertTitle>
                  <AlertDescription>
                    Configure o Firebase para habilitar a consulta.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <Input
                  placeholder="Ex: ABC12345"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  onKeyDown={handleKeyDown}
                  maxLength={8}
                  className="font-mono text-center text-lg uppercase tracking-widest"
                  disabled={!isFirebaseConfigured}
                />
                <Button 
                  onClick={() => handleSearch()} 
                  disabled={loading || !code.trim() || !isFirebaseConfigured}
                >
                  {loading ? (
                    <Spinner className="h-4 w-4" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {error && (
                <p className="mt-3 text-center text-sm text-destructive">
                  {error}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Results */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Spinner className="h-8 w-8" />
            </div>
          ) : project ? (
            <>
              {/* Project Info */}
              <Card className="mx-auto mb-6 max-w-xl border-primary/20 bg-primary/5">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-foreground">
                        {project.title}
                      </h2>
                      {project.description && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {project.description}
                        </p>
                      )}
                    </div>
                    <Badge variant="secondary" className="font-mono">
                      {project.publicCode}
                    </Badge>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-4 rounded-lg bg-background p-4">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Entradas</p>
                      <p className="text-lg font-semibold text-income">
                        {formatCurrency(project.totalIncome)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Saídas</p>
                      <p className="text-lg font-semibold text-expense">
                        {formatCurrency(project.totalExpense)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Saldo</p>
                      <p className={`text-lg font-semibold ${project.balance >= 0 ? "text-income" : "text-expense"}`}>
                        {formatCurrency(project.balance)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Transactions */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Entries Column */}
                <Card className="border-border/50">
                  <CardHeader className="border-b border-border/50 bg-income/5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-income/10">
                        <TrendingUp className="h-5 w-5 text-income" />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-income">Entradas</CardTitle>
                        <CardDescription>{entries.length} registros</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    {entries.length === 0 ? (
                      <Empty>
                        <EmptyMedia variant="icon">
                          <TrendingUp />
                        </EmptyMedia>
                        <EmptyHeader>
                          <EmptyTitle>Nenhuma entrada</EmptyTitle>
                          <EmptyDescription>Este projeto ainda não possui entradas</EmptyDescription>
                        </EmptyHeader>
                      </Empty>
                    ) : (
                      <div className="space-y-3">
                        {entries.map((entry) => (
                          <TransactionCard 
                            key={entry.id} 
                            transaction={entry} 
                            type="entrada" 
                          />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Exits Column */}
                <Card className="border-border/50">
                  <CardHeader className="border-b border-border/50 bg-expense/5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-expense/10">
                        <TrendingDown className="h-5 w-5 text-expense" />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-expense">Saídas</CardTitle>
                        <CardDescription>{exits.length} registros</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    {exits.length === 0 ? (
                      <Empty>
                        <EmptyMedia variant="icon">
                          <TrendingDown />
                        </EmptyMedia>
                        <EmptyHeader>
                          <EmptyTitle>Nenhuma saída</EmptyTitle>
                          <EmptyDescription>Este projeto ainda não possui saídas</EmptyDescription>
                        </EmptyHeader>
                      </Empty>
                    ) : (
                      <div className="space-y-3">
                        {exits.map((exit) => (
                          <TransactionCard 
                            key={exit.id} 
                            transaction={exit} 
                            type="saida" 
                          />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          ) : searched && !error ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Lock className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-foreground">
                Projeto não encontrado
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Verifique o código e tente novamente
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-foreground">
                Busque um projeto
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Digite o código acima para visualizar as movimentações
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-sm text-muted-foreground">
            Dados atualizados em tempo real. {new Date().getFullYear()} Transparency.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default function TransparenciaPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    }>
      <TransparenciaContent />
    </Suspense>
  )
}
