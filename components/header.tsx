"use client"

import Link from "next/link"
import { Sparkles, User, Menu, X } from "lucide-react"
import { LoginButton } from "./auth-dialog"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { ConnectWallet } from "./web3/connect-wallet"
import { useState } from "react"
import { Button } from "./ui/button"

export function Header() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
  ]

  return (
    <header className="border-b border-neutral-900/10 bg-white/5 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50 dark:border-neutral-50/10 dark:bg-neutral-950/5 dark:supports-[backdrop-filter]:bg-neutral-950/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4 md:gap-6">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 md:h-6 md:w-6 text-neutral-900 dark:text-neutral-50" />
            <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
              Crypto Spin
            </span>
          </Link>
          {/* Desktop Navigation */}
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

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          {session && <ConnectWallet />}
          <LoginButton />
          {session && (
            <Link href="/profile">
              <User className="h-5 w-5 md:h-6 md:w-6 text-neutral-900 dark:text-neutral-50 hover:text-primary transition-colors" />
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-900/10 dark:border-neutral-50/10">
          <div className="container py-4 px-4 flex flex-col gap-4">
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-sm py-2 transition-colors hover:text-primary ${
                    pathname === item.path ? "text-neutral-900 dark:text-neutral-50" : "text-neutral-500 dark:text-neutral-400"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
            <div className="flex flex-col gap-3 pt-2 border-t border-neutral-900/10 dark:border-neutral-50/10">
              {session && <ConnectWallet />}
              <LoginButton />
              {session && (
                <Link 
                  href="/profile" 
                  className="flex items-center gap-2 text-sm text-neutral-500 hover:text-primary transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <User className="h-5 w-5" />
                  Profile
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
