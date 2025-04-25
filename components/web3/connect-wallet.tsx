"use client"

import { Button } from '@/components/ui/button'
import { Wallet, User, Smartphone } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSession } from "next-auth/react"
import { toast } from 'sonner'

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
  const [isMobile, setIsMobile] = useState<boolean>(false)

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = (navigator.userAgent || navigator.vendor || (window as Window & { opera?: string }).opera || '').toLowerCase();
      const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
      setIsMobile(mobileRegex.test(userAgent));
    };
    checkMobile();
  }, []);

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

  const connectMobileWallet = () => {
    try {
      // Format the request data according to TronLink mobile specifications
      const dappData = {
        protocol: 'TronLink',
        version: '1.0',
        dappName: 'Crypto Spin',
        dappIcon: `${window.location.origin}/favicon.ico`,
        network: 'mainnet',
        action: 'connect',
        message: 'Connect to Crypto Spin'
      };

      // Encode the data properly
      const base64Data = Buffer.from(JSON.stringify(dappData)).toString('base64');
      
      // Construct the mobile deep link with the exact format TronLink expects
      const tronLinkUrl = `tronlinkoutside://dapp?param=${base64Data}`;
      
      // Open TronLink app
      window.location.href = tronLinkUrl;

      // Fallback to app store after delay if app doesn't open
      setTimeout(() => {
        const isAndroid = /android/i.test(navigator.userAgent);
        const storeUrl = isAndroid 
          ? 'https://play.google.com/store/apps/details?id=com.tronlinkpro.wallet'
          : 'https://apps.apple.com/us/app/tronlink-trx-btt-wallet/id1453530188';
        window.location.href = storeUrl;
      }, 2000);
    } catch (error) {
      console.error('TronLink connection error:', error);
      toast.error('Failed to connect wallet. Please try again.');
    }
  };

  const connectWallet = async () => {
    setIsLoading(true)
    try {
      if (isMobile) {
        connectMobileWallet();
        return;
      }

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
              toast.success('Wallet connected successfully!')
            }
          } else {
            console.error("TronLink is not available")
            toast.error("Please make sure TronLink extension is installed and unlocked")
          }
        } catch (error) {
          console.error("Error connecting to TronLink:", error)
          toast.error("Failed to connect wallet. Please try again.")
        }
      }
    } catch (error) {
      console.error("TronLink connection error:", error)
      toast.error("Failed to connect wallet. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const disconnectWallet = () => {
    // TronLink doesn't have a direct disconnect method
    // Clear local state instead
    setIsConnected(false)
    setAddress("")
    toast.info("To fully disconnect, please log out from your TronLink wallet.")
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
        {isMobile ? <Smartphone className="w-4 h-4" /> : <Wallet className="w-4 h-4" />}
        {isLoading ? 'Connecting...' : isMobile ? 'Open TronLink App' : !isTronLinkInstalled ? 'Install TronLink' : 'Connect TronLink'}
      </Button>
    </div>  
  )
} 