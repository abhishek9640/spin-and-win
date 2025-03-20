"use client"

import { SpinGameUI } from "@/components/game/spin-game-ui"
import { Header } from "@/components/header"
import { useAccount } from "wagmi"
import { useSession } from "next-auth/react"
import { ConnectWallet } from "@/components/web3/connect-wallet"
import { Card } from "@/components/ui/card"
import { LoginButton } from "@/components/auth-dialog"

export default function PlayPage() {
  const { isConnected } = useAccount()
  const { data: session } = useSession()

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <Header />
      
      {!isConnected || !session ? (
        <div className="container py-20">
          <Card className="max-w-lg mx-auto p-8 bg-gray-800/50 border-gray-700">
            <h2 className="text-2xl font-bold text-center mb-8 bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
              Connect to Start Playing
            </h2>
            <div className="space-y-6">
              {!isConnected && (
                <div className="text-center">
                  <p className="text-muted-foreground mb-4">
                    Please connect your wallet to play
                  </p>
                  <ConnectWallet />
                </div>
              )}
              {isConnected && !session && (
                <div className="text-center">
                  <p className="text-muted-foreground mb-4">
                    Please sign in to continue
                  </p>
                  <LoginButton />
                </div>
              )}
            </div>
          </Card>
        </div>
      ) : (
        <SpinGameUI />
      )}
    </div>
  )
}

