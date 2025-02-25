"use client"

import { useState } from "react"
import { NumberSpinner } from "@/components/game/number-spinner"
import { NumberSelector } from "@/components/game/number-selector"
import { BettingPanel } from "@/components/game/betting-panel"
import { ResultDisplay } from "@/components/game/result-display"
import { WinnerModal } from "@/components/game/winner-modal"
import { Card } from "@/components/ui/card"
import { motion } from "framer-motion"

export type GameResult = {
  winningNumber: number
  selectedNumber: number
  amount: number
  timestamp: number
}

export function SpinGameUI() {
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null)
  const [betAmount, setBetAmount] = useState(10)
  const [isSpinning, setIsSpinning] = useState(false)
  const [winningNumber, setWinningNumber] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [showWinnerModal, setShowWinnerModal] = useState(false)
  const [gameResults, setGameResults] = useState<GameResult[]>([])

  const handleNumberSelect = (number: number) => {
    setSelectedNumber(number)
  }

  const handleBetChange = (amount: number) => {
    setBetAmount(amount)
  }

  const handleSpin = () => {
    if (selectedNumber === null) return

    setIsSpinning(true)
    setShowResult(false)
    setWinningNumber(null)

    // Simulate spin duration
    setTimeout(() => {
      // Generate random winning number between 1 and 9
      const result = Math.floor(Math.random() * 9) + 1
      setWinningNumber(result)

      // Record game result
      const gameResult: GameResult = {
        winningNumber: result,
        selectedNumber: selectedNumber,
        amount: betAmount,
        timestamp: Date.now(),
      }

      setGameResults((prev) => [gameResult, ...prev])
      setIsSpinning(false)
      setShowResult(true)

      // Check if player won
      if (result === selectedNumber) {
        setTimeout(() => {
          setShowWinnerModal(true)
        }, 1500)
      }
    }, 5000) // 5 seconds spin time
  }

  return (
    <div className="container py-8">
      <motion.h1
        className="text-4xl md:text-6xl font-bold text-center mb-8 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Spin & Win
      </motion.h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        <div className="space-y-8">
          <Card className="p-6 bg-gray-800/50 border-gray-700">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-2xl opacity-25 animate-pulse" />
              <NumberSpinner isSpinning={isSpinning} winningNumber={winningNumber} />
            </div>
          </Card>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="p-6 bg-gray-800/50 border-gray-700">
              <h2 className="text-2xl font-semibold mb-4">Select Your Lucky Number</h2>
              <NumberSelector
                selectedNumber={selectedNumber}
                onSelectNumber={handleNumberSelect}
                disabled={isSpinning}
              />
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <BettingPanel
              betAmount={betAmount}
              onBetChange={handleBetChange}
              onSpin={handleSpin}
              disabled={isSpinning || selectedNumber === null}
            />
          </motion.div>
        </div>

        <div className="space-y-4">
          <Card className="p-4 bg-gray-800/50 border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Game History</h2>
            {gameResults.length === 0 ? (
              <p className="text-center text-gray-400 py-4">No games played yet</p>
            ) : (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {gameResults.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-700/50">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        Bet: ${result.amount} on #{result.selectedNumber}
                      </p>
                      <p className="text-xs text-gray-400">{new Date(result.timestamp).toLocaleTimeString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Result:</span>
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          result.winningNumber === result.selectedNumber
                            ? "bg-green-500 text-white"
                            : "bg-gray-600 text-white"
                        }`}
                      >
                        {result.winningNumber}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {showResult && (
        <ResultDisplay winningNumber={winningNumber!} selectedNumber={selectedNumber!} betAmount={betAmount} />
      )}

      <WinnerModal
        isOpen={showWinnerModal}
        onClose={() => setShowWinnerModal(false)}
        betAmount={betAmount}
        selectedNumber={selectedNumber!}
      />
    </div>
  )
}

