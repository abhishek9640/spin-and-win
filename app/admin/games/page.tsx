"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"
import { useToast } from "@/components/ui/use-toast"

// Define interfaces for the API response
interface GameItem {
  name: string;
  odds: number;
  _id: string;
}

interface Game {
  _id: string;
  id?: string;
  name?: string;
  description?: string;
  minBet?: number;
  maxBet?: number;
  status?: string;
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

export default function GamesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/auth/signin?callbackUrl=/admin/games')
    },
  })
  const [games, setGames] = useState<Game[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  // Create a memoized fetchGames function that depends on the session
  const fetchGames = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://spinwin.shreyanshkataria.com';
      const token = session?.user?.authToken
      
      // Log token status (without exposing the actual token)
      console.log('Auth token status:', token ? 'Available' : 'Missing', 'Session status:', status);
      
      if (!token) {
        // Don't throw an error if the session is still loading
        if (status === 'loading') {
          console.log('Session still loading, waiting to fetch games...');
          return;
        }
        throw new Error("Authentication token not found. Please sign in again.")
      }

      console.log('Fetching games for admin...');
      const response = await fetch(`${API_BASE_URL}/api/v1/game/fetch-games`, {
        headers: {
          "Authorization": `${token}`,
          "Content-Type": "application/json",
          "Cache-Control": "no-cache"
        },
      })

      if (response.status === 401 || response.status === 403) {
        // Token might be expired or invalid
        console.error('Authentication error:', response.status);
        toast({
          title: "Authentication Error",
          description: "Your session has expired. Please sign in again.",
          variant: "destructive",
        });
        // Redirect to login
        router.push('/auth/signin?callbackUrl=/admin/games');
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch games: ${response.status}`)
      }

      const responseData: GamesResponse = await response.json()
      console.log('Admin games response received');
      
      // Check if the response has the expected structure
      if (responseData.data && responseData.data.records) {
        setGames(responseData.data.records);
        console.log('Admin games loaded:', responseData.data.records.length);
      } else {
        console.error('Unexpected API response structure:', responseData);
        setError('Unexpected API response format');
      }
    } catch (error) {
      console.error("Error fetching games:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to load games";
      setError(errorMessage)
      
      // If there was an error that might be due to token issues, try again
      if (retryCount < 2 && status === 'authenticated') {
        console.log(`Retrying fetch (attempt ${retryCount + 1})...`);
        setRetryCount(prev => prev + 1);
        // Wait a moment before retrying
        setTimeout(() => {
          fetchGames();
        }, 1000);
      }
    } finally {
      if (status !== 'loading') {
        setIsLoading(false)
      }
    }
  }, [session, status, router, retryCount, toast])

  // Only fetch games when the session is authenticated
  useEffect(() => {
    if (status === 'authenticated') {
      fetchGames();
    }
  }, [status, fetchGames]);

  // Manual refresh handler
  const handleRefresh = () => {
    setRetryCount(0); // Reset retry count
    fetchGames();
  };

  // If session is loading, show loading state
  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        <p className="ml-2">Loading session...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Games Management</h1>
        <div className="space-x-2">
          <Button onClick={handleRefresh} variant="outline" disabled={isLoading}>
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button onClick={() => router.push("/admin/games/create")}>Create New Game</Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex justify-between items-center">
          <div>
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            Try Again
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          <p className="ml-2">Loading games...</p>
        </div>
      ) : games.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-gray-500">No games found. Create your first game to get started!</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <Card key={game._id} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold">{game.name || `Game ${game._id.slice(-4)}`}</h3>
                <span className={`px-2 py-1 rounded text-sm ${
                  game.status === 'active' ? 'bg-green-100 text-green-800' :
                  game.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {game.status || 'unknown'}
                </span>
              </div>
              
              <p className="text-gray-600 mb-4">{game.description || 'No description provided'}</p>
              
              <div className="mb-4">
  <h4 className="font-medium mb-2">Wheel Numbers:</h4>
  <div className="flex flex-wrap gap-2">
    {game.items && game.items.map((item, index) => (
      <span key={index} className="bg-gray-100 text-black px-2 py-1 rounded">
        {item.name} (x{item.odds})
      </span>
    ))}
  </div>
</div>


              <div className="text-sm text-gray-500 mb-4">
                Created: {game.createdAt ? new Date(game.createdAt).toLocaleDateString() : 'Unknown date'}
              </div>

              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => router.push(`/admin/games/${game._id}`)}
                >
                  View Details
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => router.push(`/admin/games/${game._id}/edit`)}
                >
                  Edit
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
