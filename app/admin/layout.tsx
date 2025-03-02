import type React from "react"
import { Sidebar } from "@/components/admin/sidebar"
import { Navbar } from "@/components/admin/navbar"
import { AdminProvider } from "@/components/admin/admin-provider"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminProvider>
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8 overflow-x-hidden">{children}</main>
        </div>
      </div>
    </AdminProvider>
  )
}

