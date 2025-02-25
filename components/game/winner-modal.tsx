"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import confetti from "canvas-confetti"
import { useEffect } from "react"

interface WinnerModalProps {
  isOpen: boolean
  onClose: () => void
  betAmount: number
  selectedNumber: number
}

export function WinnerModal({ isOpen, onClose, betAmount, selectedNumber }: WinnerModalProps) {
  const winAmount = betAmount * 9

  useEffect(() => {
    if (isOpen) {
      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      })
    }
  }, [isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-purple-500 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
            Congratulations!
          </DialogTitle>
        </DialogHeader>

        <div className="py-6 space-y-6">
          <div className="text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-5xl font-bold text-yellow-400 mb-2"
            >
              ${winAmount}
            </motion.div>
            <p className="text-gray-400">You have won with number {selectedNumber}!</p>
          </div>

          <div className="space-y-4">
            <p className="text-center">
              You have been selected to proceed to the final round where you can multiply your winnings!
            </p>

            <div className="flex flex-col gap-3">
              <Button
                onClick={onClose}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                Proceed to Final Round
              </Button>

              <Button variant="outline" onClick={onClose} className="border-gray-700 text-gray-300 hover:bg-gray-800">
                Collect Winnings
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

