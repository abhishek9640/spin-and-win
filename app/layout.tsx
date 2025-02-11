import { Inter } from "next/font/google"
import "./globals.css"
import { Web3Provider } from "@/providers/web3-provider"
import SessionProviderWrapper from "@/components/sessionProvider"
import type React from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Crypto Spin - Blockchain Casino Gaming",
  description: "Spin the wheel and win crypto prizes instantly",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        {/* Wrap the entire app with both providers */}
        <SessionProviderWrapper>
          <Web3Provider>{children}</Web3Provider>
        </SessionProviderWrapper>
      </body>
    </html>
  )
}
