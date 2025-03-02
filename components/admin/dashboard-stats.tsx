"use client"

import { Card } from "@/components/ui/card"
import { Users, GamepadIcon, Wallet, AlertCircle } from "lucide-react"
import { useAdmin } from "./admin-provider"

export function DashboardStats() {
  const { stats } = useAdmin()

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-full">
            <Users className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Users</p>
            <h3 className="text-2xl font-bold">{stats.totalUsers}</h3>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-green-500/10 rounded-full">
            <GamepadIcon className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Games</p>
            <h3 className="text-2xl font-bold">{stats.totalGames}</h3>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-yellow-500/10 rounded-full">
            <Wallet className="w-6 h-6 text-yellow-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <h3 className="text-2xl font-bold">${stats.totalRevenue}</h3>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-500/10 rounded-full">
            <AlertCircle className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Pending Settlements</p>
            <h3 className="text-2xl font-bold">{stats.pendingSettlements}</h3>
          </div>
        </div>
      </Card>
    </div>
  )
}

