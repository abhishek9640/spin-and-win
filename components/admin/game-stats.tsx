"use client"

import { Card } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

const data = [
  { name: "Spin & Win", players: 400, revenue: 2400 },
  // { name: "Lottery", players: 300, revenue: 1398 },
  // { name: "Slots", players: 200, revenue: 9800 },
  // { name: "Poker", players: 278, revenue: 3908 },
  // { name: "Blackjack", players: 189, revenue: 4800 },
]

export function GameStats() {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Game Performance</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="players" fill="hsl(var(--primary))" />
              <Bar dataKey="revenue" fill="hsl(var(--secondary))" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  )
}

