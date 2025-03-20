"use client"

import { useAccount, useDisconnect } from 'wagmi'
import { Button } from '@/components/ui/button'
import { useWeb3Modal } from '@web3modal/wagmi/react'
import { Wallet } from 'lucide-react'
import { useEffect } from 'react'

export function ConnectWallet() {
  const { open } = useWeb3Modal()
  const { isConnected, address } = useAccount()
  const { disconnect } = useDisconnect()

  useEffect(() => {
    if (isConnected && address) {
      console.log('Connected MetaMask Address:', address)
    }
  }, [isConnected, address])

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">
          {address.slice(0, 6)}...{address.slice(-4)}
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