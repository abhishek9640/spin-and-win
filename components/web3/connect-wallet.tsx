"use client"

import { Button } from '@/components/ui/button'
import { Wallet, User, Edit, Check } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSession } from "next-auth/react"
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'

// Add TronLink types to global window
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

// Storage key constant
const STORED_WALLET_KEY = 'tronlink_wallet_address'

export function ConnectWallet() {
  const [isTronLinkInstalled, setIsTronLinkInstalled] = useState<boolean>(false)
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [address, setAddress] = useState<string>("")
  const { data: session } = useSession()
  const [username, setUsername] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isMobile, setIsMobile] = useState<boolean>(false)
  const [manualAddress, setManualAddress] = useState<string>("")
  const [isEditingAddress, setIsEditingAddress] = useState<boolean>(false)
  const [showManualInput, setShowManualInput] = useState<boolean>(false)

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = (navigator.userAgent || navigator.vendor || (window as Window & { opera?: string }).opera || '').toLowerCase();
      const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
      const isMobileDevice = mobileRegex.test(userAgent);
      setIsMobile(isMobileDevice);
      // Automatically show manual input for mobile users
      if (isMobileDevice) {
        setShowManualInput(true);
      }
    };
    checkMobile();
  }, []);

  // Check for stored address first
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedAddress = localStorage.getItem(STORED_WALLET_KEY);
      if (storedAddress) {
        setIsConnected(true);
        setAddress(storedAddress);
        console.log('Restored wallet connection from storage:', storedAddress);
      }
    }
  }, []);

  // Check if TronLink is installed and listen to account changes
  useEffect(() => {
    const checkTronLink = async () => {
      if (typeof window !== 'undefined' && window.tronWeb) {
        setIsTronLinkInstalled(true)

        try {
          const tronWebState = !!window.tronWeb && window.tronWeb.ready
          if (tronWebState) {
            const currentAddress = window.tronWeb.defaultAddress.base58
            if (currentAddress) {
              setIsConnected(true)
              setAddress(currentAddress)
              // Save to localStorage
              localStorage.setItem(STORED_WALLET_KEY, currentAddress)
            }
          }
        } catch (error) {
          console.error("Error checking TronLink connection:", error)
        }
      }
    }
    
    checkTronLink()

    // Listen for account changes
    if (typeof window !== 'undefined') {
      window.addEventListener('message', (e) => {
        if (e.data.message && e.data.message.action === "accountsChanged") {
          const currentAddress = window.tronWeb?.defaultAddress?.base58
          if (currentAddress) {
            setIsConnected(true)
            setAddress(currentAddress)
            // Save to localStorage
            localStorage.setItem(STORED_WALLET_KEY, currentAddress)
          } else {
            setIsConnected(false)
            setAddress("")
            // Remove from localStorage
            localStorage.removeItem(STORED_WALLET_KEY)
          }
        }
      })
    }

    return () => {
      // Cleanup event listener
      if (typeof window !== 'undefined') {
        window.removeEventListener('message', (e) => {
          if (e.data.message && e.data.message.action === "accountsChanged") {
            // Cleanup function
          }
        });
      }
    };
  }, []);

  // Update username when connected
  useEffect(() => {
    if (isConnected && address) {
      console.log('Connected TronLink Address:', address)
      
      if (session && 'user' in session && session.user && typeof session.user === 'object' && 'name' in session.user) {
        setUsername(session.user.name as string)
      } else {
        setUsername(`User_${address.slice(0, 4)}`)
      }
    }
  }, [isConnected, address, session]);

  // Handle manual address input
  const handleManualAddressSubmit = () => {
    if (!manualAddress) {
      toast.error("Please enter a valid TronLink address");
      return;
    }

    // Basic validation for Tron address format (should start with T and be 34 characters long)
    if (!/^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(manualAddress)) {
      toast.error("Invalid TronLink address format");
      return;
    }

    setIsConnected(true);
    setAddress(manualAddress);
    setShowManualInput(false);
    setIsEditingAddress(false);
    
    // Save to localStorage for persistence
    localStorage.setItem(STORED_WALLET_KEY, manualAddress);
    
    toast.success('Wallet connected successfully!');
  };

  // Handle desktop wallet connection
  const connectWallet = async () => {
    setIsLoading(true)
    try {
      if (isMobile) {
        // On mobile, just show the manual input
        setShowManualInput(true);
        setIsLoading(false);
        return;
      }

      if (!isTronLinkInstalled) {
        window.open('https://www.tronlink.org/', '_blank')
        setIsLoading(false);
        return;
      }

      if (window.tronWeb) {
        try {
          if (window.tronLink) {
            await window.tronLink.request({ method: 'tron_requestAccounts' })

            const tronWebState = window.tronWeb.ready
            if (tronWebState) {
              const currentAddress = window.tronWeb.defaultAddress.base58
              setIsConnected(true)
              setAddress(currentAddress)
              // Save to localStorage
              localStorage.setItem(STORED_WALLET_KEY, currentAddress)
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

  // Disconnect wallet
  const disconnectWallet = () => {
    setIsConnected(false)
    setAddress("")
    // Clear from localStorage
    localStorage.removeItem(STORED_WALLET_KEY)
    toast.info("Wallet disconnected.")
  }

  // Toggle editing address
  const toggleEditAddress = () => {
    if (isEditingAddress) {
      setIsEditingAddress(false);
    } else {
      setIsEditingAddress(true);
      setManualAddress(address); // Pre-fill with current address
    }
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-4">
        {isEditingAddress ? (
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter TronLink address"
              value={manualAddress}
              onChange={(e) => setManualAddress(e.target.value)}
              className="w-56"
            />
            <Button onClick={handleManualAddressSubmit} size="icon">
              <Check className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <>
            <span className="text-sm text-muted-foreground flex items-center">
              <User className="w-4 h-4 mr-2" />
              {username || `User_${address.slice(0, 4)}`}
            </span>
            <span className="text-sm truncate max-w-[140px]" title={address}>
              {address.slice(0, 6)}...{address.slice(-4)}
            </span>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleEditAddress}
              className="h-8 w-8"
            >
              <Edit className="w-4 h-4" />
            </Button>
          </>
        )}
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

  if (showManualInput) {
    return (
      <div className="flex flex-col gap-4 w-full max-w-sm">
        <div className="text-sm text-muted-foreground">
          Enter your TronLink address:
        </div>
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Enter TronLink address"
            value={manualAddress}
            onChange={(e) => setManualAddress(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleManualAddressSubmit}>
            Connect
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center h-full">
      <Button 
        onClick={connectWallet}
        className="flex items-center gap-4"
        disabled={isLoading}
      >
        <Wallet className="w-4 h-4" />
        {isLoading ? 'Connecting...' : isMobile ? 'Enter Wallet Address' : !isTronLinkInstalled ? 'Install TronLink' : 'Connect TronLink'}
      </Button>
    </div>
  )
}