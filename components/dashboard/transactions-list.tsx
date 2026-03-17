"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Empty, EmptyMedia, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { Spinner } from "@/components/ui/spinner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { 
  TrendingUp, 
  TrendingDown, 
  CreditCard,
  Banknote,
  QrCode,
  Trash2,
  FileText,
  ExternalLink,
  Calendar,
  Receipt
} from "lucide-react"
import { ImageEditorModal } from "@/components/image-editor-modal"
import type { Transaction, PaymentMethod } from "@/types"
import type { Timestamp } from "firebase/firestore"

interface TransactionsListProps {
  transactions: Transaction[]
  loading: boolean
  onDelete: (transaction: Transaction) => Promise<void>
}

const paymentMethodConfig: Record<PaymentMethod, { icon: typeof CreditCard; label: string }> = {
  pix: { icon: QrCode, label: "PIX" },
  cartao: { icon: CreditCard, label: "Cartão" },
  dinheiro: { icon: Banknote, label: "Dinheiro" },
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

function formatDate(timestamp: Timestamp) {
  if (!timestamp?.toDate) return ""
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(timestamp.toDate())
}

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".svg"]

function isImageUrl(url: string, name?: string): boolean {
  const candidates = [name?.toLowerCase(), decodeURIComponent(url).toLowerCase()]
  return candidates.some((str) => str && IMAGE_EXTENSIONS.some((ext) => str.includes(ext)))
}

function TransactionItem({
  transaction,
  onDelete,
  onViewReceipt,
}: {
  transaction: Transaction
  onDelete: () => void
  onViewReceipt: (url: string, name?: string) => void
}) {
  const isEntry = transaction.type === "entrada"
  const PaymentIcon = paymentMethodConfig[transaction.paymentMethod].icon

  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-border/50 bg-card p-4 transition-colors hover:border-border">
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
            isEntry ? "bg-income/10 text-income" : "bg-expense/10 text-expense"
          }`}
        >
          {isEntry ? (
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
              {paymentMethodConfig[transaction.paymentMethod].label}
            </Badge>
            {transaction.receiptUrl && (
              isImageUrl(transaction.receiptUrl, transaction.receiptName) ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onViewReceipt(transaction.receiptUrl!, transaction.receiptName)
                  }}
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <FileText className="h-3 w-3" />
                  Ver comprovante
                </button>
              ) : (
                <a
                  href={transaction.receiptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  <FileText className="h-3 w-3" />
                  Comprovante
                  <ExternalLink className="h-3 w-3" />
                </a>
              )
            )}
            {transaction.createdAt && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {formatDate(transaction.createdAt)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <p
          className={`whitespace-nowrap font-semibold ${
            isEntry ? "text-income" : "text-expense"
          }`}
        >
          {isEntry ? "+" : "-"}
          {formatCurrency(transaction.value)}
        </p>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm" className="shrink-0 text-muted-foreground hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir transação?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. A transação de{" "}
                <strong>{formatCurrency(transaction.value)}</strong> será 
                permanentemente removida.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={onDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}

export function TransactionsList({
  transactions,
  loading,
  onDelete,
}: TransactionsListProps) {
  const [editorImage, setEditorImage] = useState<{ url: string; name?: string } | null>(null)

  if (loading) {
    return (
      <Card className="border-border/50">
        <CardContent className="flex items-center justify-center py-12">
          <Spinner className="h-6 w-6" />
        </CardContent>
      </Card>
    )
  }

  return (
    <>
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5 text-primary" />
          Transações
        </CardTitle>
        <CardDescription>
          {transactions.length} transação(ões) registrada(s)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <Empty>
            <EmptyMedia variant="icon">
              <Receipt />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>Nenhuma transação</EmptyTitle>
              <EmptyDescription>Adicione sua primeira entrada ou saída</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <TransactionItem
                key={transaction.id}
                transaction={transaction}
                onDelete={() => onDelete(transaction)}
                onViewReceipt={(url, name) => setEditorImage({ url, name })}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>

    {/* Image Editor Modal */}
    <ImageEditorModal
      open={!!editorImage}
      onOpenChange={(open) => { if (!open) setEditorImage(null) }}
      imageUrl={editorImage?.url || ""}
      imageName={editorImage?.name}
    />
    </>
  )
}
