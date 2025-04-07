"use client"

import { Card } from "@/components/ui/card"
import { Users, GamepadIcon, Wallet, AlertCircle } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

export function DashboardStats() {
  const router = useRouter()
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/auth/signin?callbackUrl=/admin/transactions')
    },
  })

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [stats, setStats] = useState({
    totalUserCount: 0,
    totalGamesCount: 0,
    totalBetsAmount: 0,
    totalPayoutsAmount: 0,
  })

  const fetchData = useCallback(async () => {
    setLoading(true)
    setErrorMessage(null)

    try {
      if (!session?.user?.authToken) {
        throw new Error("Authentication token not found. Please log in.")
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/admin/dash-count`, {
        method: "GET",
        headers: {
          Authorization: `${session.user.authToken}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data.")
      }

      const result = await response.json()

      if (result?.status && result.data) {
        setStats(result.data)
      } else {
        throw new Error("Unexpected response structure.")
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }, [API_BASE_URL, session])

  useEffect(() => {
    if (session?.user?.authToken) {
      fetchData()
    }
  }, [session, fetchData])

  return (
    <div className="min-h-screen w-full p-6 bg-background">
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
        <Card className="p-8 min-h-[160px]">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-blue-500/10 rounded-full">
              <Users className="w-8 h-8 text-blue-500" />
            </div>
            <div>
              <p className="text-base text-muted-foreground">Total Users</p>
              <h3 className="text-3xl font-bold">{stats.totalUserCount}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-8 min-h-[160px]">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-green-500/10 rounded-full">
              <GamepadIcon className="w-8 h-8 text-green-500" />
            </div>
            <div>
              <p className="text-base text-muted-foreground">Total Games</p>
              <h3 className="text-3xl font-bold">{stats.totalGamesCount}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-8 min-h-[160px]">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-yellow-500/10 rounded-full">
              <Wallet className="w-8 h-8 text-yellow-500" />
            </div>
            <div>
              <p className="text-base text-muted-foreground">Total Bets</p>
              <h3 className="text-3xl font-bold">${stats.totalBetsAmount}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-8 min-h-[160px]">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-red-500/10 rounded-full">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <div>
              <p className="text-base text-muted-foreground">Total Payouts</p>
              <h3 className="text-3xl font-bold">${stats.totalPayoutsAmount}</h3>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
