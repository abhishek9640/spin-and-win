"use client"

import { useEffect, useRef, useState } from "react"

export function CasinoWheel() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isSpinning, setIsSpinning] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const prizes = [
      { text: "100 USDT", color: "#FF3366" },
      { text: "50 USDT", color: "#2E3192" },
      { text: "200 USDT", color: "#00AB55" },
      { text: "75 USDT", color: "#7635dc" },
      { text: "150 USDT", color: "#2563eb" },
      { text: "25 USDT", color: "#9333ea" },
      { text: "300 USDT", color: "#FF9533" },
      { text: "FREE SPIN", color: "#FF33A8" },
    ]

    const segments = prizes.length
    const size = 400
    let rotation = 0
    let spinSpeed = 0
    let animationFrameId: number

    canvas.width = size
    canvas.height = size

    function drawWheel() {
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
        ctx.font = "bold 16px Arial"
        ctx.fillText(prizes[i].text, size / 2 - 30, 5)
        ctx.restore()
      }

      // Draw center circle with neon effect
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
      if (isSpinning) {
        rotation += spinSpeed
        spinSpeed *= 0.98 // Gradually slow down
        if (spinSpeed < 0.002) {
          spinSpeed = 0
          setIsSpinning(false)
          determineWinner()
        }
      }

      animationFrameId = requestAnimationFrame(drawWheel)
    }

    function determineWinner() {
      const anglePerSegment = (Math.PI * 2) / segments
      const normalizedRotation = (rotation % (Math.PI * 2)) + anglePerSegment / 2
      const winningIndex = Math.floor((segments - (normalizedRotation / anglePerSegment)) % segments)
      console.log(`Winner: ${prizes[winningIndex].text}`)
    }

    drawWheel()

    function spinWheel() {
      if (!isSpinning) {
        setIsSpinning(true)
        spinSpeed = 0.3 + Math.random() * 0.5 // Random spin speed
      }
    }

    canvas.addEventListener("click", spinWheel)

    return () => {
      canvas.removeEventListener("click", spinWheel)
      cancelAnimationFrame(animationFrameId)
    }
  }, [isSpinning])

  return (
    <div className="relative">
      <canvas ref={canvasRef} className="max-w-full h-auto cursor-pointer" title="Click to spin!" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-0 h-0">
        <div className="w-4 h-16 bg-gradient-to-b from-red-500 to-red-600 absolute -top-14 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
      </div>
    </div>
  )
}
