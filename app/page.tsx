'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Coins, Sparkles, CheckCircle, ArrowRight } from 'lucide-react'
import { WalletAddressSync } from "@/components/WalletAddressSync"
import Link from 'next/link'
import { toast } from 'sonner'
import { ImageSlider } from '@/components/ui/image-slider'

// Define interfaces for the API response
interface GameItem {
  name: string;
  odds: number;
  _id: string;
}

interface Bet {
  userId: string;
  amount: number;
  item: string;
  transaction_id: string;
  round_count: number;
  _id: string;
}

interface Game {
  _id: string;
  name?: string;
  description?: string;
  minBet?: number;
  maxBet?: number;
  status?: 'active' | 'inactive' | 'completed';
  createdAt?: string;
  imageUrl?: string;
  items: GameItem[];
  round?: number;
  bets?: Bet[];
}

export default function Home() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const [loading, setLoading] = useState(false);
  
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://spinwin.shreyanshkataria.com';

  const handleStartPlaying = async () => {
    if (sessionStatus === 'unauthenticated') {
      router.push('/api/auth/signin');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/v1/game/fetch-games`, {
        headers: {
          'Authorization': `${session?.user?.authToken}`,
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch games');
      }

      const data = await response.json();
      
      // Find the first active game that's not completed
      const activeGame = data.data.records.find(
        (game: Game) => game.status !== 'completed' && (!game.bets || game.bets.length === 0)
      );

      if (activeGame) {
        router.push(`/play/${activeGame._id}`);
      } else {
        router.push('/play'); // Fallback to games list if no active game found
      }
    } catch (error) {
      console.error('Error fetching games:', error);
      toast.error('Failed to load games. Please try again.');
      router.push('/play');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/90 text-foreground">
      <WalletAddressSync />
      <Header />
      
      {/* Banner Hero Section with Slider */}
      <section className="relative py-4 overflow-hidden">
        <div className="container relative z-10 px-4 md:px-6">
          <div className="relative w-full max-w-10xl mx-auto rounded-2xl overflow-hidden">
            <ImageSlider 
              images={["/home.png", "/home2.png", "/home3.png"]} 
              autoPlayInterval={5000}
            />
          </div>
        </div>
      </section>

      {/* Hero Section with Animated Background */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <video 
            className="w-full h-full object-cover opacity-30" 
            autoPlay 
            loop 
            muted 
            playsInline
            poster="/images/casino-bg.jpg"
          >
            <source src="/casino.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
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
          <div className="flex flex-col justify-center space-y-8 max-w-4xl mx-auto text-center">
            <div className="space-y-6">
              <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight text-center leading-tight">
                <span className="block bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                  BIG WINS
                </span>
                <span className="block bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                  AWAIT!
                </span>
              </h1>
              <p className="mt-6 text-2xl md:text-3xl font-bold text-center bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                Spin the Wheel. Beat the Odds. WIN BIG Today!
              </p>
              
            </div>
            <div className="flex flex-col sm:flex-row gap-5 justify-center">
              <Button 
                size="lg" 
                onClick={handleStartPlaying}
                disabled={loading}
                className="w-full sm:w-auto bg-gradient-to-r from-yellow-400 to-yellow-600 text-black hover:from-yellow-500 hover:to-yellow-700"
              >
                {loading ? 'Loading...' : 'Start Playing'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6" asChild>
                <Link href="/learn">Learn More</Link>
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-4 pt-4 justify-center">
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