"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FieldGroup, Field, FieldLabel, FieldDescription } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ImagePlus, X, Link as LinkIcon } from "lucide-react"
import type { Goal } from "@/types"

interface GoalModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: {
    title: string
    description: string
    link?: string
    image?: File
    removeImage?: boolean
  }) => Promise<void>
  goal?: Goal | null
  projectTitle: string
}

export function GoalModal({
  open,
  onOpenChange,
  onSubmit,
  goal,
  projectTitle,
}: GoalModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    link: "",
  })
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [removeExistingImage, setRemoveExistingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (goal) {
      setFormData({
        title: goal.title,
        description: goal.description,
        link: goal.link || "",
      })
      setPreviewUrl(goal.imageUrl || null)
      setRemoveExistingImage(false)
    } else {
      setFormData({ title: "", description: "", link: "" })
      setPreviewUrl(null)
      setRemoveExistingImage(false)
    }
    setSelectedImage(null)
  }, [goal, open])

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("A imagem deve ter no máximo 5MB")
        return
      }
      setSelectedImage(file)
      setPreviewUrl(URL.createObjectURL(file))
      setRemoveExistingImage(false)
    }
  }

  const handleRemoveImage = () => {
    setSelectedImage(null)
    setPreviewUrl(null)
    if (goal?.imageUrl) {
      setRemoveExistingImage(true)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await onSubmit({
        title: formData.title,
        description: formData.description,
        link: formData.link || undefined,
        image: selectedImage || undefined,
        removeImage: removeExistingImage,
      })
      onOpenChange(false)
      setFormData({ title: "", description: "", link: "" })
      setSelectedImage(null)
      setPreviewUrl(null)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {goal ? "Editar Meta Atual" : "Nova Meta Atual"}
          </DialogTitle>
          <DialogDescription>
            {goal
              ? `Atualize a meta atual do projeto ${projectTitle}`
              : `Adicione uma meta atual para o projeto ${projectTitle}. Ela será exibida na área pública de transparência.`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <FieldGroup className="py-4">
            <Field>
              <FieldLabel htmlFor="goal-title" required>Título da Meta</FieldLabel>
              <Input
                id="goal-title"
                placeholder="Ex: Compra de equipamentos, Reforma do espaço"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
                disabled={isLoading}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="goal-description" required>Descrição</FieldLabel>
              <Textarea
                id="goal-description"
                placeholder="Descreva os detalhes da meta atual..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                required
                disabled={isLoading}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="goal-link">Link (opcional)</FieldLabel>
              <FieldDescription>
                Adicione um link para mais informações sobre a meta
              </FieldDescription>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="goal-link"
                  type="url"
                  placeholder="https://exemplo.com/mais-info"
                  value={formData.link}
                  onChange={(e) =>
                    setFormData({ ...formData, link: e.target.value })
                  }
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
            </Field>

            <Field>
              <FieldLabel>Imagem (opcional)</FieldLabel>
              <FieldDescription>
                Adicione uma imagem ilustrativa para a meta (max 5MB)
              </FieldDescription>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                disabled={isLoading}
              />

              {previewUrl ? (
                <div className="relative mt-2 overflow-hidden rounded-lg border border-border">
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    width={400}
                    height={200}
                    className="h-48 w-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute right-2 top-2 h-8 w-8"
                    onClick={handleRemoveImage}
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="mt-2 w-full gap-2"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                >
                  <ImagePlus className="h-4 w-4" />
                  Adicionar Imagem
                </Button>
              )}
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
              ) : goal ? (
                "Salvar"
              ) : (
                "Criar Meta"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
