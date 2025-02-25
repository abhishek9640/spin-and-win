"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"

interface NumberSpinnerProps {
  isSpinning: boolean
  winningNumber: number | null
}

export function NumberSpinner({ isSpinning, winningNumber }: NumberSpinnerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Draw the spinner wheel
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const size = 400
    canvas.width = size
    canvas.height = size

    const centerX = size / 2
    const centerY = size / 2
    const radius = size / 2 - 10

    // Draw segments
    const segments = 9
    const anglePerSegment = (Math.PI * 2) / segments
    const colors = ["#FF6B6B", "#4ECDC4", "#FFD166", "#06D6A0", "#118AB2", "#EF476F", "#FFC43D", "#1B9AAA", "#E07A5F"]

    for (let i = 0; i < segments; i++) {
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, i * anglePerSegment, (i + 1) * anglePerSegment)
      ctx.closePath()

      ctx.fillStyle = colors[i]
      ctx.fill()

      // Draw number
      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.rotate(i * anglePerSegment + anglePerSegment / 2)
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.font = "bold 32px Arial"
      ctx.fillStyle = "#FFFFFF"
      ctx.fillText((i + 1).toString(), radius - 40, 0)
      ctx.restore()
    }

    // Draw center circle
    ctx.beginPath()
    ctx.arc(centerX, centerY, 30, 0, Math.PI * 2)
    ctx.fillStyle = "#2A2A2A"
    ctx.fill()
    ctx.strokeStyle = "#FFFFFF"
    ctx.lineWidth = 3
    ctx.stroke()

    // Draw outer ring
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
    ctx.strokeStyle = "#FFFFFF"
    ctx.lineWidth = 3
    ctx.stroke()
  }, [])

  // Calculate rotation based on winning number
  const getRotationForNumber = (num: number) => {
    // Each segment is 40 degrees (360 / 9)
    // We add a random offset within the segment for natural feel
    const segmentAngle = 360 / 9
    const baseRotation = (num - 1) * segmentAngle
    const randomOffset = Math.random() * (segmentAngle * 0.6) + segmentAngle * 0.2

    // We need to rotate to the opposite side (180 degrees) and add extra rotations
    return 180 + baseRotation + randomOffset + 360 * 5 // 5 full rotations + target position
  }

  const spinVariants = {
    spinning: {
      rotate: 0,
      transition: { duration: 0, ease: "linear" },
    },
    stopped: (winningNum: number | null) => ({
      rotate: winningNum ? getRotationForNumber(winningNum) : 0,
      transition: {
        duration: 5,
        ease: "easeOut",
        type: "spring",
        damping: 15,
      },
    }),
  }

  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-0 h-0">
        <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-b-[30px] border-b-yellow-500" />
      </div>
      <motion.div
        className="w-full aspect-square"
        variants={spinVariants}
        initial="spinning"
        animate={isSpinning ? "spinning" : "stopped"}
        custom={winningNumber}
      >
        <canvas ref={canvasRef} className="w-full h-full" />
      </motion.div>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-16 h-16 rounded-full bg-gray-800 border-4 border-white flex items-center justify-center">
          <span className="text-white font-bold text-xl">{winningNumber || "?"}</span>
        </div>
      </div>
    </div>
  )
}

