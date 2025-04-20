"use client"

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Coins, Wallet, Shield, Trophy, CheckCircle2, Lock } from 'lucide-react'
import { WalletAddressSync } from '@/components/WalletAddressSync'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'

// Define TronLink types
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

// Define interfaces for the API response
interface GameItem {
  name: string;
  odds: number;
  _id: string;
}

interface Winner {
  item: {
    name: string;
  };
  amountWon: number;
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
  winners?: Winner[];
}

interface GamesResponse {
  data: {
    records: Game[];
    count: number;
  };
  message: string;
  success?: boolean;
}

// Testimonials data
const testimonials = [
  {
    id: 1,
    name: "Sarah J.",
    comment: "Won 500 USDT on my first spin! Withdrawal was instant to my TronLink wallet.",
    avatar: "/avatars/avatar-1.png"
  },
  {
    id: 2,
    name: "Michael T.",
    comment: "The fairest crypto game I've played. Completely transparent and trustworthy.",
    avatar: "/avatars/avatar-2.png"
  },
  {
    id: 3,
    name: "Alex K.",
    comment: "Qualified for Round 2 and doubled my winnings! The games are truly addictive.",
    avatar: "/avatars/avatar-3.png"
  }
];

export default function PlayPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [isTronLinkInstalled, setIsTronLinkInstalled] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [tronAddress, setTronAddress] = useState<string>("");
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  // Check TronLink connection
  useEffect(() => {
    const checkTronLink = async () => {
      if (typeof window !== 'undefined') {
        // More robust TronLink detection
        const hasTronLink = !!window.tronWeb || !!window.tronLink;
        console.log('TronLink detection:', {
          hasTronLink,
          tronWeb: !!window.tronWeb,
          tronLink: !!window.tronLink
        });

        setIsTronLinkInstalled(hasTronLink);

        if (window.tronWeb) {
          try {
            // Check if TronWeb is ready (explicitly convert to boolean)
            const tronWebReady = !!window.tronWeb.ready;
            console.log('TronWeb state:', {
              ready: tronWebReady,
              hasAddress: !!window.tronWeb.defaultAddress?.base58
            });

            // If we have a valid address, consider it connected
            if (window.tronWeb.defaultAddress?.base58) {
              const currentAddress = window.tronWeb.defaultAddress.base58;
              setIsConnected(true);
              setTronAddress(currentAddress);
              console.log('Connected TronLink address:', currentAddress);
            }
          } catch (error) {
            console.error("Error checking TronLink connection:", error);
          }
        }
      }
    };

    // Check on initial load
    checkTronLink();

    // Setup recurring checks in case TronLink loads after our component
    const intervalId = setInterval(checkTronLink, 1000);

    // Add event listener for account changes
    const handleMessageEvent = (e: MessageEvent) => {
      if (e.data?.message?.action === "accountsChanged") {
        checkTronLink();
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('message', handleMessageEvent);
    }

    // Testimonial rotation
    const testimonialInterval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    // Cleanup
    return () => {
      clearInterval(intervalId);
      clearInterval(testimonialInterval);
      if (typeof window !== 'undefined') {
        window.removeEventListener('message', handleMessageEvent);
      }
    };
  }, []);

  // Connect wallet function
  const connectWallet = async () => {
    try {
      if (!isTronLinkInstalled) {
        window.open('https://www.tronlink.org/', '_blank');
        toast('Please install TronLink wallet to continue');
        return;
      }

      if (window.tronWeb && window.tronLink) {
        try {
          // Request account access
          await window.tronLink.request({ method: 'tron_requestAccounts' });

          // Check if connected after request
          const tronWebState = window.tronWeb.ready;
          if (tronWebState) {
            const currentAddress = window.tronWeb.defaultAddress.base58;
            setIsConnected(true);
            setTronAddress(currentAddress);
            toast.success(`Wallet connected: ${currentAddress.slice(0, 8)}...${currentAddress.slice(-6)}`);
          }
        } catch (error) {
          console.error("Error connecting to TronLink:", error);
          toast.error('Failed to connect wallet. Please try again.');
        }
      }
    } catch (error) {
      console.error("TronLink connection error:", error);
      toast.error('Failed to connect wallet. Please try again.');
    }
  };

  // Fetch games from the API
  const fetchGames = async () => {
    if (sessionStatus !== 'authenticated' || !session?.user?.authToken) {
      setLoading(false);
      setError('You must be logged in to view games');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('Fetching games...');
      const response = await fetch(`${API_BASE_URL}/api/v1/game/fetch-games`, {
        headers: {
          'Authorization': `${session.user.authToken}`,

        }
      });
      console.log('Response:', response);

      if (!response.ok) {
        throw new Error(`Failed to fetch games: ${response.status}`);
      }

      const responseData: GamesResponse = await response.json();
      console.log('Games response:', responseData);

      // Check if the response has the expected structure
      if (responseData.data && responseData.data.records) {
        setGames(responseData.data.records);
        console.log('Games loaded:', responseData.data.records.length);
      } else {
        console.error('Unexpected API response structure:', responseData);
        setError('Unexpected API response format');
      }
    } catch (err) {
      console.error('Error fetching games:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while fetching games');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sessionStatus === 'authenticated') {
      fetchGames();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionStatus, session?.user?.authToken]);

  // Game card animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 text-foreground">
      <WalletAddressSync />
      <Header />

      {/* Hero Banner */}
      <div className="relative bg-gradient-to-r from-purple-900 via-indigo-800 to-blue-900 py-16">
        <div className="absolute inset-0 opacity-20 bg-[url('/patterns/noise.png')] mix-blend-overlay"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-5xl font-extrabold text-white mb-4 drop-shadow-md"
            >
              Spin &amp; Win with Crypto
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-white/90 mb-8"
            >
              Play fair, transparent games with instant USDT rewards on the TRON network
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-wrap justify-center gap-4"
            >
              {sessionStatus !== 'authenticated' ? (
                <Button size="lg" asChild className="bg-white text-indigo-800 hover:bg-white/90">
                  <Link href="/api/auth/signin">Sign In to Play</Link>
                </Button>
              ) : !isConnected ? (
                <Button 
                  size="lg" 
                  onClick={connectWallet}
                  className="bg-white text-indigo-800 hover:bg-white/90 flex items-center gap-2"
                >
                  <Wallet className="h-5 w-5" />
                  Connect Wallet
                </Button>
              ) : (
                <Button size="lg" asChild className="bg-white text-indigo-800 hover:bg-white/90">
                  <a href="#games">Play Now</a>
                </Button>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="bg-black/5 backdrop-blur-sm py-8 border-y border-primary/10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center p-4">
              <Shield className="h-10 w-10 text-primary mb-3" />
              <h3 className="font-semibold text-lg mb-1">100% Secure</h3>
              <p className="text-sm text-muted-foreground">All transactions verified on TRON blockchain</p>
            </div>
            <div className="flex flex-col items-center p-4">
              <Lock className="h-10 w-10 text-primary mb-3" />
              <h3 className="font-semibold text-lg mb-1">Fair Games</h3>
              <p className="text-sm text-muted-foreground">Provably fair algorithm with verified results</p>
            </div>
            <div className="flex flex-col items-center p-4">
              <CheckCircle2 className="h-10 w-10 text-primary mb-3" />
              <h3 className="font-semibold text-lg mb-1">Instant Payouts</h3>
              <p className="text-sm text-muted-foreground">Winnings sent directly to your TronLink wallet</p>
            </div>
            <div className="flex flex-col items-center p-4">
              <Trophy className="h-10 w-10 text-primary mb-3" />
              <h3 className="font-semibold text-lg mb-1">VIP Rewards</h3>
              <p className="text-sm text-muted-foreground">Qualify for exclusive Round 2 games with higher prizes</p>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-12">
        {/* Testimonials */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">What Our Players Say</h2>
          <div className="relative overflow-hidden py-4 pb-28 mb-8">
            <div className="flex justify-center">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.id}
                  initial={{ opacity: 0 }}
                  animate={{ 
                    opacity: activeTestimonial === index ? 1 : 0,
                    x: activeTestimonial === index ? 0 : (activeTestimonial > index ? -100 : 100)
                  }}
                  transition={{ duration: 0.5 }}
                  className={`absolute max-w-lg bg-white/5 backdrop-blur-md rounded-lg p-6 border border-primary/10 shadow-lg ${activeTestimonial === index ? 'block' : 'hidden'}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-xl font-bold text-primary">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <p className="italic text-muted-foreground mb-2">&ldquo;{testimonial.comment}&rdquo;</p>
                      <div className="font-semibold">{testimonial.name}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="flex justify-center gap-2 mt-4">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full ${activeTestimonial === index ? 'bg-primary' : 'bg-primary/30'}`}
                  onClick={() => setActiveTestimonial(index)}
                />
              ))}
            </div>
          </div>
        </div>

        <div id="games" className="scroll-mt-16">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Available Games
            </h1>

            {isConnected && tronAddress ? (
              <div className="text-sm bg-green-100 text-green-700 rounded-full px-4 py-2 flex items-center">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Wallet connected: {tronAddress.slice(0, 8)}...{tronAddress.slice(-6)}
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={connectWallet}
                className="flex items-center gap-2 border-primary"
              >
                <Wallet className="h-4 w-4" />
                {isTronLinkInstalled ? 'Connect TronLink' : 'Install TronLink'}
              </Button>
            )}
          </div>

          {/* Round 2 Qualification Banner */}
          {games.some(game => game.round === 2 && game.status !== 'completed') && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8 p-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg shadow-lg text-white"
            >
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center">
                  <div className="mr-4 bg-white bg-opacity-20 p-3 rounded-full">
                    <Trophy className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-1">Congratulations!</h2>
                    <p className="text-white text-opacity-90 max-w-xl">You&apos;ve qualified for Round 2 exclusive games with higher stakes and bigger rewards. These special games are only available to our most valued players!</p>
                  </div>
                </div>
                <div className="hidden md:block">
                  <Badge variant="outline" className="bg-white/20 hover:bg-white/30 text-white border-white/50 text-sm px-4 py-2">
                    VIP PLAYER STATUS
                  </Badge>
                </div>
              </div>
            </motion.div>
          )}

          {/* Authentication Check */}
          {sessionStatus === 'unauthenticated' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center py-12 bg-primary/5 rounded-xl border border-primary/10"
            >
              <h2 className="text-2xl font-semibold mb-4">Please Sign In</h2>
              <p className="mb-6 text-muted-foreground">You need to sign in to view and play games</p>
              <Button asChild size="lg" className="px-8">
                <Link href="/api/auth/signin">Sign In</Link>
              </Button>
            </motion.div>
          )}

          {/* Wallet Connection Check - show but don't block the UI */}
          {sessionStatus === 'authenticated' && !isConnected && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="mb-8 border-dashed border-2 border-primary/30 bg-primary/5">
                <CardContent className="flex flex-col md:flex-row justify-between items-center p-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-2">Connect Your TronLink Wallet</h2>
                    <p className="text-muted-foreground">Connect your wallet to enjoy the full experience and start winning USDT</p>
                  </div>
                  <Button
                    onClick={connectWallet}
                    className="mt-4 md:mt-0"
                    size="lg"
                  >
                    {isTronLinkInstalled ? 'Connect TronLink' : 'Install TronLink'}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <span className="ml-3 text-lg">Loading games...</span>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold mb-4 text-red-500">Error</h2>
              <p className="mb-6">{error}</p>
              <Button onClick={fetchGames}>Try Again</Button>
            </div>
          )}

          {/* Games List */}
          {!loading && !error && games.length > 0 && (
            <>
              {/* Round 2 Qualified Games Section */}
              {games.some(game => game.round === 2) && (
                <div className="mb-10">
                  <h2 className="text-2xl font-bold mb-4 flex items-center">
                    <Badge variant="default" className="mr-3 bg-gradient-to-r from-purple-600 to-pink-600">
                      ROUND 2 EXCLUSIVE
                    </Badge>
                    Your Qualified Games
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {games
                      .filter(game => game.round === 2)
                      .map((game, i) => (
                        <motion.div
                          key={game._id}
                          variants={cardVariants}
                          initial="hidden"
                          animate="visible"
                          transition={{ delay: i * 0.1 }}
                        >
                          <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2 border-purple-500 transform hover:-translate-y-1 h-full flex flex-col">
                            {game.imageUrl && (
                              <div className="aspect-video w-full overflow-hidden relative">
                                <div className="absolute top-2 right-2 z-10">
                                  <Badge className="bg-purple-600">VIP GAME</Badge>
                                </div>
                                <Image
                                  src={game.imageUrl}
                                  alt={game.name || 'Game'}
                                  width={400}
                                  height={225}
                                  className="w-full h-full object-cover transition-transform hover:scale-105"
                                />
                              </div>
                            )}
                            <CardHeader>
                              <CardTitle>{game.name || `Game ${game._id.slice(-4)}`}</CardTitle>
                              <CardDescription>
                                {game.description || `Spin and win with ${game.items?.length || 0} possible outcomes!`}
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow">
                              <div className="flex items-center gap-2 text-sm">
                                <Coins className="h-4 w-4 text-primary" />
                                <span>Min Bet: {game.minBet || 2.00} USDT TRC 20</span>
                              </div>
                              <div className="mt-2 text-sm text-muted-foreground">
                                {game.items?.length} possible outcomes
                              </div>
                              {game.status === 'completed' && game.winners && game.winners.length > 0 ? (
                                <div className="mt-4 space-y-2">
                                  <div className="text-sm font-medium text-green-600">Winners</div>
                                  {game.winners.map((winner, index) => (
                                    <div key={index} className="text-sm text-muted-foreground flex items-center justify-between border p-2 rounded bg-green-50">
                                      <span className="font-semibold text-primary"><span className="text-muted-foreground">Number:</span> {winner.item?.name}</span>
                                      <span className="font-semibold text-green-600"><span className="text-muted-foreground">Won:</span> {winner.amountWon} USDT</span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="mt-4">
                                  <span className="inline-block bg-purple-100 text-purple-600 text-xs font-semibold px-2 py-1 rounded">
                                    Round 2 Qualified
                                  </span>
                                </div>
                              )}
                            </CardContent>

                            <CardFooter>
                              {game.status !== 'completed' ? (
                                <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700" asChild>
                                  <Link href={`/play/${game._id}`}>Play Now</Link>
                                </Button>
                              ) : (
                                <div className="text-sm text-muted-foreground w-full text-center py-2 bg-gray-100 rounded">
                                  Game Completed
                                </div>
                              )}
                            </CardFooter>
                          </Card>
                        </motion.div>
                      ))}
                  </div>
                </div>
              )}

              {/* Other Games Section */}
              <div>
                <h2 className="text-2xl font-bold mb-4">All Games</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {games
                    .filter(game => game.round !== 2)
                    .map((game, i) => (
                      <motion.div
                        key={game._id}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: i * 0.1 }}
                      >
                        <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                          {game.imageUrl && (
                            <div className="aspect-video w-full overflow-hidden">
                              <Image
                                src={game.imageUrl}
                                alt={game.name || 'Game'}
                                width={400}
                                height={225}
                                className="w-full h-full object-cover transition-transform hover:scale-105"
                              />
                            </div>
                          )}
                          <CardHeader>
                            <CardTitle>{game.name || `Game ${game._id.slice(-4)}`}</CardTitle>
                            <CardDescription>
                              {game.description || `Spin and win with ${game.items?.length || 0} possible outcomes!`}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="flex-grow">
                            <div className="flex items-center gap-2 text-sm">
                              <Coins className="h-4 w-4 text-primary" />
                              <span>Min Bet: {game.minBet || 2.00} USDT TRC 20</span>
                            </div>
                            <div className="mt-2 text-sm text-muted-foreground">
                              {game.items?.length} possible outcomes
                            </div>
                            {/* Conditional Display for Round or Winners */}
                            {game.status === 'completed' && game.winners && game.winners.length > 0 ? (
                              <div className="mt-4 space-y-2">
                                <div className="text-sm font-medium text-green-600">Winners</div>
                                {game.winners.map((winner, index) => (
                                  <div key={index} className="text-sm text-muted-foreground flex items-center justify-between border p-2 rounded bg-green-50">
                                    <span className="font-semibold text-primary"><span className="text-muted-foreground">Number:</span> {winner.item?.name}</span>
                                    <span className="font-semibold text-green-600"><span className="text-muted-foreground">Won:</span> {winner.amountWon} USDT</span>
                                  </div>
                                ))}
                              </div>
                            ) : game.round !== undefined && game.round !== 2 ? (
                              <>
                                <span className="inline-block bg-blue-100 text-blue-600 text-xs font-semibold px-2 py-1 rounded mt-1">
                                  Round {game.round}
                                </span>
                              </>
                            ) : null}
                          </CardContent>

                          <CardFooter>
                            {game.status !== 'completed' ? (
                              <Button className="w-full" asChild>
                                <Link href={`/play/${game._id}`}>Play Now</Link>
                              </Button>
                            ) : (
                              <div className="text-sm text-muted-foreground w-full text-center py-2 bg-gray-100 rounded">
                                Game Completed
                              </div>
                            )}
                          </CardFooter>
                        </Card>
                      </motion.div>
                    ))}
                </div>
              </div>
            </>
          )}

          {/* No Games Available */}
          {!loading && !error && games.length === 0 && sessionStatus === 'authenticated' && (
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold mb-4">No Games Available</h2>
              <p className="mb-6 text-muted-foreground">There are currently no games available to play</p>
            </div>
          )}
        </div>
      </main>

      {/* Trust Section */}
      <section className="bg-black/5 py-12 border-t border-primary/10">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Play with Confidence</h2>
            <p className="text-lg mb-8 text-muted-foreground">
              Our platform uses blockchain technology to ensure complete transparency and fairness in every game. 
              All transactions are secured by TRON smart contracts, and results can be verified on-chain.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <Badge variant="outline" className="px-4 py-2 text-sm">SSL Secured</Badge>
              <Badge variant="outline" className="px-4 py-2 text-sm">Provably Fair</Badge>
              <Badge variant="outline" className="px-4 py-2 text-sm">Blockchain Verified</Badge>
              <Badge variant="outline" className="px-4 py-2 text-sm">Instant Payouts</Badge>
            </div>
            
            <div className="mt-8">
              <p className="text-sm text-muted-foreground">
                © 2025 Spin &amp; Win. All rights reserved. Licensed and regulated gaming platform.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

