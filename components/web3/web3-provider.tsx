"use client"

import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { mainnet } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'
import { useEffect, useState } from 'react'

// Storage key constant for wallet address
const STORED_WALLET_KEY = 'tronlink_wallet_address';

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || ''

const metadata = {
  name: 'Crypto Spin',
  description: 'Spin the wheel and win crypto prizes instantly',
  url: 'https://cryptospin.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

// Only include MetaMask connector
const config = defaultWagmiConfig({
  chains: [mainnet], 
  projectId,
  metadata,
  connectors: [
    injected({
      target: 'metaMask',
      shimDisconnect: true,
    })
  ]
})

const queryClient = new QueryClient()

// Move web3modal creation to client-side only
if (typeof window !== 'undefined') {
  createWeb3Modal({
    wagmiConfig: config,
    projectId,
    themeMode: 'dark',
    themeVariables: {
      '--w3m-accent': '#7C3AED'
    },
    // Only show MetaMask wallet
    featuredWalletIds: ['c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96'], // MetaMask wallet ID
    // Disable all other wallets
    includeWalletIds: ['c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96'], // MetaMask wallet ID
  })
}

// Helper function to check if TronLink is installed
const isTronLinkInstalled = () => {
  return typeof window !== 'undefined' && (!!window.tronWeb || !!window.tronLink);
};

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Check for TronLink connection on mount
    const checkTronLinkConnection = () => {
      // First check for stored address in localStorage
      const storedAddress = localStorage.getItem(STORED_WALLET_KEY);
      
      if (storedAddress) {
        console.log('Found stored wallet address:', storedAddress);
        return; // If we have a stored address, use that
      }
      
      // Only check for live TronLink connection if we don't have a stored address
      if (isTronLinkInstalled() && window.tronWeb?.defaultAddress?.base58) {
        const currentAddress = window.tronWeb.defaultAddress.base58;
        console.log('Found active TronLink connection:', currentAddress);
        // Store the address
        localStorage.setItem(STORED_WALLET_KEY, currentAddress);
      }
    };
    
    checkTronLinkConnection();
    
    // Setup event listener for TronLink account changes
    const handleTronLinkAccountChange = (e: MessageEvent) => {
      if (e.data?.message?.action === "accountsChanged") {
        if (window.tronWeb?.defaultAddress?.base58) {
          // Update stored address when account changes
          localStorage.setItem(STORED_WALLET_KEY, window.tronWeb.defaultAddress.base58);
          console.log('TronLink account changed, updated stored address');
        } else {
          // If account disconnected, remove the stored address
          localStorage.removeItem(STORED_WALLET_KEY);
          console.log('TronLink disconnected, removed stored address');
        }
      }
    };
    
    window.addEventListener('message', handleTronLinkAccountChange);
    
    return () => {
      window.removeEventListener('message', handleTronLinkAccountChange);
    };
  }, [])

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {mounted ? children : null}
      </QueryClientProvider>
    </WagmiProvider>
  )
} 