"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Header } from '@/components/header'
import { ArrowLeft, Check, Copy } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

// Storage key constant - must match other components
const STORED_WALLET_KEY = 'tronlink_wallet_address';

export default function WalletConnectPage() {
  const [address, setAddress] = useState<string>("")
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const router = useRouter()

  // Check if there's already a stored address
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedAddress = localStorage.getItem(STORED_WALLET_KEY);
      if (storedAddress) {
        setAddress(storedAddress);
        setIsConnected(true);
      }
    }
  }, []);

  const handleManualAddressSubmit = () => {
    if (!address) {
      toast.error("Please enter a valid TronLink address");
      return;
    }

    // Basic validation for Tron address format (should start with T and be 34 characters long)
    if (!/^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(address)) {
      toast.error("Invalid TronLink address format");
      return;
    }

    setIsLoading(true);
    
    try {
      // Save to localStorage
      localStorage.setItem(STORED_WALLET_KEY, address);
      setIsConnected(true);
      toast.success('Wallet connected successfully!');
      
      // Navigate back to games page
      setTimeout(() => {
        router.push('/play');
      }, 1500);
    } catch (error) {
      console.error("Error saving wallet address:", error);
      toast.error("Failed to save wallet address. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setAddress("");
    localStorage.removeItem(STORED_WALLET_KEY);
    toast.info("Wallet disconnected");
  };

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast.success("Address copied to clipboard");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <Header />

      <main className="container max-w-md mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" asChild className="mr-2">
            <Link href="/play">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Connect Wallet</h1>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-card border rounded-lg p-6 shadow-sm"
        >
          {isConnected ? (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-3">
                  <Check className="h-6 w-6 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold">Wallet Connected</h2>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                <div className="truncate max-w-[220px]" title={address}>
                  {address.slice(0, 6)}...{address.slice(-6)}
                </div>
                <Button variant="ghost" size="icon" onClick={copyAddress}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-3 pt-4">
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => setIsConnected(false)}
                >
                  Edit Address
                </Button>
                <Button 
                  className="w-full" 
                  variant="destructive"
                  onClick={disconnectWallet}
                >
                  Disconnect Wallet
                </Button>
                <Button className="w-full" asChild>
                  <Link href="/play">
                    Return to Games
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-medium mb-2">Enter your TronLink address</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Please enter your TronLink wallet address to connect and play games.
                </p>
              </div>
              
              <div className="space-y-3">
                <Input
                  placeholder="Your TronLink address (starts with T)"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full"
                />
                <Button 
                  className="w-full" 
                  onClick={handleManualAddressSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? 'Connecting...' : 'Connect Wallet'}
                </Button>
              </div>
              
              <div className="pt-3 text-center">
                <p className="text-xs text-muted-foreground">
                  You can find your TronLink address in your wallet app or browser extension.
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  )
} 