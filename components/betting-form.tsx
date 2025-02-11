"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAccount } from "wagmi"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function BettingForm() {
  const [amount, setAmount] = useState("")
  const [token, setToken] = useState("ETH")
  const { isConnected } = useAccount()

  return (
    <div className="space-y-4 w-full max-w-sm">
      <div className="flex gap-2">
        <Input
          type="number"
          placeholder="Bet Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="flex-1 bg-white/5 border-neutral-900/20 dark:bg-neutral-950/5 dark:border-neutral-50/20"
        />
        <Select value={token} onValueChange={setToken}>
          <SelectTrigger className="w-[100px] bg-white/5 border-neutral-900/20 dark:bg-neutral-950/5 dark:border-neutral-50/20">
            <SelectValue placeholder="Token" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ETH">ETH</SelectItem>
            <SelectItem value="USDT">USDT</SelectItem>
            <SelectItem value="USDC">USDC</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {["0.1", "0.5", "1.0", "2.0"].map((value) => (
          <Button
            key={value}
            variant="outline"
            className="border-neutral-900/20 hover:border-neutral-900 dark:border-neutral-50/20 dark:hover:border-neutral-50"
            onClick={() => setAmount(value)}
          >
            {value}
          </Button>
        ))}
      </div>
      <Button className="w-full" disabled={!isConnected || !amount}>
        Place Bet
      </Button>
    </div>
  )
}

