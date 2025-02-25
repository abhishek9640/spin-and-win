// "use client"

// import { createWeb3Modal, defaultWagmiConfig } from "@web3modal/wagmi/react"
// import { WagmiConfig } from "wagmi"
// import { arbitrum, mainnet, Chain } from "viem/chains"
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
// import { useEffect, useState } from "react"
// import type React from "react" // Added import for React

// const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID!

// const metadata = {
//   name: "Crypto Spin & Win",
//   description: "Crypto Casino Gaming Platform",
//   url: "https://crypto-spin-win.com",
//   icons: ["https://avatars.githubusercontent.com/u/37784886"],
// }

// const chains: readonly [Chain, ...Chain[]] = [mainnet, arbitrum]
// const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata })
// const queryClient = new QueryClient()

// // Initialize web3modal
// if (typeof window !== "undefined") {
//   createWeb3Modal({ wagmiConfig, projectId })
// }

// export function Web3Provider({ children }: { children: React.ReactNode }) {
//   const [mounted, setMounted] = useState(false)

//   useEffect(() => {
//     setMounted(true)
//   }, [])

//   return (
//     <WagmiConfig config={wagmiConfig}>
//       <QueryClientProvider client={queryClient}>{mounted && children}</QueryClientProvider>
//     </WagmiConfig>
//   )
// }

