"use client"

import { motion } from "framer-motion"

interface NumberSelectorProps {
  selectedNumber: number | null
  onSelectNumber: (number: number) => void
  disabled?: boolean
}

export function NumberSelector({ selectedNumber, onSelectNumber, disabled }: NumberSelectorProps) {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9]

  return (
    <div className="grid grid-cols-3 gap-4">
      {numbers.map((number) => (
        <motion.button
          key={number}
          className={`
            h-20 rounded-lg text-2xl font-bold transition-all
            ${
              selectedNumber === number
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30"
                : "bg-gray-700 text-white hover:bg-gray-600"
            }
            ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          `}
          onClick={() => !disabled && onSelectNumber(number)}
          whileHover={!disabled ? { scale: 1.05 } : {}}
          whileTap={!disabled ? { scale: 0.95 } : {}}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, delay: number * 0.05 }}
        >
          {number}
        </motion.button>
      ))}
    </div>
  )
}

