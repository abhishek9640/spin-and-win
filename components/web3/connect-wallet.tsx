"use client"

import { Button } from '@/components/ui/button'
import { Wallet, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSession } from "next-auth/react"

// Add TronLink types
declare global {
  interface Window {
    tronWeb?: {
      ready: boolean;
      defaultAddress: {
        base58: string;
        hex: string;
      };
    };
    tronLink?: {
      request: (args: { method: string }) => Promise<unknown>;
    };
  }
}

export function ConnectWallet() {
  const [isTronLinkInstalled, setIsTronLinkInstalled] = useState<boolean>(false)
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [address, setAddress] = useState<string>("")
  const { data: session } = useSession()
  const [username, setUsername] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // Check if TronLink is installed
  useEffect(() => {
    const checkTronLink = async () => {
      if (typeof window !== 'undefined' && window.tronWeb) {
        setIsTronLinkInstalled(true)
        
        // Check if already connected
        try {
          const tronWebState = !!window.tronWeb && window.tronWeb.ready
          if (tronWebState) {
            const currentAddress = window.tronWeb.defaultAddress.base58
            if (currentAddress) {
              setIsConnected(true)
              setAddress(currentAddress)
            }
          }
        } catch (error) {
          console.error("Error checking TronLink connection:", error)
        }
      }
    }
    
    checkTronLink()
    
    // Add event listener for account changes
    if (typeof window !== 'undefined') {
      window.addEventListener('message', function (e) {
        if (e.data.message && e.data.message.action === "accountsChanged") {
          const currentAddress = window.tronWeb?.defaultAddress?.base58
          if (currentAddress) {
            setIsConnected(true)
            setAddress(currentAddress)
          } else {
            setIsConnected(false)
            setAddress("")
          }
        }
      })
    }
  }, [])

  useEffect(() => {
    if (isConnected && address) {
      console.log('Connected TronLink Address:', address)
      
      // Set a username based on session data or a default one
      if (session && 'user' in session && session.user && typeof session.user === 'object' && 'name' in session.user) {
        setUsername(session.user.name as string)
      } else {
        // Create a username based on address if no session name
        setUsername(`User_${address.slice(0, 4)}`)
      }
    }
  }, [isConnected, address, session])

  const connectWallet = async () => {
    setIsLoading(true)
    try {
      if (!isTronLinkInstalled) {
        window.open('https://www.tronlink.org/', '_blank')
        return
      }
      
      if (window.tronWeb) {
        try {
          // Request account access
          if (window.tronLink) {
            await window.tronLink.request({ method: 'tron_requestAccounts' })
          
            // Check if connected after request
            const tronWebState = window.tronWeb.ready
            if (tronWebState) {
              const currentAddress = window.tronWeb.defaultAddress.base58
              setIsConnected(true)
              setAddress(currentAddress)
            }
          } else {
            console.error("TronLink is not available")
            alert("Please make sure TronLink extension is installed and unlocked")
          }
        } catch (error) {
          console.error("Error connecting to TronLink:", error)
        }
      }
    } catch (error) {
      console.error("TronLink connection error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const disconnectWallet = () => {
    // TronLink doesn't have a direct disconnect method
    // Clear local state instead
    setIsConnected(false)
    setAddress("")
    alert("To fully disconnect, please log out from your TronLink wallet extension.")
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground flex items-center">
          <User className="w-4 h-4 mr-2" />
          {username || `User_${address.slice(0, 4)}`}
        </span>
        <Button 
          variant="outline" 
          onClick={disconnectWallet}
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
        onClick={connectWallet}
        className="flex items-center gap-4"
        disabled={isLoading}
      >
        <Wallet className="w-4 h-4" />
        {isLoading ? 'Connecting...' : !isTronLinkInstalled ? 'Install TronLink' : 'Connect TronLink'}
      </Button>
    </div>  
  )
} 