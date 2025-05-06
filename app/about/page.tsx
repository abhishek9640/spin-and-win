import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Coins, Zap, Shield, Sparkles, ChevronsRight, Repeat } from 'lucide-react'
import Link from 'next/link'
import { WalletAddressSync } from "@/components/WalletAddressSync"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/90 text-foreground">
      <WalletAddressSync />
      <Header />
      <div className="container py-20 px-4 md:px-6">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
          About Crypto Spin
        </h1>
        <div className="prose prose-invert max-w-none">
          <p className="text-zinc-400 text-lg leading-relaxed mb-8">
            Crypto Spin is a next-generation crypto gaming platform that combines the excitement of casino gaming with
            the security and transparency of blockchain technology. Our mission is to provide a fair, transparent, and
            entertaining gaming experience for crypto enthusiasts worldwide.
          </p>
          
          <p className="text-zinc-400 text-lg leading-relaxed">
            With our provably fair algorithm and instant payouts, we ensure that every spin is completely transparent and every win is promptly rewarded. Our platform is designed with both beginners and experienced players in mind, offering an intuitive interface and exciting gameplay that keeps you coming back for more.
          </p>
        </div>
      </div>
      
      {/* Features Section */}
      <section className="py-20 border-t border-primary/10 bg-gradient-to-b from-background/50 to-background">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-16 bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
            Why Choose Crypto Spin?
          </h2>
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-black/20 border-primary/10 backdrop-blur-sm overflow-hidden transform transition-all duration-300 hover:translate-y-[-5px] hover:shadow-xl">
              <CardContent className="pt-8">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Coins className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">USDT Bets</h3>
                  <p className="text-muted-foreground">
                    Place bets using USDT (TRC-20) with a minimum bet of just 2 USDT to start playing.
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-black/20 border-primary/10 backdrop-blur-sm overflow-hidden transform transition-all duration-300 hover:translate-y-[-5px] hover:shadow-xl">
              <CardContent className="pt-8">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Zap className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Massive Multipliers</h3>
                  <p className="text-muted-foreground">
                    Win up to 5x in Round 1 and an incredible 25x multiplier in Round 2.
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-black/20 border-primary/10 backdrop-blur-sm overflow-hidden transform transition-all duration-300 hover:translate-y-[-5px] hover:shadow-xl">
              <CardContent className="pt-8">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Shield className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Instant Payouts</h3>
                  <p className="text-muted-foreground">
                    All winnings are automatically sent to your wallet without delays or complications.
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-black/20 border-primary/10 backdrop-blur-sm overflow-hidden transform transition-all duration-300 hover:translate-y-[-5px] hover:shadow-xl">
              <CardContent className="pt-8">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Repeat className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Multiple Rounds</h3>
                  <p className="text-muted-foreground">
                    Progress from Round 1 to Round 2 for even bigger rewards and more excitement.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16">
        <div className="container px-4 md:px-6">
          <div className="rounded-2xl bg-gradient-to-r from-primary/20 via-purple-500/20 to-pink-500/20 p-1">
            <div className="bg-black/40 backdrop-blur-md rounded-xl p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-10 items-center">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                    Ready to Spin and Win?
                  </h2>
                  <p className="text-lg mb-6 text-muted-foreground">
                    Connect your wallet, place your bets, and start spinning the wheel for a chance to win big with crypto!
                  </p>
                  <Button size="lg" className="text-lg px-8 py-6" asChild>
                    <Link href="/play">
                      <span>Play Now</span>
                      <ChevronsRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
                <div className="flex justify-center md:justify-end">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-black/30 rounded-lg p-6 border border-white/10">
                      <div className="text-4xl font-bold text-primary mb-2">5x</div>
                      <div className="text-sm">Round 1 Multiplier</div>
                    </div>
                    <div className="bg-black/30 rounded-lg p-6 border border-white/10">
                      <div className="text-4xl font-bold text-yellow-500 mb-2">25x</div>
                      <div className="text-sm">Round 2 Multiplier</div>
                    </div>
                    <div className="bg-black/30 rounded-lg p-6 border border-white/10">
                      <div className="text-4xl font-bold text-green-500 mb-2">2</div>
                      <div className="text-sm">Min. USDT Bet</div>
                    </div>
                    <div className="bg-black/30 rounded-lg p-6 border border-white/10">
                      <div className="text-4xl font-bold text-purple-500 mb-2">9</div>
                      <div className="text-sm">Number Options</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="relative border-t border-primary/10 py-8 md:py-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 z-0"></div>
        <div className="container relative z-10 px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                Crypto Spin
              </span>
            </div>

            <div className="flex flex-wrap justify-center gap-4 md:gap-8">
              <Link href="#" className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors">
                Terms & Conditions
              </Link>
              <Link href="#" className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors">
                FAQs
              </Link>
              <Link href="#" className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors">
                Contact Us
              </Link>
            </div>

            <p className="text-xs md:text-sm text-muted-foreground text-center md:text-right">
              © {new Date().getFullYear()} Crypto Spin. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

