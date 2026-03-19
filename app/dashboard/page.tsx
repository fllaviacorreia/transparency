"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Plus, FolderKanban, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react"
import { useProjects } from "@/hooks/use-projects"
import { useTransactions } from "@/hooks/use-transactions"
import { ProjectCard } from "@/components/dashboard/project-card"
import { ProjectModal } from "@/components/dashboard/project-modal"
import { TransactionModal } from "@/components/dashboard/transaction-modal"
import { TransactionsList } from "@/components/dashboard/transactions-list"
import { DashboardCharts } from "@/components/dashboard/dashboard-charts"
import { ShareModal } from "@/components/dashboard/share-modal"
import { GoalSection } from "@/components/dashboard/goal-section"
import { toast } from "sonner"
import type { Project } from "@/types"

export default function DashboardPage() {
  const {
    projects,
    loading: projectsLoading,
    createProject,
    updateProject,
    deleteProject,
    toggleProjectVisibility,
    canCreateMore,
  } = useProjects()

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const selectedProject = projects.find((p) => p.id === selectedProjectId) || null

  const {
    transactions,
    loading: transactionsLoading,
    error: transactionsError,
    createTransaction,
    deleteTransaction,
    totals,
  } = useTransactions(selectedProjectId)

  // Modal states
  const [projectModalOpen, setProjectModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [transactionModalOpen, setTransactionModalOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)
  const [shareProject, setShareProject] = useState<Project | null>(null)

  const handleCreateProject = async (title: string, description: string) => {
    try {
      await createProject(title, description)
      toast.success("Projeto criado com sucesso!")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao criar projeto")
      throw error
    }
  }

  const handleUpdateProject = async (title: string, description: string) => {
    if (!editingProject) return
    try {
      await updateProject(editingProject.id, title, description)
      toast.success("Projeto atualizado!")
    } catch (error) {
      console.error("[v0] Update project error:", error)
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"
      toast.error(`Erro ao atualizar projeto: ${errorMessage}`)
    }
  }

  const handleDeleteProject = async () => {
    if (!projectToDelete) return
    try {
      await deleteProject(projectToDelete.id)
      if (selectedProjectId === projectToDelete.id) {
        setSelectedProjectId(null)
      }
      toast.success("Projeto excluído!")
    } catch {
      toast.error("Erro ao excluir projeto")
    }
    setDeleteDialogOpen(false)
    setProjectToDelete(null)
  }

  const handleCreateTransaction = async (data: {
    type: "entrada" | "saida"
    value: number
    paymentMethod: Parameters<typeof createTransaction>[0]["paymentMethod"]
    description: string
    receipt?: File
  }) => {
    if (!selectedProjectId) return
    try {
      await createTransaction({ ...data, projectId: selectedProjectId })
      toast.success(`${data.type === "entrada" ? "Entrada" : "Saída"} registrada!`)
    } catch (error) {
      console.error("[v0] Transaction error:", error)
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"
      toast.error(`Erro ao registrar transação: ${errorMessage}`)
    }
  }

  const handleDeleteTransaction = async (transaction: Parameters<typeof deleteTransaction>[0]) => {
    try {
      await deleteTransaction(transaction)
      toast.success("Transação excluída!")
    } catch {
      toast.error("Erro ao excluir transação")
    }
  }

  const handleToggleVisibility = async (projectId: string, isPublic: boolean) => {
    try {
      await toggleProjectVisibility(projectId, isPublic)
      toast.success(isPublic ? "Projeto agora é público!" : "Projeto agora é privado!")
    } catch {
      toast.error("Erro ao alterar visibilidade")
    }
  }

  if (projectsLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Dashboard
          </h1>
          <p className="mt-1 text-muted-foreground">
            Gerencie seus projetos e transações financeiras
          </p>
        </div>
        <div className="flex gap-3">
          {selectedProject && (
            <>
              <Button
                variant="outline"
                onClick={() => setTransactionModalOpen(true)}
                className="gap-2"
              >
                <TrendingUp className="h-4 w-4 text-income" />
                <span className="hidden sm:inline">Entrada</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => setTransactionModalOpen(true)}
                className="gap-2"
              >
                <TrendingDown className="h-4 w-4 text-expense" />
                <span className="hidden sm:inline">Saída</span>
              </Button>
            </>
          )}
          <Button
            onClick={() => {
              setEditingProject(null)
              setProjectModalOpen(true)
            }}
            disabled={!canCreateMore}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Novo Projeto
          </Button>
        </div>
      </div>

      {/* Projects Section */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">
            Seus Projetos ({projects.length}/5)
          </h2>
        </div>

        {projects.length === 0 ? (
          <Card className="border-border/50">
            <CardContent className="py-12">
              <Empty>
                <EmptyMedia variant="icon">
                  <FolderKanban />
                </EmptyMedia>
                <EmptyHeader>
                  <EmptyTitle>Nenhum projeto</EmptyTitle>
                  <EmptyDescription>Crie seu primeiro projeto para começar a gerenciar suas finanças</EmptyDescription>
                </EmptyHeader>
              </Empty>
              <div className="mt-6 flex justify-center">
                <Button
                  onClick={() => {
                    setEditingProject(null)
                    setProjectModalOpen(true)
                  }}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Criar Primeiro Projeto
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                isSelected={selectedProjectId === project.id}
                onSelect={() => setSelectedProjectId(project.id)}
                onEdit={() => {
                  setEditingProject(project)
                  setProjectModalOpen(true)
                }}
                onDelete={() => {
                  setProjectToDelete(project)
                  setDeleteDialogOpen(true)
                }}
                onToggleVisibility={(isPublic) => handleToggleVisibility(project.id, isPublic)}
                onShare={() => setShareProject(project)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Selected Project Content */}
      {selectedProject && (
        <>
          {/* Charts */}
          <section>
            <div className="mb-4">
              <h2 className="font-display text-xl font-semibold">
                Resumo: {selectedProject.title}
              </h2>
            </div>
            {transactionsError ? (
              <Card className="border-destructive/50 bg-destructive/5">
                <CardContent className="flex items-center gap-3 py-6">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  <div>
                    <p className="font-medium text-destructive">Erro ao carregar transações</p>
                    {transactionsError.includes("http") ? (
                      <p className="text-sm text-muted-foreground">
                        É necessário criar um índice no Firestore.{" "}
                        <a
                          href={transactionsError.match(/(https:\/\/[^\s]+)/)?.[1]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary underline"
                        >
                          Clique aqui para criar
                        </a>
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">{transactionsError}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <DashboardCharts transactions={transactions} totals={totals} />
            )}
          </section>

          {/* Goal Section */}
          <section>
            <div className="mb-4">
              <h2 className="font-display text-xl font-semibold">
                Meta Atual
              </h2>
            </div>
            <GoalSection
              projectId={selectedProject.id}
              projectTitle={selectedProject.title}
            />
          </section>

          {/* Transactions */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold">
                Transações
              </h2>
              <Button
                onClick={() => setTransactionModalOpen(true)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Nova Transação
              </Button>
            </div>
            <TransactionsList
              transactions={transactions}
              loading={transactionsLoading}
              onDelete={handleDeleteTransaction}
            />
          </section>
        </>
      )}

      {/* No Project Selected Message */}
      {projects.length > 0 && !selectedProject && (
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Selecione um Projeto</CardTitle>
            <CardDescription>
              Clique em um projeto acima para ver suas transações e gráficos
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Modals */}
      <ProjectModal
        open={projectModalOpen}
        onOpenChange={setProjectModalOpen}
        onSubmit={editingProject ? handleUpdateProject : handleCreateProject}
        project={editingProject}
      />

      {selectedProject && (
        <TransactionModal
          open={transactionModalOpen}
          onOpenChange={setTransactionModalOpen}
          onSubmit={handleCreateTransaction}
          projectTitle={selectedProject.title}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir projeto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O projeto{" "}
              <strong>{projectToDelete?.title}</strong> e todas as suas 
              transações serão permanentemente removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProject}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir Projeto
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Share Modal */}
      <ShareModal
        open={!!shareProject}
        onOpenChange={(open: boolean) => !open && setShareProject(null)}
        project={shareProject}
      />
    </div>
  )
}
