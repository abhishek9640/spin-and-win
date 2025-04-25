"use client"

import { useEffect, useRef } from "react"

export function CasinoWheel() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isSpinningRef = useRef(false)
  const spinSpeedRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const prizes = [
      { text: "2", color: "#2E3192" },
      { text: "3", color: "#00AB55" },
      { text: "4", color: "#7635dc" },
      { text: "5", color: "#2563eb" },
      { text: "6", color: "#9333ea" },
      { text: "7", color: "#FF9533" },
      { text: "8", color: "#FF33A8" },
      { text: "9", color: "#FF9533" },
    ]

    const segments = prizes.length
    const size = 400
    let rotation = 0
    let animationFrameId: number

    canvas.width = size
    canvas.height = size
    function drawWheel() {
      if (!ctx) return
      ctx.clearRect(0, 0, size, size)

      // Draw outer ring with neon effect
      ctx.beginPath()
      ctx.strokeStyle = "#00f7ff"
      ctx.lineWidth = 5
      ctx.shadowBlur = 15
      ctx.shadowColor = "#00f7ff"
      ctx.arc(size / 2, size / 2, size / 2 - 5, 0, Math.PI * 2)
      ctx.stroke()
      ctx.shadowBlur = 0

      // Draw segments
      const anglePerSegment = (Math.PI * 2) / segments
      for (let i = 0; i < segments; i++) {
        ctx.beginPath()
        ctx.fillStyle = prizes[i].color
        ctx.moveTo(size / 2, size / 2)
        ctx.arc(
          size / 2,
          size / 2,
          size / 2 - 10,
          i * anglePerSegment + rotation,
          (i + 1) * anglePerSegment + rotation
        )
        ctx.lineTo(size / 2, size / 2)
        ctx.fill()
        ctx.closePath()

        // Draw text
        ctx.save()
        ctx.translate(size / 2, size / 2)
        ctx.rotate(i * anglePerSegment + rotation + anglePerSegment / 2)
        ctx.textAlign = "right"
        ctx.fillStyle = "#ffffff"
        ctx.font = "bold 24px Arial"
        ctx.fillText(prizes[i].text, size / 2 - 30, 5)
        ctx.restore()
      }

      // Center circle
      ctx.beginPath()
      ctx.fillStyle = "#000000"
      ctx.strokeStyle = "#00f7ff"
      ctx.lineWidth = 3
      ctx.shadowBlur = 15
      ctx.shadowColor = "#00f7ff"
      ctx.arc(size / 2, size / 2, 30, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
      ctx.closePath()
      ctx.shadowBlur = 0

      // Update rotation
      if (isSpinningRef.current) {
        rotation += spinSpeedRef.current
        spinSpeedRef.current *= 0.98
        if (spinSpeedRef.current < 0.002) {
          spinSpeedRef.current = 0
          isSpinningRef.current = false
          determineWinner()
        }
      }

      animationFrameId = requestAnimationFrame(drawWheel)
    }

    function determineWinner() {
      const anglePerSegment = (Math.PI * 2) / segments
      const normalizedRotation = (rotation % (Math.PI * 2)) + anglePerSegment / 2
      const winningIndex = Math.floor((segments - (normalizedRotation / anglePerSegment)) % segments)
      console.log(`🎉 Winner: ${prizes[winningIndex]}`)
    }

    function spinWheel() {
      if (!isSpinningRef.current) {
        isSpinningRef.current = true
        spinSpeedRef.current = 0.3 + Math.random() * 0.5
      }
    }

    drawWheel()
    canvas.addEventListener("click", spinWheel)

    return () => {
      canvas.removeEventListener("click", spinWheel)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <div className="relative">
      <canvas ref={canvasRef} className="max-w-full h-auto cursor-pointer" title="Click to spin!" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-0 h-0">
        <div className="w-4 h-16 bg-gradient-to-b from-red-500 to-red-600 absolute -top-14 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
      </div>
    </div>
  )
}
