import { CasinoWheel } from "@/components/casino-wheel"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Coins, Zap, Shield, Sparkles, CheckCircle, AlertCircle, Award, Repeat, ArrowRight, ChevronRight, ChevronsRight } from 'lucide-react'
import { WalletAddressSync } from "@/components/WalletAddressSync"
import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/90 text-foreground">
      <WalletAddressSync />
      <Header />

      {/* Hero Section with Animated Background */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 z-0 bg-[url('/images/casino-bg.jpg')] bg-cover bg-center opacity-10"></div>
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent to-background"></div>
        
        {/* Floating Coins Animation */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {[...Array(15)].map((_, i) => (
            <div 
              key={i}
              className="absolute animate-float" 
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 10}s`,
                animationDuration: `${15 + Math.random() * 10}s`
              }}
            >
              <Coins className={`h-${Math.floor(Math.random() * 3) + 4} w-${Math.floor(Math.random() * 3) + 4} text-primary/30`} />
            </div>
          ))}
        </div>
        
        <div className="container relative z-10 px-4 md:px-6">
          <div className="grid gap-12 lg:grid-cols-[1fr_450px] lg:gap-16 xl:grid-cols-[1fr_500px] items-center">
            <div className="flex flex-col justify-center space-y-8">
              <div className="space-y-6">
                <h1 className="text-5xl font-bold tracking-tighter sm:text-6xl xl:text-7xl/none">
                  <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                    Spin, Win & Multiply
                  </span>
                  <br />
                  <span>Your Crypto Fortune</span>
                </h1>
                <p className="max-w-[600px] text-xl leading-relaxed text-muted-foreground">
                  The ultimate crypto luck game with up to 25x multipliers! Place your bets, spin the wheel, 
                  and watch your USDT multiply instantly.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-5">
                <Button size="lg" className="text-lg px-8 py-6" asChild>
                  <Link href="/play">
                    <span>Start Playing</span>
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                  Learn More
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-4 pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>USDT (TRC-20) Bets</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Up to 25x Rewards</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Instant Payouts</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Multiple Rounds</span>
                </div>
              </div>
            </div>
            <div className="relative flex items-center justify-center">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary to-purple-500 rounded-full blur-3xl opacity-25 animate-pulse"></div>
              <div className="relative z-10 transform transition-transform hover:scale-105 duration-500">
                <CasinoWheel />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Game Instructions Section */}
      <section className="py-20" id="how-to-play">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 inline-block bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
              🎮 How to Play
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Follow these simple steps to start winning crypto with our exciting wheel game!
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-center mb-20">
            <div className="bg-black/30 backdrop-blur-sm rounded-2xl overflow-hidden shadow-xl border border-white/10">
              <div className="aspect-video relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
                <Image 
                  src="/images/round-1.png" 
                  alt="Round 1 Gameplay" 
                  fill 
                  className="object-cover"
                />
                <div className="absolute bottom-4 left-4 z-20">
                  <span className="bg-primary/80 backdrop-blur-sm text-white py-1 px-4 rounded-full text-sm font-semibold">
                    ROUND 1
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-4">The Multi-Bet Round</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <ChevronRight className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
                    <span>Place a minimum bet of 2 USDT (TRC-20)</span>
                  </li>
                  <li className="flex items-start">
                    <ChevronRight className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
                    <span>Select multiple numbers between 1 to 9</span>
                  </li>
                  <li className="flex items-start">
                    <ChevronRight className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
                    <span>Spin the wheel and land on your number to win</span>
                  </li>
                  <li className="flex items-start">
                    <ChevronRight className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
                    <span>Win 5x your total bet amount if the wheel lands on your number</span>
                  </li>
                </ul>
                <div className="mt-6 p-4 bg-primary/10 rounded-lg">
                  <div className="flex items-center">
                    <Award className="h-6 w-6 text-primary mr-3" />
                    <span className="font-semibold">After winning Round 1:</span>
                  </div>
                  <div className="mt-2 flex items-center gap-6">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span>Withdraw winnings</span>
                    </div>
                    <div className="text-lg font-bold">OR</div>
                    <div className="flex items-center">
                      <Repeat className="h-5 w-5 text-yellow-500 mr-2" />
                      <span>Continue to Round 2</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-black/30 backdrop-blur-sm rounded-2xl overflow-hidden shadow-xl border border-white/10">
              <div className="aspect-video relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
                <Image 
                  src="/images/game-round2.jpg" 
                  alt="Round 2 Gameplay" 
                  fill 
                  className="object-cover"
                />
                <div className="absolute bottom-4 left-4 z-20">
                  <span className="bg-yellow-500/80 backdrop-blur-sm text-white py-1 px-4 rounded-full text-sm font-semibold">
                    ROUND 2
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-4">The High-Stakes Final Spin</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <ChevronRight className="h-5 w-5 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span>Bet on a single number (1 to 9) only</span>
                  </li>
                  <li className="flex items-start">
                    <ChevronRight className="h-5 w-5 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span>Higher risk but with massive 25x reward potential</span>
                  </li>
                  <li className="flex items-start">
                    <ChevronRight className="h-5 w-5 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span>Cannot withdraw Round 1 winnings once you enter Round 2</span>
                  </li>
                  <li className="flex items-start">
                    <ChevronRight className="h-5 w-5 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span>Round 1 bet amount gets multiplied by 25x if you win</span>
                  </li>
                </ul>
                <div className="mt-6 p-4 bg-yellow-500/10 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="h-6 w-6 text-yellow-500 mr-3" />
                    <span className="font-semibold">Important:</span>
                  </div>
                  <p className="mt-2">
                    Round 2 is riskier but comes with a huge potential reward. Bet wisely and try your luck!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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
      <section className="py-20">
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

      {/* Footer with animated background */}
      <footer className="relative border-t border-primary/10 py-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 z-0"></div>
        <div className="container relative z-10 px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                Crypto Spin
              </span>
            </div>
            
            <div className="flex flex-wrap justify-center gap-8">
              <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Terms & Conditions
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                FAQs
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Contact Us
              </Link>
            </div>

            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Crypto Spin. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}