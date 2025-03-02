import { DashboardHeader } from "@/components/admin/dashboard-header"
import { DashboardStats } from "@/components/admin/dashboard-stats"
import { RecentActivity } from "@/components/admin/recent-activity"
import { RevenueChart } from "@/components/admin/revenue-chart"
import { GameStats } from "@/components/admin/game-stats"
export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <DashboardHeader />
      <DashboardStats />
      <div className="grid gap-8 md:grid-cols-2">
        <RevenueChart />
        <GameStats />
      </div>
      <RecentActivity />
    </div>
  )
}

