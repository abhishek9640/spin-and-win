"use client"

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Coins, Wallet } from 'lucide-react'
import { WalletAddressSync } from '@/components/WalletAddressSync'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'sonner'

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
  status?: 'active' | 'inactive' | 'completed'; // Add completed
  createdAt?: string;
  imageUrl?: string;
  items: GameItem[];
  round?: number;
  winners?: Winner[]; // Add winners
}


interface GamesResponse {
  data: {
    records: Game[];
    count: number;
  };
  message: string;
  success?: boolean;
}

export default function PlayPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [isTronLinkInstalled, setIsTronLinkInstalled] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [tronAddress, setTronAddress] = useState<string>("");
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

    // Cleanup
    return () => {
      clearInterval(intervalId);
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
          "ngrok-skip-browser-warning": "true"
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <WalletAddressSync />
      <Header />

      <main className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Available Games
          </h1>

          {isConnected && tronAddress ? (
            <div className="text-sm text-green-500 flex items-center">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Wallet connected: {tronAddress.slice(0, 8)}...{tronAddress.slice(-6)}
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={connectWallet}
              className="flex items-center gap-2"
            >
              <Wallet className="h-4 w-4" />
              {isTronLinkInstalled ? 'Connect TronLink' : 'Install TronLink'}
            </Button>
          )}
        </div>

        {/* Authentication Check */}
        {sessionStatus === 'unauthenticated' && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-4">Please Sign In</h2>
            <p className="mb-6 text-muted-foreground">You need to sign in to view and play games</p>
            <Button asChild>
              <Link href="/api/auth/signin">Sign In</Link>
            </Button>
          </div>
        )}

        {/* Wallet Connection Check - show but don't block the UI */}
        {sessionStatus === 'authenticated' && !isConnected && (
          <Card className="mb-8">
            <CardContent className="flex flex-col md:flex-row justify-between items-center p-6">
              <div>
                <h2 className="text-xl font-semibold mb-2">Connect Your TronLink Wallet</h2>
                <p className="text-muted-foreground">Connect your wallet to enjoy the full experience</p>
              </div>
              <Button
                onClick={connectWallet}
                className="mt-4 md:mt-0"
              >
                {isTronLinkInstalled ? 'Connect TronLink' : 'Install TronLink'}
              </Button>
            </CardContent>
          </Card>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game) => (
              <Card key={game._id} className="overflow-hidden hover:shadow-lg transition-shadow">
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
                <CardContent>
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
                        <div key={index} className="text-sm text-muted-foreground flex items-center justify-between border p-2 rounded">
                          <span className="font-semibold text-primary"><span className="text-muted-foreground">Number :</span> {winner.item?.name}</span>
                          <span className="font-semibold text-primary"><span className="text-muted-foreground">Amount Won:</span> {winner.amountWon} USDT TRC 20</span>
                        </div>
                      ))}
                    </div>
                  ) : game.round !== undefined ? (
                    <>
                      {/* <div className="text-sm text-muted-foreground mt-2">You are qualified for</div> */}
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
                    <div className="text-sm text-muted-foreground w-full text-center py-2">
                      Game Completed
                    </div>
                  )}
                </CardFooter>

              </Card>
            ))}
          </div>
        )}

        {/* No Games Available */}
        {!loading && !error && games.length === 0 && sessionStatus === 'authenticated' && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-4">No Games Available</h2>
            <p className="mb-6 text-muted-foreground">There are currently no games available to play</p>
          </div>
        )}
      </main>
    </div>
  )
}

