'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useAccount } from 'wagmi'
import { Header } from '@/components/header'
import { SpinGameUI } from '@/components/game/spin-game-ui'
import { Button } from '@/components/ui/button'
// import { WalletAddressSync } from '@/components/WalletAddressSync'
import { Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

// Define interfaces for the API response
interface GameItem {
  name: string;
  odds: number;
  _id: string;
}

// Define interface for game details
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

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.gameId as string;
  const { data: session, status: sessionStatus } = useSession();
  const { isConnected } = useAccount();
  
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://spinwin.shreyanshkataria.com';

  useEffect(() => {
    // Validate game ID
    if (!gameId || typeof gameId !== 'string' || gameId.length < 1) {
      console.error('Invalid game ID:', gameId);
      setError('Invalid game ID provided');
      setLoading(false);
      return;
    }

    // Redirect if not authenticated or wallet not connected
    if (sessionStatus === 'unauthenticated') {
      router.push('/play');
      return;
    }
    
    // Fetch game details
    const fetchGameDetails = async () => {
      if (!gameId || sessionStatus !== 'authenticated' || !session?.user?.authToken) {
        console.log('Missing required data:', {
          gameId: !!gameId,
          sessionStatus,
          hasAuthToken: !!session?.user?.authToken
        });
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        console.log(`Fetching game details for ID: ${gameId}`);
        const response = await fetch(`${API_BASE_URL}/api/v1/game/${gameId}`, {
          headers: {
            'Authorization': `${session.user.authToken}`,
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });

        if (response.status === 404) {
          throw new Error('Game not found. Please check the URL and try again.');
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Failed to fetch game: ${response.status}`);
        }

        const responseData = await response.json();
        console.log('Game details response:', responseData);
        
        if (responseData.data) {
          setGame(responseData.data);
          console.log('Game details loaded:', responseData.data);
        } else {
          console.error('Unexpected API response structure:', responseData);
          setError(responseData.message || 'Failed to fetch game details');
        }
      } catch (err) {
        console.error('Error fetching game:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while fetching game details');
      } finally {
        setLoading(false);
      }
    };

    fetchGameDetails();
  }, [gameId, sessionStatus, session?.user?.authToken, router]);

  // Guards and loading states
  if (sessionStatus === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <div className="flex justify-center items-center h-[80vh]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <span className="ml-3 text-xl">Loading game...</span>
        </div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl font-bold mb-6 text-red-500">Error Loading Game</h1>
          <p className="mb-8">{error || 'Game not found'}</p>
          <Button asChild>
            <Link href="/play">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Games
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl font-bold mb-6">Connect Your Wallet</h1>
          <p className="mb-8 text-muted-foreground">
            Please connect your wallet to play this game
          </p>
          <div className="mb-6">
            {/* Your wallet connection component would go here */}
          </div>
          <Button variant="outline" asChild>
            <Link href="/play">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Games
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* <WalletAddressSync /> */}
      <Header />
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Button variant="outline" size="sm" asChild className="mb-4">
              <Link href="/play">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Games
              </Link>
            </Button>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
              {game.name || `Game ${game._id ? game._id.slice(-4) : 'Unknown'}`}
            </h1>
            {game.description && (
              <p className="text-muted-foreground mt-2">{game.description}</p>
            )}
            <p className="text-sm text-muted-foreground mt-2">
              {game.items?.length || 0} possible outcomes
            </p>
          </div>
        </div>
        
        {/* Pass game info to the SpinGameUI component */}
        <SpinGameUI 
          gameId={game._id} 
          gameItems={game.items || []} 
          minBet={game.minBet} 
          maxBet={game.maxBet} 
        />
      </div>
    </div>
  );
} 