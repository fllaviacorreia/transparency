"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { TrendingUp, TrendingDown, Wallet } from "lucide-react"
import type { Transaction, PaymentMethod } from "@/types"

interface DashboardChartsProps {
  transactions: Transaction[]
  totals: {
    income: number
    expense: number
    balance: number
  }
}

const COLORS = {
  income: "oklch(0.55 0.15 160)",
  expense: "oklch(0.55 0.20 25)",
  pix: "oklch(0.55 0.15 160)",
  cartao: "oklch(0.60 0.18 220)",
  dinheiro: "oklch(0.70 0.15 80)",
}

const paymentMethodLabels: Record<PaymentMethod, string> = {
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

export function DashboardCharts({ transactions, totals }: DashboardChartsProps) {
  // Data for pie chart (by payment method)
  const paymentMethodData = transactions.reduce(
    (acc, t) => {
      const key = t.paymentMethod
      if (!acc[key]) {
        acc[key] = { entrada: 0, saida: 0 }
      }
      if (t.type === "entrada") {
        acc[key].entrada += t.value
      } else {
        acc[key].saida += t.value
      }
      return acc
    },
    {} as Record<PaymentMethod, { entrada: number; saida: number }>
  )

  const pieData = Object.entries(paymentMethodData).map(([method, data]) => ({
    name: paymentMethodLabels[method as PaymentMethod],
    value: data.entrada + data.saida,
    color: COLORS[method as PaymentMethod],
  }))

  // Data for bar chart (income vs expense)
  const barData = [
    { name: "Entradas", value: totals.income, color: COLORS.income },
    { name: "Saídas", value: totals.expense, color: COLORS.expense },
  ]

  const isPositive = totals.balance >= 0

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3 lg:col-span-2">
        <Card className="border-border/50">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-income/10">
              <TrendingUp className="h-6 w-6 text-income" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Entradas</p>
              <p className="text-2xl font-bold text-income">
                {formatCurrency(totals.income)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-expense/10">
              <TrendingDown className="h-6 w-6 text-expense" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Saídas</p>
              <p className="text-2xl font-bold text-expense">
                {formatCurrency(totals.expense)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="flex items-center gap-4 p-6">
            <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${
              isPositive ? "bg-income/10" : "bg-expense/10"
            }`}>
              <Wallet className={`h-6 w-6 ${isPositive ? "text-income" : "text-expense"}`} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Saldo</p>
              <p className={`text-2xl font-bold ${isPositive ? "text-income" : "text-expense"}`}>
                {formatCurrency(totals.balance)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pie Chart - Payment Methods */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Por Forma de Pagamento</CardTitle>
          <CardDescription>Distribuição das transações por método</CardDescription>
        </CardHeader>
        <CardContent>
          {pieData.length === 0 ? (
            <div className="flex h-62.5 items-center justify-center text-muted-foreground">
              Sem dados para exibir
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => 
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Bar Chart - Income vs Expense */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Entradas vs Saídas</CardTitle>
          <CardDescription>Comparativo de valores totais</CardDescription>
        </CardHeader>
        <CardContent>
          {totals.income === 0 && totals.expense === 0 ? (
            <div className="flex h-62.5 items-center justify-center text-muted-foreground">
              Sem dados para exibir
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData} layout="vertical">
                <XAxis 
                  type="number" 
                  tickFormatter={(value) => formatCurrency(value)}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={80}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Bar 
                  dataKey="value" 
                  radius={[0, 4, 4, 0]}
                >
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
