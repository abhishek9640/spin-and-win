'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useAccount } from 'wagmi'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Loader2, ArrowLeft } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
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
  const [selectedItem, setSelectedItem] = useState<GameItem | null>(null);
  const [betAmount, setBetAmount] = useState<string>('');
  const [isPlacingBet, setIsPlacingBet] = useState(false);

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
        
        // Check if we have data and records array
        if (responseData.data?.records && responseData.data.records.length > 0) {
          // Access the first record from the records array
          const gameData = responseData.data.records[0];
          console.log('Game details loaded:', gameData);
          setGame(gameData);
        } else {
          console.error('No game records found in response:', responseData);
          setError('Game not found or no data available');
        }
      } catch (err) {
        console.error('Error fetching game:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while fetching game details');
      } finally {
        setLoading(false);
      }
    };

    fetchGameDetails();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId, sessionStatus, session?.user?.authToken, router]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only valid number format with up to 2 decimal places
    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
      setBetAmount(value);
    }
  };

  const handlePlaceBet = async () => {
    if (!game || !selectedItem || !betAmount || !session?.user?.authToken) {
      toast('Please select an item and enter a valid amount');
      return;
    }

    const amount = parseFloat(betAmount);
    if (isNaN(amount) || amount <= 0) {
      toast('Please enter a valid amount');
      return;
    }

    if (game.minBet && amount < game.minBet) {
      toast(`Minimum bet amount is ${game.minBet}`);
      return;
    }

    if (game.maxBet && amount > game.maxBet) {
      toast(`Maximum bet amount is ${game.maxBet}`);
      return;
    }

    setIsPlacingBet(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/user/bet`, {
        method: 'POST',
        headers: {
          'Authorization': `${session.user.authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          game_id: game._id,
          amount: amount.toFixed(2), // Ensure 2 decimal places
          item: selectedItem
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to place bet');
      }

      const data = await response.json();
      console.log('Bet response:', data);
      
      if (data.success && data.trans_id) {
        // First show success message with transaction ID
        toast.success(`Bet placed successfully! Transaction ID: ${data.trans_id}`);
        console.log('Transaction ID:', data.trans_id);

        // Make API call to set transaction as done
        try {
          const setTransResponse = await fetch(`${API_BASE_URL}/api/v1/user/set-trans-done`, {
            method: 'POST',
            headers: {
              'Authorization': `${session.user.authToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              trans_id: data.trans_id
            })
          });

          if (!setTransResponse.ok) {
            console.error('Failed to set transaction as done');
            return;
          }

          const setTransData = await setTransResponse.json();
          console.log('Transaction status updated:', setTransData);
        } catch (err) {
          console.error('Error setting transaction as done:', err);
        }
      } else {
        toast.success('Bet placed successfully!');
      }
      
      // Reset form
      setBetAmount('');
      setSelectedItem(null);
    } catch (err) {
      console.error('Error placing bet:', err);
      toast(err instanceof Error ? err.message : 'Failed to place bet');
    } finally {
      setIsPlacingBet(false);
    }
  };

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
        
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="amount">Bet Amount</Label>
                <Input
                  id="amount"
                  type="text"
                  value={betAmount}
                  onChange={handleAmountChange}
                  placeholder={`Enter amount (${game.minBet || '0.01'} - ${game.maxBet || 'unlimited'})`}
                  className="w-full"
                />
                {game.minBet && game.maxBet && (
                  <p className="text-sm text-muted-foreground">
                    Min: {game.minBet} | Max: {game.maxBet}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Select Item</Label>
                <p className="text-sm text-muted-foreground">
                  Available items: {(game.items || []).length} | 
                  Selected: {selectedItem ? `${selectedItem.name} (odds: ${selectedItem.odds})` : 'None'}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {(game.items || []).map((item) => (
                    <Button
                      key={item._id}
                      variant={selectedItem?._id === item._id ? "default" : "outline"}
                      onClick={() => {
                        console.log('Item selected:', item);
                        setSelectedItem(item);
                      }}
                      className="w-full"
                      disabled={isPlacingBet}
                    >
                      {item.name} (x{item.odds})
                    </Button>
                  ))}
                </div>
              </div>

              <Button
                className="w-full"
                onClick={handlePlaceBet}
                disabled={isPlacingBet || !selectedItem || !betAmount}
              >
                {isPlacingBet ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Placing Bet...
                  </>
                ) : (
                  'Place Bet'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 