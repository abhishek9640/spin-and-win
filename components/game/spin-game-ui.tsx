"use client"

import { useState } from "react"
import { NumberSpinner } from "@/components/game/number-spinner"
import { NumberSelector } from "@/components/game/number-selector"
import { BettingPanel } from "@/components/game/betting-panel"
import { ResultDisplay } from "@/components/game/result-display"
import { WinnerModal } from "@/components/game/winner-modal"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

// Define interfaces
interface GameItem {
  name: string;
  odds: number;
  _id: string;
}

interface SpinGameProps {
  gameId: string;
  gameItems?: GameItem[];
  minBet?: number;
  maxBet?: number;
}

// Game states
type GameState = 'idle' | 'spinning' | 'result' | 'won' | 'lost'

export function SpinGameUI({ gameId, gameItems = [], minBet = 0.001, maxBet = 1 }: SpinGameProps) {
  // Game state
  const [gameState, setGameState] = useState<GameState>('idle')
  const [selectedNumber, setSelectedNumber] = useState<string>('')
  const [betAmount, setBetAmount] = useState<number>(minBet)
  const [spinResult, setSpinResult] = useState<string>('')
  const [winAmount, setWinAmount] = useState<number>(0)
  const [showWinnerModal, setShowWinnerModal] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Prepare game items for display - ensure we have valid data
  const validGameItems = gameItems && gameItems.length > 0 
    ? gameItems 
    : Array.from({ length: 10 }, (_, i) => ({ 
        name: String(i + 1), 
        odds: 1, 
        _id: String(i) 
      }));

  // Get all possible numbers/options from game items
  const possibleNumbers = validGameItems.map(item => item.name);

  // Handle bet amount change
  const handleBetChange = (amount: number) => {
    if (amount < minBet) {
      setBetAmount(minBet)
    } else if (amount > maxBet) {
      setBetAmount(maxBet)
    } else {
      setBetAmount(amount)
    }
  }

  // Handle number selection
  const handleNumberSelect = (number: string) => {
    setSelectedNumber(number)
  }

  // Handle spin
  const handleSpin = () => {
    if (!selectedNumber) {
      setError('Please select a number first')
      return
    }
    
    if (betAmount < minBet) {
      setError(`Minimum bet amount is ${minBet} ETH`)
      return
    }

    // Clear any previous errors
    setError(null)
    
    // Start spinning
    setGameState('spinning')
    
    // Simulate a spin result (this would be replaced with actual blockchain interaction)
    setTimeout(() => {
      // Randomly select one of the possible numbers as the result
      const result = possibleNumbers[Math.floor(Math.random() * possibleNumbers.length)]
      setSpinResult(result)
      
      // Determine if player won
      const isWinner = result === selectedNumber
      
      // Set game state
      setGameState(isWinner ? 'won' : 'lost')
      
      // Calculate winnings based on odds if won
      if (isWinner) {
        const selectedItem = validGameItems.find(item => item.name === selectedNumber)
        const odds = selectedItem ? selectedItem.odds : 1
        const winnings = betAmount * odds
        setWinAmount(winnings)
        
        // Show winner modal after a delay
        setTimeout(() => {
          setShowWinnerModal(true)
        }, 500)
      }
    }, 2000) // Spin for 2 seconds
  }

  // Handle reset/play again
  const handlePlayAgain = () => {
    setGameState('idle')
    setSpinResult('')
    setWinAmount(0)
    setShowWinnerModal(false)
  }

  // Close winner modal
  const closeWinnerModal = () => {
    setShowWinnerModal(false)
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

      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <div>
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="py-8 px-6">
                <NumberSpinner 
                  spinning={gameState === 'spinning'} 
                  result={spinResult}
                  possibleNumbers={possibleNumbers}
                />
                
                {/* Error Alert */}
                {error && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                {/* Result Display */}
                {(gameState === 'won' || gameState === 'lost') && (
                  <ResultDisplay 
                    won={gameState === 'won'} 
                    amount={gameState === 'won' ? winAmount : betAmount}
                    selectedNumber={selectedNumber}
                    resultNumber={spinResult}
                    onPlayAgain={handlePlayAgain}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          {/* Betting Panel */}
          <BettingPanel 
            minBet={minBet}
            maxBet={maxBet}
            betAmount={betAmount}
            onBetChange={handleBetChange}
            onSpin={handleSpin}
            disabled={gameState === 'spinning' || gameState === 'won' || gameState === 'lost'}
          />
          
          {/* Number Selector */}
          <NumberSelector 
            numbers={possibleNumbers}
            selectedNumber={selectedNumber}
            onSelectNumber={handleNumberSelect}
            disabled={gameState === 'spinning' || gameState === 'won' || gameState === 'lost'}
          />
        </div>
      </div>

      {/* Winner Modal */}
      {showWinnerModal && (
        <WinnerModal 
          winAmount={winAmount}
          onClose={closeWinnerModal}
          onPlayAgain={handlePlayAgain}
        />
      )}
    </div>
  )
}

