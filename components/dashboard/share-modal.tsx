"use client"

import { useState } from "react"
import { QRCodeSVG } from "qrcode.react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Copy, Check, Download } from "lucide-react"
import { toast } from "sonner"
import type { Project } from "@/types"

interface ShareModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: Project | null
}

export function ShareModal({ open, onOpenChange, project }: ShareModalProps) {
  const [copied, setCopied] = useState(false)

  if (!project) return null

  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/transparencia?code=${project.publicCode}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
    } catch {
      const textArea = document.createElement("textarea")
      textArea.value = shareUrl
      textArea.style.position = "fixed"
      textArea.style.opacity = "0"
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)
    }
    setCopied(true)
    toast.success("Link copiado!")
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadQR = () => {
    const svg = document.getElementById("share-qr-code")
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx?.drawImage(img, 0, 0)
      const a = document.createElement("a")
      a.download = `qrcode-${project.publicCode}.png`
      a.href = canvas.toDataURL("image/png")
      a.click()
    }

    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Compartilhar Projeto</DialogTitle>
          <DialogDescription>
            Compartilhe o link ou QR Code para que outros possam acompanhar as movimentações de <strong>{project.title}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Public Code */}
          <div className="flex items-center justify-center">
            <Badge variant="outline" className="px-4 py-2 font-mono text-lg tracking-widest">
              {project.publicCode}
            </Badge>
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-xl border border-border/50 bg-white p-4">
              <QRCodeSVG
                id="share-qr-code"
                value={shareUrl}
                size={200}
                level="M"
              />
            </div>
            <Button variant="outline" size="sm" onClick={handleDownloadQR} className="gap-2">
              <Download className="h-4 w-4" />
              Baixar QR Code
            </Button>
          </div>

          {/* Share Link */}
          <div className="flex gap-2">
            <Input
              value={shareUrl}
              readOnly
              className="font-mono text-xs"
            />
            <Button onClick={handleCopy} variant="outline" className="shrink-0 gap-2">
              {copied ? (
                <Check className="h-4 w-4 text-income" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied ? "Copiado" : "Copiar"}
            </Button>
          </div>

          {!project.isPublic && (
            <p className="text-center text-sm text-destructive">
              Este projeto está privado. Torne-o público para que outros possam acessar.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
