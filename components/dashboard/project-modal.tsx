"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Globe, Lock } from "lucide-react"
import type { Project } from "@/types"

interface ProjectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (title: string, description: string, isPublic?: boolean) => Promise<void>
  project?: Project | null
}

export function ProjectModal({
  open,
  onOpenChange,
  onSubmit,
  project,
}: ProjectModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    isPublic: true,
  })

  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title,
        description: project.description,
        isPublic: project.isPublic,
      })
    } else {
      setFormData({ title: "", description: "", isPublic: true })
    }
  }, [project, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await onSubmit(formData.title, formData.description, project ? undefined : formData.isPublic)
      onOpenChange(false)
      setFormData({ title: "", description: "", isPublic: true })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {project ? "Editar Projeto" : "Novo Projeto"}
          </DialogTitle>
          <DialogDescription>
            {project
              ? "Atualize as informacoes do seu projeto"
              : "Crie um novo projeto para organizar suas finanças"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <FieldGroup className="py-4">
            <Field>
              <FieldLabel htmlFor="title">Titulo do Projeto</FieldLabel>
              <Input
                id="title"
                placeholder="Ex: Freelance, E-commerce, Pessoal"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
                disabled={isLoading}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="description">Descrição</FieldLabel>
              <Textarea
                id="description"
                placeholder="Uma breve descrição do projeto"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                disabled={isLoading}
              />
            </Field>

            {!project && (
              <Field>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    {formData.isPublic ? (
                      <Globe className="h-5 w-5 text-emerald-600" />
                    ) : (
                      <Lock className="h-5 w-5 text-muted-foreground" />
                    )}
                    <div className="space-y-0.5">
                      <Label htmlFor="isPublic" className="text-sm font-medium cursor-pointer">
                        {formData.isPublic ? "Projeto Público" : "Projeto Privado"}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {formData.isPublic
                          ? "Qualquer pessoa com o código poderá visualizar"
                          : "Apenas você terá acesso ao projeto"}
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="isPublic"
                    checked={formData.isPublic}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isPublic: checked })
                    }
                    disabled={isLoading}
                  />
                </div>
              </Field>
            )}
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Spinner className="mr-2" />
                  Salvando...
                </>
              ) : project ? (
                "Salvar"
              ) : (
                "Criar Projeto"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
