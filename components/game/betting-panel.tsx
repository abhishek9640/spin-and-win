"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Card } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

interface BettingPanelProps {
  minBet: number;
  maxBet: number;
  betAmount: number;
  onBetChange: (amount: number) => void;
  onSpin: () => void;
  disabled?: boolean;
  isProcessing?: boolean;
}

export function BettingPanel({
  minBet,
  maxBet,
  betAmount,
  onBetChange,
  onSpin,
  disabled = false,
  isProcessing = false,
}: BettingPanelProps) {
  const predefinedBets = [10, 50, 100, 500]

  return (
    <Card className="p-6 bg-gray-800/50 border-gray-700">
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold mb-4">Place Your Bet</h2>

        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-300">Bet Amount</span>
            <span className="font-bold text-xl text-yellow-400">${betAmount.toFixed(2)}</span>
          </div>
          <Slider
            value={[betAmount]}
            min={minBet}
            max={maxBet}
            step={0.01}
            onValueChange={(value) => onBetChange(value[0])}
            disabled={disabled || isProcessing}
            className="py-4"
          />
          <div className="flex justify-between text-sm text-gray-400">
            <span>Min: ${minBet.toFixed(2)}</span>
            <span>Max: ${maxBet.toFixed(2)}</span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {predefinedBets.map((amount) => (
            <Button
              key={amount}
              variant="outline"
              onClick={() => onBetChange(amount)}
              disabled={disabled || isProcessing}
              className="bg-gray-700 hover:bg-gray-600 border-gray-600"
            >
              ${amount}
            </Button>
          ))}
        </div>

        <motion.div 
          whileHover={!disabled && !isProcessing ? { scale: 1.03 } : {}} 
          whileTap={!disabled && !isProcessing ? { scale: 0.97 } : {}}
        >
          <Button
            onClick={onSpin}
            disabled={disabled || isProcessing}
            className="w-full py-6 text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : disabled ? (
              "Spinning..."
            ) : (
              "SPIN NOW"
            )}
          </Button>
        </motion.div>
      </div>
    </Card>
  )
}

