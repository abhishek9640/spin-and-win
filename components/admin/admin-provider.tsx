"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useTheme } from "next-themes"

interface AdminContextType {
  isLoading: boolean
  stats: {
    totalUsers: number
    activeUsers: number
    totalGames: number
    totalRevenue: number
    pendingSettlements: number
  }
}

const AdminContext = createContext<AdminContextType>({
  isLoading: true,
  stats: {
    totalUsers: 0,
    activeUsers: 0,
    totalGames: 0,
    totalRevenue: 0,
    pendingSettlements: 0,
  },
})

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalGames: 0,
    totalRevenue: 0,
    pendingSettlements: 0,
  })
  const { setTheme } = useTheme()

  useEffect(() => {
    // Set default theme to dark
    setTheme("dark")

    // Simulate API call to fetch initial stats
    setTimeout(() => {
      setStats({
        totalUsers: 1234,
        activeUsers: 567,
        totalGames: 890,
        totalRevenue: 12345,
        pendingSettlements: 23,
      })
      setIsLoading(false)
    }, 1000)
  }, [setTheme])

  return <AdminContext.Provider value={{ isLoading, stats }}>{children}</AdminContext.Provider>
}

export const useAdmin = () => useContext(AdminContext)

