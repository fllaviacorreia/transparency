"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  MoreVertical, 
  Pencil, 
  Trash2, 
  TrendingUp, 
  TrendingDown,
  Wallet,
  Eye,
  EyeOff,
  Copy,
  Check
} from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import type { Project } from "@/types"

interface ProjectCardProps {
  project: Project
  isSelected: boolean
  onSelect: () => void
  onEdit: () => void
  onDelete: () => void
  onToggleVisibility: (isPublic: boolean) => void
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

export function ProjectCard({
  project,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onToggleVisibility,
}: ProjectCardProps) {
  const [copied, setCopied] = useState(false)
  const balance = (project.totalIncome || 0) - (project.totalExpense || 0)
  const isPositive = balance >= 0

  const copyCode = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(project.publicCode || "")
    setCopied(true)
    toast.success("Codigo copiado!")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card
      className={`cursor-pointer transition-all hover:border-primary/50 ${
        isSelected ? "border-primary ring-1 ring-primary" : "border-border/50"
      }`}
      onClick={onSelect}
    >
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div className="min-w-0 flex-1">
          <CardTitle className="truncate text-lg">{project.title}</CardTitle>
          <CardDescription className="mt-1 line-clamp-2">
            {project.description || "Sem descricao"}
          </CardDescription>
          {project.publicCode && (
            <div className="mt-2 flex items-center gap-2">
              <Badge 
                variant="outline" 
                className="cursor-pointer font-mono text-xs"
                onClick={copyCode}
              >
                {copied ? (
                  <Check className="mr-1 h-3 w-3 text-income" />
                ) : (
                  <Copy className="mr-1 h-3 w-3" />
                )}
                {project.publicCode}
              </Badge>
              <Badge 
                variant={project.isPublic ? "default" : "secondary"}
                className="text-xs"
              >
                {project.isPublic ? (
                  <>
                    <Eye className="mr-1 h-3 w-3" />
                    Publico
                  </>
                ) : (
                  <>
                    <EyeOff className="mr-1 h-3 w-3" />
                    Privado
                  </>
                )}
              </Badge>
            </div>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="sm" className="-mr-2 -mt-1 shrink-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                onEdit()
              }}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                onToggleVisibility(!project.isPublic)
              }}
            >
              {project.isPublic ? (
                <>
                  <EyeOff className="mr-2 h-4 w-4" />
                  Tornar Privado
                </>
              ) : (
                <>
                  <Eye className="mr-2 h-4 w-4" />
                  Tornar Publico
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-income" />
              Entradas
            </div>
            <p className="font-semibold text-income">
              {formatCurrency(project.totalIncome || 0)}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingDown className="h-3 w-3 text-expense" />
              Saidas
            </div>
            <p className="font-semibold text-expense">
              {formatCurrency(project.totalExpense || 0)}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Wallet className="h-3 w-3" />
              Saldo
            </div>
            <p className={`font-semibold ${isPositive ? "text-income" : "text-expense"}`}>
              {formatCurrency(balance)}
            </p>
          </div>
        </div>

        {isSelected && (
          <Badge className="mt-3" variant="secondary">
            Selecionado
          </Badge>
        )}
      </CardContent>
    </Card>
  )
}
