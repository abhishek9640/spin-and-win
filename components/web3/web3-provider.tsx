"use client"

import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { mainnet } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'
import { useEffect, useState } from 'react'

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

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {mounted ? children : null}
      </QueryClientProvider>
    </WagmiProvider>
  )
} 