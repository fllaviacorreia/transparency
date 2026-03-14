"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, X, FileText, Image as ImageIcon } from "lucide-react"
import type { PaymentMethod } from "@/types"

interface TransactionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: {
    type: "entrada" | "saida"
    value: number
    paymentMethod: PaymentMethod
    description: string
    receipt?: File
  }) => Promise<void>
  projectTitle: string
}

export function TransactionModal({
  open,
  onOpenChange,
  onSubmit,
  projectTitle,
}: TransactionModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    type: "entrada" as "entrada" | "saida",
    value: "",
    paymentMethod: "pix" as PaymentMethod,
    description: "",
  })
  const [receipt, setReceipt] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await onSubmit({
        type: formData.type,
        value: parseFloat(formData.value.replace(",", ".")),
        paymentMethod: formData.paymentMethod,
        description: formData.description,
        receipt: receipt || undefined,
      })
      onOpenChange(false)
      resetForm()
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      type: "entrada",
      value: "",
      paymentMethod: "pix",
      description: "",
    })
    setReceipt(null)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("O arquivo deve ter no máximo 5MB")
        return
      }
      // Check file type
      const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"]
      if (!allowedTypes.includes(file.type)) {
        alert("Tipo de arquivo não permitido. Use JPG, PNG, WebP ou PDF")
        return
      }
      setReceipt(file)
    }
  }

  const getFileIcon = (file: File) => {
    if (file.type === "application/pdf") {
      return <FileText className="h-4 w-4" />
    }
    return <ImageIcon className="h-4 w-4" />
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Transação</DialogTitle>
          <DialogDescription>
            Adicionar transação em <strong>{projectTitle}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <FieldGroup className="py-4">
            {/* Type Tabs */}
            <Field>
              <FieldLabel>Tipo</FieldLabel>
              <Tabs
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value as "entrada" | "saida" })
                }
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger
                    value="entrada"
                    className="data-[state=active]:bg-income/10 data-[state=active]:text-income"
                  >
                    Entrada
                  </TabsTrigger>
                  <TabsTrigger
                    value="saida"
                    className="data-[state=active]:bg-expense/10 data-[state=active]:text-expense"
                  >
                    Saída
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </Field>

            {/* Value */}
            <Field>
              <FieldLabel htmlFor="value">Valor (R$)</FieldLabel>
              <Input
                id="value"
                type="text"
                inputMode="decimal"
                placeholder="0,00"
                value={formData.value}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9,]/g, "")
                  setFormData({ ...formData, value })
                }}
                required
                disabled={isLoading}
              />
            </Field>

            {/* Payment Method */}
            <Field>
              <FieldLabel htmlFor="paymentMethod">Forma de Pagamento</FieldLabel>
              <Select
                value={formData.paymentMethod}
                onValueChange={(value) =>
                  setFormData({ ...formData, paymentMethod: value as PaymentMethod })
                }
                disabled={isLoading}
              >
                <SelectTrigger id="paymentMethod">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="cartao">Cartão</SelectItem>
                  <SelectItem value="dinheiro">Dinheiro</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            {/* Description */}
            <Field>
              <FieldLabel htmlFor="description">Descrição</FieldLabel>
              <Textarea
                id="description"
                placeholder="Descreva a transação"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={2}
                disabled={isLoading}
              />
            </Field>

            {/* Receipt Upload */}
            <Field>
              <FieldLabel>Comprovante (opcional)</FieldLabel>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              
              {receipt ? (
                <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3">
                  <div className="flex items-center gap-2 truncate">
                    {getFileIcon(receipt)}
                    <span className="truncate text-sm">{receipt.name}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setReceipt(null)}
                    className="shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Anexar Comprovante
                </Button>
              )}
              <p className="text-xs text-muted-foreground">
                JPG, PNG, WebP ou PDF. Máximo 5MB.
              </p>
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false)
                resetForm()
              }}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.value}
              className={
                formData.type === "entrada"
                  ? "bg-income hover:bg-income/90"
                  : "bg-expense hover:bg-expense/90"
              }
            >
              {isLoading ? (
                <>
                  <Spinner className="mr-2" />
                  Salvando...
                </>
              ) : (
                `Adicionar ${formData.type === "entrada" ? "Entrada" : "Saída"}`
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
