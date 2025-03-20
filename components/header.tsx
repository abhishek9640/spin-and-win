"use client"

import Link from "next/link"
import { Sparkles, User } from "lucide-react"
import { LoginButton } from "./auth-dialog"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { ConnectWallet } from "./web3/connect-wallet"

export function Header() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const navItems = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
  ]

  return (
    <header className="border-b border-neutral-900/10 bg-white/5 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50 dark:border-neutral-50/10 dark:bg-neutral-950/5 dark:supports-[backdrop-filter]:bg-neutral-950/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-neutral-900 dark:text-neutral-50" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
              Crypto Spin
            </span>
          </Link>
          <nav className="hidden md:flex gap-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`text-sm transition-colors hover:text-primary ${
                  pathname === item.path ? "text-neutral-900 dark:text-neutral-50" : "text-neutral-500 dark:text-neutral-400"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <ConnectWallet />
          <LoginButton />
          {session && (
            <Link href="/profile">
              <User className="h-6 w-6 text-neutral-900 dark:text-neutral-50 hover:text-primary transition-colors" />
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
