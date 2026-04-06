"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { User, Trash2, KeyRound, Save, Mail, Calendar, FolderKanban } from "lucide-react"
import { toast } from "sonner"

interface ProfileModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProfileModal({ open, onOpenChange }: ProfileModalProps) {
  const { user, changePassword, updateProfile, getUserProfile } = useAuth()
  const router = useRouter()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    createdAt: null as Date | null,
    projectsCount: 0,
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  useEffect(() => {
    if (open && user) {
      loadProfile()
    }
  }, [open, user])

  const loadProfile = async () => {
    setIsLoadingProfile(true)
    try {
      const profile = await getUserProfile()
      if (profile) {
        setProfileData(profile)
      }
    } catch {
      toast.error("Erro ao carregar perfil")
    } finally {
      setIsLoadingProfile(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!profileData.name.trim()) {
      toast.error("O nome é obrigatório")
      return
    }

    setIsSavingProfile(true)
    try {
      await updateProfile(profileData.name.trim())
      toast.success("Perfil atualizado com sucesso!")
    } catch {
      toast.error("Erro ao atualizar perfil")
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword) {
      toast.error("Digite sua senha atual")
      return
    }
    if (passwordData.newPassword.length < 6) {
      toast.error("A nova senha deve ter pelo menos 6 caracteres")
      return
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("As senhas não coincidem")
      return
    }

    setIsChangingPassword(true)
    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword)
      toast.success("Senha alterada com sucesso!")
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error) {
      const firebaseError = error as { code?: string }
      if (firebaseError.code === "auth/wrong-password" || firebaseError.code === "auth/invalid-credential") {
        toast.error("Senha atual incorreta")
      } else {
        toast.error("Erro ao alterar senha")
      }
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!user) return
    setIsDeleting(true)

    try {
      const idToken = await user.getIdToken()
      const res = await fetch("/api/auth/delete-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Erro ao excluir conta.")
      }

      toast.success("Conta excluída com sucesso.")
      onOpenChange(false)
      router.push("/")
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao excluir conta."
      )
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  if (!user) return null

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Meu Perfil
            </DialogTitle>
            <DialogDescription>
              Gerencie suas informações pessoais e segurança
            </DialogDescription>
          </DialogHeader>

          {isLoadingProfile ? (
            <div className="flex items-center justify-center py-8">
              <Spinner className="h-6 w-6" />
            </div>
          ) : (
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="profile">Dados Pessoais</TabsTrigger>
                <TabsTrigger value="security">Segurança</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-4 pt-4">
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="name" required>Nome</FieldLabel>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) =>
                        setProfileData({ ...profileData, name: e.target.value })
                      }
                      placeholder="Seu nome"
                      disabled={isSavingProfile}
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="email">
                      <span className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5" />
                        E-mail
                      </span>
                    </FieldLabel>
                    <Input
                      id="email"
                      value={profileData.email}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      O e-mail não pode ser alterado
                    </p>
                  </Field>
                </FieldGroup>

                <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Conta criada em</p>
                      <p className="text-sm font-medium">
                        {profileData.createdAt
                          ? profileData.createdAt.toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            })
                          : "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FolderKanban className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Projetos criados</p>
                      <p className="text-sm font-medium">{profileData.projectsCount}</p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleSaveProfile}
                  disabled={isSavingProfile}
                  className="w-full gap-2"
                >
                  {isSavingProfile ? (
                    <Spinner className="h-4 w-4" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Salvar alterações
                </Button>
              </TabsContent>

              <TabsContent value="security" className="space-y-4 pt-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <KeyRound className="h-4 w-4" />
                    Alterar senha
                  </div>

                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="currentPassword" required>Senha atual</FieldLabel>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            currentPassword: e.target.value,
                          })
                        }
                        placeholder="Digite sua senha atual"
                        disabled={isChangingPassword}
                      />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="newPassword" required>Nova senha</FieldLabel>
                      <Input
                        id="newPassword"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            newPassword: e.target.value,
                          })
                        }
                        placeholder="Mínimo 6 caracteres"
                        disabled={isChangingPassword}
                      />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="confirmPassword" required>
                        Confirmar nova senha
                      </FieldLabel>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            confirmPassword: e.target.value,
                          })
                        }
                        placeholder="Repita a nova senha"
                        disabled={isChangingPassword}
                      />
                    </Field>
                  </FieldGroup>

                  <Button
                    onClick={handleChangePassword}
                    disabled={isChangingPassword}
                    className="w-full gap-2"
                  >
                    {isChangingPassword ? (
                      <Spinner className="h-4 w-4" />
                    ) : (
                      <KeyRound className="h-4 w-4" />
                    )}
                    Alterar senha
                  </Button>
                </div>

                <div className="border-t pt-4">
                  <h4 className="mb-2 text-sm font-medium text-destructive">
                    Zona de perigo
                  </h4>
                  <p className="mb-3 text-xs text-muted-foreground">
                    Ao excluir sua conta, todos os seus projetos, transações e
                    comprovantes serão permanentemente removidos.
                  </p>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Excluir minha conta
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir conta permanentemente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação é irreversível. Todos os seus dados serão excluídos
              permanentemente, incluindo projetos, transações e comprovantes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Excluindo...
                </>
              ) : (
                "Sim, excluir minha conta"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
