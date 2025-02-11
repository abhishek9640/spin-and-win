"use client"

import { useAccount, useBalance, useDisconnect } from "wagmi"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Wallet, LogOut, Copy } from "lucide-react"
import { useState, useEffect } from "react"
import { useWeb3Modal } from "@web3modal/wagmi/react"

export function WalletConnect() {
  const { open } = useWeb3Modal()
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const [mounted, setMounted] = useState(false)
  const [copied, setCopied] = useState(false)

  const { data: balance } = useBalance({
    address: address,
    enabled: mounted && isConnected,
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!mounted) {
    return (
      <Button variant="outline" className="border-neutral-900 hover:border-neutral-900/80 dark:border-neutral-50 dark:hover:border-neutral-50/80">
        <Wallet className="mr-2 h-4 w-4" />
        Loading...
      </Button>
    )
  }

  if (!isConnected) {
    return (
      <Button variant="outline" className="border-neutral-900 hover:border-neutral-900/80 dark:border-neutral-50 dark:hover:border-neutral-50/80" onClick={() => open()}>
        <Wallet className="mr-2 h-4 w-4" />
        Connect Wallet
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="border-neutral-900 hover:border-neutral-900/80 dark:border-neutral-50 dark:hover:border-neutral-50/80">
          <Wallet className="mr-2 h-4 w-4" />
          {balance?.formatted ? `${Number(balance.formatted).toFixed(4)} ${balance.symbol}` : "0.00 ETH"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuItem onClick={copyAddress} className="cursor-pointer">
          <Copy className="mr-2 h-4 w-4" />
          {copied ? "Copied!" : "Copy Address"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => disconnect()} className="cursor-pointer text-red-500">
          <LogOut className="mr-2 h-4 w-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

