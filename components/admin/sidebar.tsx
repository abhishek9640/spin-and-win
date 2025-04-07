"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  GamepadIcon,
  WalletCards,
  // SettingsIcon,
  // ShieldCheck,
  // BarChart3,
  LogOut,
} from "lucide-react"

const menuItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Games",
    href: "/admin/games",
    icon: GamepadIcon,
  },
  {
    title: "Transactions",
    href: "/admin/transactions",
    icon: WalletCards,
  },
  // {
  //   title: "Settings",
  //   href: "/admin/settings",
  //   icon: SettingsIcon,
  // },
  // {
  //   title: "Security",
  //   href: "/admin/security",
  //   icon: ShieldCheck,
  // },
  // {
  //   title: "Reports",
  //   href: "/admin/reports",
  //   icon: BarChart3,
  // },
]

  // Handle Sign Out
  const handleSignOut = async () => {
    await signOut();
  };

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden lg:flex flex-col w-64 border-r bg-card">
      <div className="p-6">
        <h2 className="text-lg font-semibold">Admin Panel</h2>
        <p className="text-sm text-muted-foreground">Game Management System</p>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                isActive ? "bg-primary text-primary-foreground" : "hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <Icon className="w-4 h-4" />
              {item.title}
            </Link>
          )
        })}
      </nav>
      <div className="p-4 mt-auto">
        <button onClick={handleSignOut} className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm text-red-500 hover:bg-red-500/10 transition-colors">
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  )
}

