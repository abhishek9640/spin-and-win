"use client"

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useAccount } from 'wagmi'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Coins } from 'lucide-react'
import { WalletAddressSync } from '@/components/WalletAddressSync'
import Link from 'next/link'

// Define interfaces for the API response
interface GameItem {
  name: string;
  odds: number;
  _id: string;
}

interface Game {
  _id: string;
  name?: string;
  description?: string;
  minBet?: number;
  maxBet?: number;
  status?: 'active' | 'inactive';
  createdAt?: string;
  imageUrl?: string;
  items: GameItem[];
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
  const { isConnected } = useAccount();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://spinwin.shreyanshkataria.com';

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
  }, [sessionStatus, session?.user?.authToken]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <WalletAddressSync />
      <Header />

      <main className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
          Available Games
        </h1>

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

        {/* Wallet Connection Check */}
        {sessionStatus === 'authenticated' && !isConnected && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-4">Connect Your Wallet</h2>
            <p className="mb-6 text-muted-foreground">Please connect your wallet to start playing</p>
          </div>
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
                    <img 
                      src={game.imageUrl} 
                      alt={game.name || 'Game'} 
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
                    <span>Min Bet: {game.minBet || 0.001} ETH</span>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    {game.items?.length} possible outcomes
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" asChild>
                    <Link href={`/play/${game._id}`}>Play Now</Link>
                  </Button>
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

