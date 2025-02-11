import { Inter } from "next/font/google"
import "./globals.css"
import { Web3Provider } from "./providers/web3-provider"
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
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Web3Provider>{children}</Web3Provider>
      </body>
    </html>
  )
}

