"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"

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

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://spinwin.shreyanshkataria.com';

  const [games, setGames] = useState<Game[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [isSpinning, setIsSpinning] = useState(false)
  const [winningItem, setWinningItem] = useState<GameItem | null>(null)
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)

  const fetchGames = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const token = session?.user?.authToken

      if (!token) {
        if (status === 'loading') return;
        throw new Error("Authentication token not found. Please sign in again.")
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/admin/game-list?limit=10&page=1&status`, {
        headers: {
          "Authorization": `${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.status === 401 || response.status === 403) {
        toast({
          title: "Authentication Error",
          description: "Your session has expired. Please sign in again.",
          variant: "destructive",
        })
        router.push('/auth/signin?callbackUrl=/admin/games')
        return
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch games: ${response.status}`)
      }

      const responseData: GamesResponse = await response.json()

      if (responseData.data && responseData.data.records) {
        setGames(responseData.data.records)
      } else {
        setError('Unexpected API response format')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to load games"
      setError(errorMessage)

      if (retryCount < 2 && status === 'authenticated') {
        setRetryCount(prev => prev + 1)
        setTimeout(() => fetchGames(), 1000)
      }
    } finally {
      if (status !== 'loading') setIsLoading(false)
    }
  }, [session, status, router, retryCount, toast, API_BASE_URL])

  useEffect(() => {
    if (status === 'authenticated') fetchGames()
  }, [status, fetchGames])

  const handleSpinWheel = async (gameId: string) => {
    if (!session?.user?.authToken) return
    setIsSpinning(true)

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/spin-wheel`, {
        method: 'POST',
        headers: {
          'Authorization': `${session.user.authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ game_id: gameId })
      })

      if (!response.ok) throw new Error('Failed to spin the wheel')

      const data = await response.json()
      if (data.success && data.data?.winningItem) {
        setWinningItem(data.data.winningItem)
        toast({
          title: "Success",
          description: `Wheel spun successfully! Winning number: ${data.data.winningItem.name}`,
        })
        fetchGames()
      } else {
        throw new Error('Invalid response from server')
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to spin the wheel",
        variant: "destructive",
      })
    } finally {
      setIsSpinning(false)
    }
  }

  const handleSettlePayment = async (gameId: string) => {
    if (!session?.user?.authToken) return

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/pay-to-winners`, {
        method: 'POST',
        headers: {
          'Authorization': `${session.user.authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ game_id: gameId })
      })

      if (!response.ok) throw new Error('Failed to settle payment')

      const data = await response.json()
      if (data.success) {
        toast({
          title: "Payment Settled",
          description: "Winners have been paid successfully.",
        })
        fetchGames()
      } else {
        throw new Error(data.message || 'Failed to settle payment')
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Payment failed",
        variant: "destructive",
      })
    }
  }

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
        <Button onClick={() => router.push("/admin/games/create")}>Create New Game</Button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Error</p>
          <p>{error}</p>
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
                  game.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {game.status || 'unknown'}
                </span>
              </div>

              <p className="text-gray-600 mb-4">{game.description || 'No description provided'}</p>

              <div className="mb-4">
                <h4 className="font-medium mb-2">Wheel Numbers:</h4>
                <div className="flex flex-wrap gap-2">
                  {game.items.map((item, index) => (
                    <span key={index} className="bg-gray-100 text-black px-2 py-1 rounded">
                      {item.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="text-sm text-gray-500 mb-4">
                Created: {game.createdAt ? new Date(game.createdAt).toLocaleDateString() : 'Unknown date'}
              </div>

              <div className="flex justify-end space-x-2">
                {game.status === "completed" ? (
                  <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="destructive">Settle Payment</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Confirm Payment Settlement</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to settle payment for {game.name || `Game ${game._id.slice(-4)}`}? This will send payouts to the winners.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end space-x-2 mt-4">
                      <Button variant="outline">Cancel</Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleSettlePayment(game._id)}
                      >
                        Confirm
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                
                ) : (
                  <Dialog open={!!selectedGame} onOpenChange={(open) => !open && setSelectedGame(null)}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        onClick={() => setSelectedGame(game)}
                      >
                        Spin Wheel
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Spin the Wheel</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to spin the wheel for {selectedGame?.name || `Game ${selectedGame?._id.slice(-4)}`}?
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex flex-col items-center space-y-4">
                        {!winningItem ? (
                          <div className="flex justify-end space-x-2 mt-4 w-full">
                            <Button variant="outline" onClick={() => setSelectedGame(null)}>Cancel</Button>
                            <Button
                              onClick={() => handleSpinWheel(selectedGame?._id || '')}
                              disabled={isSpinning}
                            >
                              {isSpinning ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Spinning...
                                </>
                              ) : 'Spin Wheel'}
                            </Button>
                          </div>
                        ) : (
                          <>
                            <div className="w-full p-4 bg-green-50 rounded-lg text-center">
                              <h3 className="text-xl font-bold text-green-700 mb-2">Winning Number!</h3>
                              <div className="text-4xl font-bold text-green-800">{winningItem.name}</div>
                              <p className="text-sm text-green-600 mt-1">Odds: x{winningItem.odds}</p>
                            </div>
                            <div className="flex justify-end space-x-2 mt-4 w-full">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setWinningItem(null)
                                  handleSpinWheel(selectedGame?._id || '')
                                }}
                                disabled={isSpinning}
                              >
                                {isSpinning ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Spinning...
                                  </>
                                ) : 'Spin Again'}
                              </Button>
                              <Button
                                variant="default"
                                onClick={() => {
                                  setSelectedGame(null)
                                  setWinningItem(null)
                                }}
                              >
                                Close
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
