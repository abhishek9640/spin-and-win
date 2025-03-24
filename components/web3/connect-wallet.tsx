"use client"

import { useAccount, useDisconnect } from 'wagmi'
import { Button } from '@/components/ui/button'
import { useWeb3Modal } from '@web3modal/wagmi/react'
import { Wallet, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSession } from "next-auth/react"

export function ConnectWallet() {
  const { open } = useWeb3Modal()
  const { isConnected, address } = useAccount()
  const { disconnect } = useDisconnect()
  const { data: session } = useSession()
  const [username, setUsername] = useState<string>("")

  useEffect(() => {
    if (isConnected && address) {
      console.log('Connected MetaMask Address:', address)
      
      // Set a username based on session data or a default one
      if (session && 'user' in session && session.user && typeof session.user === 'object' && 'name' in session.user) {
        setUsername(session.user.name as string)
      } else {
        // Create a username based on address if no session name
        setUsername(`User_${address.slice(0, 4)}`)
      }
    }
  }, [isConnected, address, session])

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground flex items-center">
          <User className="w-4 h-4 mr-2" />
          {username || `User_${address.slice(0, 4)}`}
        </span>
        <Button 
          variant="outline" 
          onClick={() => disconnect()}
          className="flex items-center gap-2"
        >
          <Wallet className="w-4 h-4" />
          Disconnect
        </Button>
      </div>
    )
  }

  return (
    <div className="flex justify-center items-center h-full">
      <Button 
        onClick={() => open()}
        className="flex items-center gap-4"
      >
        <Wallet className="w-4 h-4" />
        Connect MetaMask
      </Button>
    </div>  
  )
} 