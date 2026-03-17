"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import {
  Pencil,
  Droplets,
  Crop,
  Download,
  Undo2,
  RotateCcw,
  Check,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react"

type Tool = "draw" | "blur" | "crop" | null

interface CropArea {
  startX: number
  startY: number
  endX: number
  endY: number
}

const COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#ffffff", // white
  "#000000", // black
]

interface ImageEditorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  imageUrl: string
  imageName?: string
  onSave?: (file: File) => void
}

export function ImageEditorModal({
  open,
  onOpenChange,
  imageUrl,
  imageName,
  onSave,
}: ImageEditorModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [activeTool, setActiveTool] = useState<Tool>(null)
  const [drawColor, setDrawColor] = useState("#ef4444")
  const [brushSize, setBrushSize] = useState(4)
  const [blurSize, setBlurSize] = useState(20)
  const [isDrawing, setIsDrawing] = useState(false)
  const [isCropping, setIsCropping] = useState(false)
  const [cropArea, setCropArea] = useState<CropArea | null>(null)
  const [history, setHistory] = useState<ImageData[]>([])
  const [imageLoaded, setImageLoaded] = useState(false)
  const [scale, setScale] = useState(1)

  const originalImageRef = useRef<HTMLImageElement | null>(null)

  // Load image into canvas
  useEffect(() => {
    if (!open || !imageUrl) return

    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      originalImageRef.current = img
      initCanvas(img)
    }
    img.onerror = () => {
      setImageLoaded(false)
    }
    img.src = imageUrl
    
    return () => {
      setActiveTool(null)
      setHistory([])
      setImageLoaded(false)
      setCropArea(null)
      setScale(1)
    }
  }, [open, imageUrl])

  const initCanvas = useCallback((img: HTMLImageElement) => {
    const canvas = canvasRef.current
    const overlay = overlayCanvasRef.current
    const container = containerRef.current
    if (!canvas || !overlay || !container) return

    const maxW = container.clientWidth - 16
    const maxH = container.clientHeight - 16
    const ratio = Math.min(maxW / img.width, maxH / img.height, 1)

    const w = Math.floor(img.width * ratio)
    const h = Math.floor(img.height * ratio)

    canvas.width = w
    canvas.height = h
    overlay.width = w
    overlay.height = h

    setScale(ratio)

    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.drawImage(img, 0, 0, w, h)

    // Save initial state
    const initialState = ctx.getImageData(0, 0, w, h)
    setHistory([initialState])
    setImageLoaded(true)
  }, [])

  // Resize canvas when container changes
  useEffect(() => {
    if (!open || !originalImageRef.current || !imageLoaded) return

    const handleResize = () => {
      if (originalImageRef.current) {
        initCanvas(originalImageRef.current)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [open, imageLoaded, initCanvas])

  const saveState = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const state = ctx.getImageData(0, 0, canvas.width, canvas.height)
    setHistory((prev) => [...prev, state])
  }, [])

  const undo = useCallback(() => {
    if (history.length <= 1) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const newHistory = [...history]
    newHistory.pop()
    const prevState = newHistory[newHistory.length - 1]
    ctx.putImageData(prevState, 0, 0)
    setHistory(newHistory)
  }, [history])

  const resetImage = useCallback(() => {
    if (history.length <= 1) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const initialState = history[0]
    ctx.putImageData(initialState, 0, 0)
    setHistory([initialState])
  }, [history])

  // --- DRAWING ---
  const getCanvasPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    if ("touches" in e) {
      const touch = e.touches[0]
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      }
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (activeTool === "draw") {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      setIsDrawing(true)
      const pos = getCanvasPos(e)
      ctx.beginPath()
      ctx.moveTo(pos.x, pos.y)
      ctx.strokeStyle = drawColor
      ctx.lineWidth = brushSize
      ctx.lineCap = "round"
      ctx.lineJoin = "round"
    } else if (activeTool === "blur") {
      setIsDrawing(true)
      const pos = getCanvasPos(e)
      applyBlurAt(pos.x, pos.y)
    } else if (activeTool === "crop") {
      setIsCropping(true)
      const pos = getCanvasPos(e)
      setCropArea({ startX: pos.x, startY: pos.y, endX: pos.x, endY: pos.y })
    }
  }

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (activeTool === "draw" && isDrawing) {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      const pos = getCanvasPos(e)
      ctx.lineTo(pos.x, pos.y)
      ctx.stroke()
    } else if (activeTool === "blur" && isDrawing) {
      const pos = getCanvasPos(e)
      applyBlurAt(pos.x, pos.y)
    } else if (activeTool === "crop" && isCropping) {
      const pos = getCanvasPos(e)
      setCropArea((prev) =>
        prev ? { ...prev, endX: pos.x, endY: pos.y } : null
      )
      drawCropOverlay()
    }
  }

  const stopDrawing = () => {
    if (activeTool === "draw" && isDrawing) {
      setIsDrawing(false)
      saveState()
    } else if (activeTool === "blur" && isDrawing) {
      setIsDrawing(false)
      saveState()
    } else if (activeTool === "crop" && isCropping) {
      setIsCropping(false)
    }
  }

  // --- BLUR ---
  const applyBlurAt = (x: number, y: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const radius = blurSize
    const sx = Math.max(0, Math.floor(x - radius))
    const sy = Math.max(0, Math.floor(y - radius))
    const sw = Math.min(canvas.width - sx, radius * 2)
    const sh = Math.min(canvas.height - sy, radius * 2)

    if (sw <= 0 || sh <= 0) return

    // Pixelate approach for blur effect
    const pixelSize = Math.max(4, Math.floor(radius / 3))
    const imageData = ctx.getImageData(sx, sy, sw, sh)
    const data = imageData.data

    for (let py = 0; py < sh; py += pixelSize) {
      for (let px = 0; px < sw; px += pixelSize) {
        // Check if pixel is within circular radius
        const dx = px - radius + pixelSize / 2
        const dy = py - radius + pixelSize / 2
        if (dx * dx + dy * dy > radius * radius) continue

        let r = 0, g = 0, b = 0, count = 0

        for (let by = py; by < Math.min(py + pixelSize, sh); by++) {
          for (let bx = px; bx < Math.min(px + pixelSize, sw); bx++) {
            const i = (by * sw + bx) * 4
            r += data[i]
            g += data[i + 1]
            b += data[i + 2]
            count++
          }
        }

        r = Math.floor(r / count)
        g = Math.floor(g / count)
        b = Math.floor(b / count)

        for (let by = py; by < Math.min(py + pixelSize, sh); by++) {
          for (let bx = px; bx < Math.min(px + pixelSize, sw); bx++) {
            const i = (by * sw + bx) * 4
            data[i] = r
            data[i + 1] = g
            data[i + 2] = b
          }
        }
      }
    }

    ctx.putImageData(imageData, sx, sy)
  }

  // --- CROP OVERLAY ---
  const drawCropOverlay = useCallback(() => {
    const overlay = overlayCanvasRef.current
    if (!overlay || !cropArea) return
    const ctx = overlay.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, overlay.width, overlay.height)

    const x = Math.min(cropArea.startX, cropArea.endX)
    const y = Math.min(cropArea.startY, cropArea.endY)
    const w = Math.abs(cropArea.endX - cropArea.startX)
    const h = Math.abs(cropArea.endY - cropArea.startY)

    // Dark overlay outside crop area
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
    ctx.fillRect(0, 0, overlay.width, overlay.height)
    ctx.clearRect(x, y, w, h)

    // Crop border
    ctx.strokeStyle = "#ffffff"
    ctx.lineWidth = 2
    ctx.setLineDash([6, 3])
    ctx.strokeRect(x, y, w, h)
    ctx.setLineDash([])
  }, [cropArea])

  useEffect(() => {
    drawCropOverlay()
  }, [cropArea, drawCropOverlay])

  const applyCrop = useCallback(() => {
    if (!cropArea) return
    const canvas = canvasRef.current
    const overlay = overlayCanvasRef.current
    if (!canvas || !overlay) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const x = Math.min(cropArea.startX, cropArea.endX)
    const y = Math.min(cropArea.startY, cropArea.endY)
    const w = Math.abs(cropArea.endX - cropArea.startX)
    const h = Math.abs(cropArea.endY - cropArea.startY)

    if (w < 5 || h < 5) {
      cancelCrop()
      return
    }

    const croppedData = ctx.getImageData(x, y, w, h)

    canvas.width = w
    canvas.height = h
    overlay.width = w
    overlay.height = h

    ctx.putImageData(croppedData, 0, 0)

    // Clear overlay
    const overlayCtx = overlay.getContext("2d")
    overlayCtx?.clearRect(0, 0, w, h)

    setCropArea(null)
    setActiveTool(null)
    saveState()
  }, [cropArea, saveState])

  const cancelCrop = useCallback(() => {
    const overlay = overlayCanvasRef.current
    if (overlay) {
      const ctx = overlay.getContext("2d")
      ctx?.clearRect(0, 0, overlay.width, overlay.height)
    }
    setCropArea(null)
  }, [])

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    if (onSave) {
      canvas.toBlob((blob) => {
        if (!blob) return
        const file = new File([blob], imageName || "comprovante-editado.png", {
          type: "image/png",
        })
        onSave(file)
        onOpenChange(false)
      }, "image/png")
    } else {
      const link = document.createElement("a")
      link.download = imageName || "comprovante-editado.png"
      link.href = canvas.toDataURL("image/png")
      link.click()
    }
  }

  const selectTool = (tool: Tool) => {
    if (activeTool === "crop" && tool !== "crop") {
      cancelCrop()
    }
    setActiveTool(activeTool === tool ? null : tool)
  }

  const handleZoomIn = () => {
    const canvas = canvasRef.current
    if (!canvas || !originalImageRef.current) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    
    // Save current content, scale up
    const current = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const tempCanvas = document.createElement("canvas")
    tempCanvas.width = canvas.width
    tempCanvas.height = canvas.height
    tempCanvas.getContext("2d")?.putImageData(current, 0, 0)
    
    const newScale = Math.min(scale * 1.25, 3)
    const newW = Math.floor(originalImageRef.current.width * newScale)
    const newH = Math.floor(originalImageRef.current.height * newScale)
    
    canvas.width = newW
    canvas.height = newH
    if (overlayCanvasRef.current) {
      overlayCanvasRef.current.width = newW
      overlayCanvasRef.current.height = newH
    }
    
    ctx.drawImage(tempCanvas, 0, 0, tempCanvas.width, tempCanvas.height, 0, 0, newW, newH)
    setScale(newScale)
    saveState()
  }

  const handleZoomOut = () => {
    const canvas = canvasRef.current
    if (!canvas || !originalImageRef.current) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    
    const current = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const tempCanvas = document.createElement("canvas")
    tempCanvas.width = canvas.width
    tempCanvas.height = canvas.height
    tempCanvas.getContext("2d")?.putImageData(current, 0, 0)
    
    const newScale = Math.max(scale * 0.8, 0.25)
    const newW = Math.floor(originalImageRef.current.width * newScale)
    const newH = Math.floor(originalImageRef.current.height * newScale)
    
    canvas.width = newW
    canvas.height = newH
    if (overlayCanvasRef.current) {
      overlayCanvasRef.current.width = newW
      overlayCanvasRef.current.height = newH
    }
    
    ctx.drawImage(tempCanvas, 0, 0, tempCanvas.width, tempCanvas.height, 0, 0, newW, newH)
    setScale(newScale)
    saveState()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex h-[95vh] max-h-[95vh] w-[95vw] max-w-5xl flex-col gap-0 overflow-hidden p-0"
        showCloseButton={false}
      >
        {/* Header */}
        <DialogHeader className="flex-none border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base">
              {imageName || "Comprovante"}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Canvas area */}
        <div
          ref={containerRef}
          className="relative flex flex-1 items-center justify-center overflow-auto bg-muted/50 p-2"
        >
          {!imageLoaded && (
            <p className="text-sm text-muted-foreground">Carregando imagem...</p>
          )}
          <div className="relative" style={{ display: imageLoaded ? "block" : "none" }}>
            <canvas
              ref={canvasRef}
              className={`max-h-full max-w-full rounded ${
                activeTool === "draw"
                  ? "cursor-crosshair"
                  : activeTool === "blur"
                    ? "cursor-cell"
                    : activeTool === "crop"
                      ? "cursor-crosshair"
                      : "cursor-default"
              }`}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
            <canvas
              ref={overlayCanvasRef}
              className="pointer-events-none absolute inset-0"
            />
          </div>
        </div>

        {/* Crop confirm bar */}
        {activeTool === "crop" && cropArea && !isCropping && (
          <div className="flex items-center justify-center gap-2 border-t bg-background px-4 py-2">
            <Button size="sm" variant="ghost" onClick={cancelCrop}>
              <X className="mr-1 h-4 w-4" />
              Cancelar
            </Button>
            <Button size="sm" onClick={applyCrop}>
              <Check className="mr-1 h-4 w-4" />
              Aplicar corte
            </Button>
          </div>
        )}

        {/* Toolbar */}
        <div className="flex flex-none flex-col gap-3 border-t bg-background px-4 py-3">
          {/* Tool options */}
          {activeTool === "draw" && (
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-medium text-muted-foreground">Cor:</span>
              <div className="flex gap-1.5">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setDrawColor(color)}
                    className={`h-7 w-7 rounded-full border-2 transition-transform ${
                      drawColor === color
                        ? "scale-110 border-primary ring-2 ring-primary/30"
                        : "border-border hover:scale-105"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="ml-2 flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  Espessura:
                </span>
                <Slider
                  value={[brushSize]}
                  onValueChange={(v) => setBrushSize(v[0])}
                  min={1}
                  max={20}
                  step={1}
                  className="w-24"
                />
                <span className="w-6 text-center text-xs text-muted-foreground">
                  {brushSize}
                </span>
              </div>
            </div>
          )}

          {activeTool === "blur" && (
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-muted-foreground">
                Tamanho do blur:
              </span>
              <Slider
                value={[blurSize]}
                onValueChange={(v) => setBlurSize(v[0])}
                min={8}
                max={60}
                step={2}
                className="w-32"
              />
              <span className="w-8 text-center text-xs text-muted-foreground">
                {blurSize}px
              </span>
            </div>
          )}

          {/* Main tools bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Button
                variant={activeTool === "draw" ? "default" : "ghost"}
                size="icon"
                onClick={() => selectTool("draw")}
                title="Desenhar"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant={activeTool === "blur" ? "default" : "ghost"}
                size="icon"
                onClick={() => selectTool("blur")}
                title="Desfocar"
              >
                <Droplets className="h-4 w-4" />
              </Button>
              <Button
                variant={activeTool === "crop" ? "default" : "ghost"}
                size="icon"
                onClick={() => selectTool("crop")}
                title="Cortar"
              >
                <Crop className="h-4 w-4" />
              </Button>

              <div className="mx-2 h-6 w-px bg-border" />

              <Button
                variant="ghost"
                size="icon"
                onClick={handleZoomOut}
                title="Diminuir zoom"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="mx-1 text-xs text-muted-foreground">
                {Math.round(scale * 100)}%
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleZoomIn}
                title="Aumentar zoom"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>

              <div className="mx-2 h-6 w-px bg-border" />

              <Button
                variant="ghost"
                size="icon"
                onClick={undo}
                disabled={history.length <= 1}
                title="Desfazer"
              >
                <Undo2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={resetImage}
                disabled={history.length <= 1}
                title="Restaurar original"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>

            <Button size="sm" onClick={handleDownload}>
              <Download className="mr-1 h-4 w-4" />
              Salvar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
