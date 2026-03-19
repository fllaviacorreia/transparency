"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Target, Plus, MoreVertical, Pencil, Trash2, ExternalLink, CheckCircle } from "lucide-react"
import { useGoals } from "@/hooks/use-goals"
import { GoalModal } from "./goal-modal"
import { toast } from "sonner"
import type { Goal } from "@/types"

interface GoalSectionProps {
  projectId: string
  projectTitle: string
}

export function GoalSection({ projectId, projectTitle }: GoalSectionProps) {
  const {
    goals,
    activeGoal,
    loading,
    createGoal,
    updateGoal,
    deleteGoal,
    setGoalActive,
  } = useGoals(projectId)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [goalToDelete, setGoalToDelete] = useState<Goal | null>(null)

  const handleCreate = async (data: {
    title: string
    description: string
    link?: string
    image?: File
  }) => {
    try {
      await createGoal(data)
      toast.success("Meta criada com sucesso!")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao criar meta")
      throw error
    }
  }

  const handleUpdate = async (data: {
    title: string
    description: string
    link?: string
    image?: File
    removeImage?: boolean
  }) => {
    if (!editingGoal) return
    try {
      await updateGoal(editingGoal.id, data)
      toast.success("Meta atualizada!")
    } catch {
      toast.error("Erro ao atualizar meta")
      throw new Error("Erro ao atualizar meta")
    }
  }

  const handleDelete = async () => {
    if (!goalToDelete) return
    try {
      await deleteGoal(goalToDelete.id)
      toast.success("Meta excluída!")
    } catch {
      toast.error("Erro ao excluir meta")
    }
    setDeleteDialogOpen(false)
    setGoalToDelete(null)
  }

  const handleSetActive = async (goalId: string) => {
    try {
      await setGoalActive(goalId)
      toast.success("Meta definida como ativa!")
    } catch {
      toast.error("Erro ao definir meta ativa")
    }
  }

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
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Meta Atual</CardTitle>
              <CardDescription>
                Exibida na página pública de transparência
              </CardDescription>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => {
              setEditingGoal(null)
              setModalOpen(true)
            }}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Nova Meta
          </Button>
        </CardHeader>
        <CardContent>
          {goals.length === 0 ? (
            <Empty>
              <EmptyMedia variant="icon">
                <Target />
              </EmptyMedia>
              <EmptyHeader>
                <EmptyTitle>Nenhuma meta cadastrada</EmptyTitle>
                <EmptyDescription>
                  Crie uma meta atual para exibir na página pública de transparência
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="space-y-4">
              {/* Meta Ativa */}
              {activeGoal && (
                <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <Badge variant="default" className="gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Meta Ativa
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setEditingGoal(activeGoal)
                            setModalOpen(true)
                          }}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setGoalToDelete(activeGoal)
                            setDeleteDialogOpen(true)
                          }}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {activeGoal.imageUrl && (
                    <div className="mb-3 overflow-hidden rounded-lg">
                      <Image
                        src={activeGoal.imageUrl}
                        alt={activeGoal.title}
                        width={600}
                        height={300}
                        className="h-48 w-full object-cover"
                      />
                    </div>
                  )}

                  <h3 className="text-lg font-semibold">{activeGoal.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {activeGoal.description}
                  </p>

                  {activeGoal.link && (
                    <a
                      href={activeGoal.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      Saiba mais
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              )}

              {/* Outras Metas */}
              {goals.filter((g) => !g.isActive).length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Outras metas
                  </p>
                  {goals
                    .filter((g) => !g.isActive)
                    .map((goal) => (
                      <div
                        key={goal.id}
                        className="flex items-center justify-between rounded-lg border border-border/50 p-3"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{goal.title}</p>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {goal.description}
                          </p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleSetActive(goal.id)}>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Definir como ativa
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingGoal(goal)
                                setModalOpen(true)
                              }}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setGoalToDelete(goal)
                                setDeleteDialogOpen(true)
                              }}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal */}
      <GoalModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSubmit={editingGoal ? handleUpdate : handleCreate}
        goal={editingGoal}
        projectTitle={projectTitle}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir meta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A meta{" "}
              <strong>{goalToDelete?.title}</strong> será permanentemente removida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir Meta
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
