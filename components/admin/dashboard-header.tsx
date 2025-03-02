"use client"

import { Button } from "@/components/ui/button"
import { useAdmin } from "./admin-provider"

export function DashboardHeader() {
  const { stats } = useAdmin()

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground">Monitor game performance and user activity in real-time.</p>
      </div>
      {/* Displaying stats */}
      {stats && (
        <div className="flex gap-4 text-sm text-gray-600">
          <span>👥 Users: {stats.totalUsers}</span>
          <span>🎮 Games Played: {stats.totalGames}</span>
          <span>💰 Revenue: ${stats.totalRevenue}</span>
        </div>
      )}
      <div className="flex items-center gap-4">
        <Button>Export Report</Button>
      </div>
    </div>
  )
}
