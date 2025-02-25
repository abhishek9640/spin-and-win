"use client"

import { motion } from "framer-motion"

interface ResultDisplayProps {
  winningNumber: number
  selectedNumber: number
  betAmount: number
}

export function ResultDisplay({ winningNumber, selectedNumber, betAmount }: ResultDisplayProps) {
  const isWinner = winningNumber === selectedNumber
  const winAmount = isWinner ? betAmount * 9 : 0

  return (
    <motion.div
      className={`mt-12 p-6 rounded-xl text-center ${
        isWinner
          ? "bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/50"
          : "bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/50"
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-3xl font-bold mb-4">{isWinner ? "🎉 You Won! 🎉" : "Better Luck Next Time!"}</h2>

      <div className="flex justify-center items-center gap-8 mb-4">
        <div className="text-center">
          <p className="text-sm text-gray-400">Winning Number</p>
          <div className="w-16 h-16 rounded-full bg-gray-800 border-2 border-white flex items-center justify-center mx-auto">
            <span className="text-white font-bold text-2xl">{winningNumber}</span>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-400">Your Number</p>
          <div className="w-16 h-16 rounded-full bg-gray-800 border-2 border-white flex items-center justify-center mx-auto">
            <span className="text-white font-bold text-2xl">{selectedNumber}</span>
          </div>
        </div>
      </div>

      {isWinner && (
        <motion.div
          className="text-2xl font-bold text-green-400"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 10,
          }}
        >
          You won ${winAmount}!
        </motion.div>
      )}
    </motion.div>
  )
}

