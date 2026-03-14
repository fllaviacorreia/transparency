"use client"

import { useState, useEffect } from "react"
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
import type { Project } from "@/types"

interface ProjectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (title: string, description: string) => Promise<void>
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
  })

  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title,
        description: project.description,
      })
    } else {
      setFormData({ title: "", description: "" })
    }
  }, [project, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await onSubmit(formData.title, formData.description)
      onOpenChange(false)
      setFormData({ title: "", description: "" })
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
