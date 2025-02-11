import { CasinoWheel } from "@/components/casino-wheel"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Coins, Zap, Shield, Sparkles } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Header />

      {/* Hero Section */}
      <section className="py-20">
        <div className="container px-4 md:px-6">
          <div className="grid gap-12 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px] items-center">
            <div className="flex flex-col justify-center space-y-8">
              <div className="space-y-6">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  Experience the Thrill of Crypto Gaming
                </h1>
                <p className="max-w-[600px] text-zinc-400 text-xl leading-relaxed">
                  Spin the wheel for a chance to multiply your crypto. A provably fair gaming experience with instant
                  payouts.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="text-lg">
                  Start Playing
                </Button>
                <Button size="lg" variant="outline" className="text-lg">
                  How It Works
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-500 rounded-full blur-2xl opacity-25 animate-pulse" />
                <CasinoWheel />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 border-t border-neutral-900/10 bg-white/5 dark:border-neutral-50/10 dark:bg-neutral-950/5">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
            How It Works
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="bg-white/5 border-neutral-900/10 dark:bg-neutral-950/5 dark:border-neutral-50/10">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-3 rounded-full bg-neutral-900/10 dark:bg-neutral-50/10">
                    <Coins className="h-6 w-6 text-neutral-900 dark:text-neutral-50" />
                  </div>
                  <h3 className="text-xl font-bold">1. Place Your Bet</h3>
                  <p className="text-zinc-400">
                    Connect your wallet and choose your bet amount in your preferred cryptocurrency.
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/5 border-neutral-900/10 dark:bg-neutral-950/5 dark:border-neutral-50/10">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-3 rounded-full bg-neutral-900/10 dark:bg-neutral-50/10">
                    <Zap className="h-6 w-6 text-neutral-900 dark:text-neutral-50" />
                  </div>
                  <h3 className="text-xl font-bold">2. Spin the Wheel</h3>
                  <p className="text-zinc-400">
                    Click to spin the wheel and watch as it determines your prize multiplier.
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/5 border-neutral-900/10 dark:bg-neutral-950/5 dark:border-neutral-50/10">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-3 rounded-full bg-neutral-900/10 dark:bg-neutral-50/10">
                    <Shield className="h-6 w-6 text-neutral-900 dark:text-neutral-50" />
                  </div>
                  <h3 className="text-xl font-bold">3. Collect Winnings</h3>
                  <p className="text-zinc-400">
                    Your winnings are automatically sent to your wallet. No delays, no hassle.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container px-4 md:px-6">
          <div className="grid gap-12 lg:grid-cols-2">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                Provably Fair Gaming
              </h2>
              <p className="text-zinc-400 leading-relaxed">
                Our gaming system uses blockchain technology to ensure complete transparency and fairness. Every spin
                result can be verified on the blockchain, giving you peace of mind while you play.
              </p>
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                Instant Crypto Payouts
              </h2>
              <p className="text-zinc-400 leading-relaxed">
                No waiting periods or complicated withdrawal processes. Your winnings are sent directly to your wallet
                as soon as you win, thanks to our smart contract technology.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-900/10 py-6 bg-white/5 dark:border-neutral-50/10 dark:bg-neutral-950/5">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-neutral-900 dark:text-neutral-50" />
              <span className="text-xl font-bold">Crypto Spin</span>
            </div>
            <p className="text-sm text-zinc-400">© {new Date().getFullYear()} Crypto Spin. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

