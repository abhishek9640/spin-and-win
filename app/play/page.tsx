"use client"

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Coins, Sparkles, Wallet, Shield, Trophy, CheckCircle2, Lock } from 'lucide-react'
import { WalletAddressSync } from '@/components/WalletAddressSync'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"

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
  status?: 'active' | 'inactive' | 'completed' | 'pending';
  createdAt?: string;
  imageUrl?: string;
  items: GameItem[];
  round?: number;
  winners?: Winner[];
  bets?: Bet[];
  winning_items?: GameItem[];
  userBets?: Bet[];
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
// const testimonials = [
//   {
//     id: 1,
//     name: "Sarah J.",
//     comment: "Won 500 USDT on my first spin! Withdrawal was instant to my TronLink wallet.",
//     avatar: "/avatars/avatar-1.png"
//   },
//   {
//     id: 2,
//     name: "Michael T.",
//     comment: "The fairest crypto game I've played. Completely transparent and trustworthy.",
//     avatar: "/avatars/avatar-2.png"
//   },
//   {
//     id: 3,
//     name: "Alex K.",
//     comment: "Qualified for Round 2 and doubled my winnings! The games are truly addictive.",
//     avatar: "/avatars/avatar-3.png"
//   }
// ];

export default function PlayPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [isTronLinkInstalled, setIsTronLinkInstalled] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [tronAddress, setTronAddress] = useState<string>("");
  const [addressStored, setAddressStored] = useState<boolean>(false);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [round2Modal, setRound2Modal] = useState(false);
  const [selectedItem, setSelectedItem] = useState("");
  const [currentGame, setCurrentGame] = useState<Game | null>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  // Check TronLink connection
  useEffect(() => {
    const checkTronLink = async () => {
      if (typeof window !== 'undefined') {
        // Check for stored wallet address first
        const storedAddress = localStorage.getItem('tronlink_wallet_address');
        if (storedAddress) {
          setIsConnected(true);
          setTronAddress(storedAddress);
          console.log('Using stored TronLink address:', storedAddress);
          
          // Post the wallet address to the API if user is authenticated and not already stored
          if (sessionStatus === 'authenticated' && session?.user?.authToken && !addressStored) {
            try {
              const response = await fetch(`${API_BASE_URL}/api/v1/user/set-crypto-id`, {
                method: 'POST',
                headers: {
                  'Authorization': `${session.user.authToken}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  walletAddress: storedAddress
                })
              });
              
              if (response.ok) {
                console.log('Wallet address successfully stored in database');
                setAddressStored(true); // Mark as stored to prevent further API calls
              } else {
                console.error('Failed to store wallet address in database');
              }
            } catch (error) {
              console.error('Error storing wallet address:', error);
            }
          }
          
          return; // Skip further checks if we have a stored address
        }

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
              // Store address in localStorage
              localStorage.setItem('tronlink_wallet_address', currentAddress);
              console.log('Connected TronLink address:', currentAddress);
              
              // Post the wallet address to the API if user is authenticated and not already stored
              if (sessionStatus === 'authenticated' && session?.user?.authToken && !addressStored) {
                try {
                  const response = await fetch(`${API_BASE_URL}/api/v1/user/set-crypto-id`, {
                    method: 'POST',
                    headers: {
                      'Authorization': `${session.user.authToken}`,
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                      walletAddress: currentAddress
                    })
                  });
                  
                  if (response.ok) {
                    console.log('Wallet address successfully stored in database');
                    setAddressStored(true); // Mark as stored to prevent further API calls
                  } else {
                    console.error('Failed to store wallet address in database');
                  }
                } catch (error) {
                  console.error('Error storing wallet address:', error);
                }
              }
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
  }, [API_BASE_URL, sessionStatus, session?.user?.authToken, addressStored]);

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
            // Store address in localStorage
            localStorage.setItem('tronlink_wallet_address', currentAddress);
            toast.success(`Wallet connected: ${currentAddress.slice(0, 8)}...${currentAddress.slice(-6)}`);
            
            // Post the wallet address to the API if not already stored
            if (session?.user?.authToken && !addressStored) {
              try {
                const response = await fetch(`${API_BASE_URL}/api/v1/user/set-crypto-id`, {
                  method: 'POST',
                  headers: {
                    'Authorization': `${session.user.authToken}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    walletAddress: currentAddress
                  })
                });
                
                if (response.ok) {
                  console.log('Wallet address successfully stored in database');
                  setAddressStored(true); // Mark as stored to prevent further API calls
                } else {
                  console.error('Failed to store wallet address in database');
                }
              } catch (error) {
                console.error('Error storing wallet address:', error);
              }
            }
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

  // Add a function to check if a specific game has a user in Round 2
  const isUserInRound2ForGame = (game: Game): boolean => {
    if (!userId || !game.userBets || game.userBets.length < 2) {
      return false;
    }

    // Count the number of bets for this user in this game
    const userBetsForThisGame = game.userBets.filter(bet => bet.userId === userId);
    
    // Check if there are at least 2 bets for this user, and at least one has round_count=2
    const hasRound1Bet = userBetsForThisGame.some(bet => bet.round_count === 1);
    const hasRound2Bet = userBetsForThisGame.some(bet => bet.round_count === 2);
    
    // User is in Round 2 if they have both a Round 1 and Round 2 bet in the same game
    return hasRound1Bet && hasRound2Bet;
  };

  // Update the fetchGames function to check for duplicates correctly
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
        
        // Extract user ID from the first game with bets if available
        const gameWithBets = responseData.data.records.find(game => 
          game.bets && game.bets.length > 0
        );
        
        if (gameWithBets?.bets?.[0]?.userId) {
          setUserId(gameWithBets.bets[0].userId);
          console.log('User ID extracted:', gameWithBets.bets[0].userId);
        }
        
        // For global Round 2 state, check if ANY game has the user in Round 2
        const anyRound2Game = responseData.data.records.some(game => isUserInRound2ForGame(game));
        
        if (anyRound2Game) {
          console.log('User is in Round 2 for at least one game');
        }
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

  // Modify the checkUserWin function to check for Round 2 bets
  const checkUserWin = (game: Game) => {
    // If there are no winning items yet or no user bets, return null
    if (!userId || (!game.userBets && !game.bets)) {
      return null;
    }

    // Find user's bets from userBets first, or fall back to bets array
    const userBetsArray = game.userBets || [];
    
    // Determine if we're checking for Round 1 or Round 2
    // This will control which winning item we check against
    let isRound2 = false;
    
    // Find the user's bet - for Round 2 specifically look for round_count=2
    const round2Bet = userBetsArray.find(bet => 
      bet.userId === userId && bet.round_count === 2
    );
    
    // If found a Round 2 bet, we'll be checking against the second winning item
    if (round2Bet) {
      isRound2 = true;
    }
    
    // Get the appropriate bet based on which round we're checking
    const userBet = isRound2 ? round2Bet : userBetsArray.find(bet => 
      bet.userId === userId && bet.round_count === 1
    );
    
    if (!userBet) {
      // If no bet found in userBets, check regular bets array
      const regularBet = game.bets?.find(bet => bet.userId === userId);
      if (!regularBet) return null;
    }

    // Parse the bet item
    let betItem;
    try {
      const betItemStr = userBet ? userBet.item : game.bets?.find(bet => bet.userId === userId)?.item;
      betItem = typeof betItemStr === 'string' ? JSON.parse(betItemStr) : betItemStr;
    } catch {
      return null;
    }

    // If there are winning items but no match, it's a loss
    if (game.winning_items && game.winning_items.length > 0) {
      // Check if there's a winning item for the round we're checking
      // For Round 2, use the second winning item (index 1)
      // For Round 1, use the first winning item (index 0)
      const winningItemIndex = isRound2 && game.winning_items.length > 1 ? 1 : 0;
      const winningItem = game.winning_items[winningItemIndex];
      
      if (winningItem && winningItem.name === betItem.name) {
        // User won
        const betAmount = userBet ? userBet.amount : game.bets?.find(bet => bet.userId === userId)?.amount || 0;
        // If in Round 2, multiply by 25 instead of 5
        const multiplier = isRound2 ? 25 : 5;
        const winAmount = betAmount * multiplier;
        return {
          won: true,
          betAmount,
          winAmount,
          betItem,
          winningItem,
          isRound2
        };
      } else {
        // User lost
        const betAmount = userBet ? userBet.amount : game.bets?.find(bet => bet.userId === userId)?.amount || 0;
        return {
          won: false,
          betAmount,
          betItem,
          winningItem: winningItem, // Use the appropriate winning item based on round
          isRound2
        };
      }
    }
    
    // If there are no winning items yet (wheel not spun), return null
    return null;
  };

  // Function to open the Round 2 modal with game data
  const openRound2Modal = (betAmount: number, game: Game) => {
    setCurrentGame(game);
    setRound2Modal(true);
  };

  // New function to actually enter Round 2 with selected item
  const confirmEnterRound2 = async (gameId: string, itemId: string) => {
    if (!session?.user?.authToken) {
      toast.error('You must be logged in to enter Round 2');
      return;
    }

    if (!itemId || !gameId) {
      toast.error('Please select an item to place your bet on');
      return;
    }

    try {
      toast.loading('Processing your request...');
      
      // Find the selected item from the game
      const selectedItemObj = currentGame?.items.find(item => item._id === itemId);
      
      if (!selectedItemObj) {
        toast.error('Selected item not found');
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/api/v1/game/enter-final-round`, {
        method: 'POST',
        headers: {
          'Authorization': `${session.user.authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          game_id: gameId,
          item: selectedItemObj
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to enter Round 2: ${response.status}`);
      }

      const data = await response.json();
      console.log('Round 2 entry response:', data);
      
      toast.dismiss();
      toast.success('You have successfully entered Round 2! Please wait for the spin.');
      
      // Close modal
      setRound2Modal(false);
      
      // Refresh games list to show updated status
      fetchGames();
    } catch (error) {
      toast.dismiss();
      toast.error(error instanceof Error ? error.message : 'Failed to enter Round 2');
      console.error('Enter Round 2 error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 text-foreground">
      <WalletAddressSync />
      <Header />

      {/* Hero Section with coin.mp4 */}
      <div className="w-full flex justify-center items-center py-8">
        <video 
          src="/coin.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-full max-w-md h-auto"
        />
      </div>

      <main className="container mx-auto px-4 py-8 lg:py-12">
        <div id="games" className="scroll-mt-16">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent text-center sm:text-left">
             Games
            </h1>

            {isConnected && tronAddress ? (
              <div className="text-sm bg-green-100 text-green-700 rounded-full px-4 py-2 flex items-center">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                <span className="hidden sm:inline">Wallet connected:</span> {tronAddress.slice(0, 4)}...{tronAddress.slice(-4)}
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={connectWallet}
                className="flex items-center gap-2 border-primary w-full sm:w-auto"
              >
                <Wallet className="h-4 w-4" />
                {isTronLinkInstalled ? 'Connect TronLink' : 'Install TronLink'}
              </Button>
            )}
          </div>



          {/* Round 2 Qualification Banner */}
          {games.some(game => game.round === 2 && game.status !== 'completed') && (() => {
            // Only proceed if we have games
            if (!games.length) return null;

            // First, sort games by creation date (newest first) to find the most recent game
            const sortedGames = [...games].sort((a, b) => {
              const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
              const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
              return dateB - dateA;
            });
            
            // Get the most recent game regardless of win status
            const mostRecentGame = sortedGames[0];
            
            // Check if the most recent game is a win
            const winResult = checkUserWin(mostRecentGame);
            const isWin = winResult && winResult.won === true;
            
            // Only show qualification banner if the most recent game is a win
            if (!isWin) return null;
            
            console.log("Most recent game is a win:", mostRecentGame._id);
            
            // Get the bet amount from the won game
            const betAmount = winResult.betAmount;
            const winAmount = winResult.winAmount;
            
            // Check if user is already in Round 2 for this specific game
            const isInRound2ForThisGame = isUserInRound2ForGame(mostRecentGame);
            
            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-8 p-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg shadow-lg text-white"
              >
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center">
                    {/* <div className="mr-4 bg-white bg-opacity-20 p-3 rounded-full">
                      <Trophy className="h-8 w-8" />
                    </div> */}
                    <div>
                      <h2 className="text-2xl font-bold mb-1">Congratulations!</h2>
                      <p className="text-white text-opacity-90 max-w-xl">
                        You&apos;ve qualified<br />
                        {betAmount && winAmount && (
                          <>
                            <span className="block mt-2 text-lg font-semibold text-yellow-200">
                              You won <span className="text-2xl text-yellow-300">{winAmount} USDT</span> ({isInRound2ForThisGame && winResult.isRound2 ? '25x' : '5x'} your bet of {betAmount} USDT)!
                            </span>
                            
                            {/* Show different content based on Round 2 status */}
                            {isInRound2ForThisGame && (mostRecentGame.status as string) !== 'completed' ? (
                              <div className="mt-4 p-3 bg-purple-900/30 rounded-lg">
                                <span className="block mb-2">You have entered Round 2!</span>
                                <div className="flex items-center justify-center bg-purple-800/50 p-2 rounded animate-pulse">
                                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                  <span>Waiting for Round 2 spin...</span>
                                </div>
                              </div>
                            ) : isInRound2ForThisGame && (mostRecentGame.status as string) === 'completed' ? (
                              <div className="mt-4 p-3 bg-green-100 rounded-lg">
                                <span className="block  text-green-800 font-medium">Round 2 has completed!</span>
                                {/* <p className="text-sm text-green-700">Check your winnings in the game details below.</p> */}
                              </div>
                            ) : (
                              <>
                                <span className="block mt-2">
                                  You can <span className="font-bold">opt out</span> and take your winnings, 
                                  or <span className="font-bold">play for Round 2</span> to 25x your amount!
                                </span>
                                <div className="flex gap-4 mt-4">
                                  {(mostRecentGame.status as string) !== 'completed' ? (
                                    <>
                                      <Button className="bg-yellow-400 text-black font-bold hover:bg-yellow-500">
                                        Opt Out &amp; Take Winnings
                                      </Button>
                                      <Button 
                                        className="bg-purple-700 text-white font-bold hover:bg-purple-800"
                                        onClick={() => betAmount && mostRecentGame && openRound2Modal(betAmount, mostRecentGame)}
                                      >
                                        Play Round 2
                                      </Button>
                                    </>
                                  ) : (
                                    <div className="p-3 w-full bg-gray-100 text-gray-600 text-center rounded-md">
                                      Game Completed
                                    </div>
                                  )}
                                </div>
                              </>
                            )}
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                  {/* <div className="hidden md:block">
                    <Badge variant="outline" className="bg-white/20 hover:bg-white/30 text-white border-white/50 text-sm px-4 py-2">
                      VIP PLAYER STATUS
                    </Badge>
                  </div> */}
                </div>
              </motion.div>
            );
          })()}

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

              {/* Round 1 Qualified Games Section */}              {/* Other Games Section */}
              <div>
                <h2 className="text-2xl font-bold mb-4">Ongoing Games</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {games
                    .filter(game => game.round !== 2)
                    .sort((a, b) => {
                      // Sort by creation date in descending order (newest first)
                      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                      return dateB - dateA;
                    })
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
                            
                            {/* Display Bet Information */}
                            {game.bets && game.bets.length > 0 && (
                              <div className="mt-4 space-y-2">
                                <div className="text-sm font-medium text-blue-600">Your Bets</div>
                                {game.bets
                                  .filter(bet => userId && bet.userId === userId)
                                  .map((bet, index) => {
                                    // Parse the bet item if it's a string
                                    let betItem;
                                    try {
                                      betItem = typeof bet.item === 'string' ? JSON.parse(bet.item) : bet.item;
                                    } catch {
                                      betItem = { name: 'Unknown' };
                                    }
                                    
                                    return (
                                      <div key={index} className="text-sm text-muted-foreground flex items-center justify-between border p-2 rounded bg-blue-50">
                                        <span className="font-semibold text-primary">
                                          <span className="text-muted-foreground">Number:</span> {betItem.name}
                                        </span>
                                        <span className="font-semibold text-blue-600">
                                          <span className="text-muted-foreground">Bet:</span> {bet.amount} USDT
                                        </span>
                                      </div>
                                    );
                                  })}
                              </div>
                            )}
                            
                            {/* Winning or Losing Notification - First occurrence */}
                            {checkUserWin(game) && (
                              checkUserWin(game)?.won ? (
                                <div className="mt-4 p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-md text-white">
                                  <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-bold text-lg">Congratulations!</h4>
                                    <CheckCircle2 className="h-5 w-5" />
                                  </div>
                                  <p className="text-sm mb-2">
                                    Your bet on <span className="font-bold">Number {checkUserWin(game)?.betItem.name}</span> matches the winning number!
                                  </p>
                                  <p className="text-lg font-bold mb-3">
                                    You won {checkUserWin(game)?.winAmount} USDT! ({checkUserWin(game)?.isRound2 ? '25x' : '5x'} your bet of {checkUserWin(game)?.betAmount} USDT)
                                  </p>
                                  
                                  {/* Show different content based on Round 2 status */}
                                  {isUserInRound2ForGame(game) && (game.status as string) !== 'completed' ? (
                                    <div className="mt-2 p-2 bg-purple-700/50 rounded text-center">
                                      <span className="animate-pulse inline-flex items-center">
                                        <span className="mr-2">Waiting for Round 2 spin</span>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      </span>
                                    </div>
                                  ) : (game.status as string) !== 'completed' ? (
                                    <div className="flex gap-2 mt-2">
                                      <Button className="w-1/2 bg-yellow-400 text-black hover:bg-yellow-500" size="sm">
                                        Withdraw Winnings
                                      </Button>
                                      <Button 
                                        className="w-1/2 bg-purple-700 hover:bg-purple-800" 
                                        size="sm"
                                        onClick={() => checkUserWin(game)?.betAmount && openRound2Modal(checkUserWin(game)!.betAmount, game)}
                                      >
                                        Play Round 2
                                      </Button>
                                    </div>
                                  ) : (
                                    <div className="p-2 bg-gray-100 text-gray-600 text-sm text-center rounded-md">
                                      Game Completed
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="mt-4 p-3 bg-gray-100 border border-gray-200 rounded-md">
                                  <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-bold text-lg text-gray-700">Better luck next time!</h4>
                                  </div>
                                  <p className="text-sm text-gray-600 mb-2">
                                    Your bet on <span className="font-bold">Number {checkUserWin(game)?.betItem.name}</span> didn&apos;t match the winning number: <span className="font-bold text-red-500">Number {checkUserWin(game)?.winningItem.name}</span>
                                  </p>
                                  <Button className="w-full mt-2" variant="outline" size="sm">
                                    Try Another Game
                                  </Button>
                                </div>
                              )
                            )}
                            
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
                            ) : null}
                          </CardContent>

                          <CardFooter>
                            {game.status !== 'completed' ? (
                              game.bets && userId && game.bets.some(bet => bet.userId === userId) ? (
                                <Button className="w-full" variant="outline" disabled>
                                  Bet Already Placed
                                </Button>
                              ) : isUserInRound2ForGame(game) ? (
                                <Button className="w-full bg-purple-700 text-white" disabled>
                                  <span className="animate-pulse">Wait for 2nd spin...</span>
                                </Button>
                              ) : (
                                <Button className="w-full" asChild>
                                  <Link href={`/play/${game._id}`}>Play Now</Link>
                                </Button>
                              )
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

              
              {/* Round 2 Qualified Games Section */}
              {games.some(game => game.round === 2) && (
                <div className="mb-10">
                  <h2 className="text-2xl font-bold mb-4 flex items-center mt-10">
                    VIP Games
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {games
                      .filter(game => game.round === 2)
                      .sort((a, b) => {
                        // Sort by creation date in descending order (newest first)
                        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                        return dateB - dateA;
                      })
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
                              
                              {/* Display Bet Information */}
                              {game.bets && game.bets.length > 0 && (
                                <div className="mt-4 space-y-2">
                                  <div className="text-sm font-medium text-blue-600">Your Bets</div>
                                  {game.bets
                                    .filter(bet => userId && bet.userId === userId)
                                    .map((bet, index) => {
                                      // Parse the bet item if it's a string
                                      let betItem;
                                      try {
                                        betItem = typeof bet.item === 'string' ? JSON.parse(bet.item) : bet.item;
                                      } catch {
                                        betItem = { name: 'Unknown' };
                                      }
                                      
                                      return (
                                        <div key={index} className="text-sm text-muted-foreground flex items-center justify-between border p-2 rounded bg-blue-50">
                                          <span className="font-semibold text-primary">
                                            <span className="text-muted-foreground">Number:</span> {betItem.name}
                                          </span>
                                          <span className="font-semibold text-blue-600">
                                            <span className="text-muted-foreground">Bet:</span> {bet.amount} USDT
                                          </span>
                                        </div>
                                      );
                                    })}
                                </div>
                              )}
                              
                              {/* Winning or Losing Notification - Second occurrence in VIP games section */}
                              {checkUserWin(game) && (
                                checkUserWin(game)?.won ? (
                                  <div className="mt-4 p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-md text-white">
                                    <div className="flex items-center justify-between mb-2">
                                      <h4 className="font-bold text-lg">Congratulations!</h4>
                                      <CheckCircle2 className="h-5 w-5" />
                                    </div>
                                    <p className="text-sm mb-2">
                                      Your bet on <span className="font-bold">Number {checkUserWin(game)?.betItem.name}</span> matches the winning number!
                                    </p>
                                    <p className="text-lg font-bold mb-3">
                                      You won {checkUserWin(game)?.winAmount} USDT! ({checkUserWin(game)?.isRound2 ? '25x' : '5x'} your bet of {checkUserWin(game)?.betAmount} USDT)
                                    </p>
                                    
                                    {/* Show different content based on Round 2 status */}
                                    {isUserInRound2ForGame(game) && (game.status as string) !== 'completed' ? (
                                      <div className="mt-2 p-2 bg-purple-700/50 rounded text-center">
                                        <span className="animate-pulse inline-flex items-center">
                                          <span className="mr-2">Waiting for Round 2 spin</span>
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                        </span>
                                      </div>
                                    ) : (game.status as string) !== 'completed' ? (
                                      <div className="flex gap-2 mt-2">
                                        <Button className="w-1/2 bg-yellow-400 text-black hover:bg-yellow-500" size="sm">
                                          Withdraw Winnings
                                        </Button>
                                        <Button 
                                          className="w-1/2 bg-purple-700 hover:bg-purple-800" 
                                          size="sm"
                                          onClick={() => checkUserWin(game)?.betAmount && openRound2Modal(checkUserWin(game)!.betAmount, game)}
                                        >
                                          Play Round 2
                                        </Button>
                                      </div>
                                    ) : (
                                      <div className="p-2 bg-gray-100 text-gray-600 text-sm text-center rounded-md">
                                        Game Completed
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="mt-4 p-3 bg-gray-100 border border-gray-200 rounded-md">
                                    <div className="flex items-center justify-between mb-2">
                                      <h4 className="font-bold text-lg text-gray-700">Better luck next time!</h4>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">
                                      Your bet on <span className="font-bold">Number {checkUserWin(game)?.betItem.name}</span> didn&apos;t match the winning number: <span className="font-bold text-red-500">Number {checkUserWin(game)?.winningItem.name}</span>
                                    </p>
                                    <Button className="w-full mt-2" variant="outline" size="sm">
                                      Try Another Game
                                    </Button>
                                  </div>
                                )
                              )}
                              
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
                              ) : (
                                <div className="mt-4">
                                  <span className="inline-block bg-purple-100 text-purple-600 text-xs font-semibold px-2 py-1 rounded">
                                    VIP Game
                                  </span>
                                </div>
                              )}
                            </CardContent>

                            <CardFooter>
                              {game.status !== 'completed' ? (
                                game.bets && userId && game.bets.some(bet => bet.userId === userId) ? (
                                  <Button className="w-full" variant="outline" disabled>
                                    Bet Already Placed
                                  </Button>
                                ) : isUserInRound2ForGame(game) ? (
                                  <Button className="w-full bg-purple-700 text-white" disabled>
                                    <span className="animate-pulse">Wait for 2nd spin...</span>
                                  </Button>
                                ) : (
                                  <Button className="w-full" asChild>
                                    <Link href={`/play/${game._id}`}>Play Now</Link>
                                  </Button>
                                )
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



      {/* Footer */}
      <footer className="relative border-t border-primary/10 py-8 md:py-12 overflow-hidden">
            {/* Trust Indicators */}
            <div className="bg-black/5 backdrop-blur-sm py-6 md:py-8 border-y border-primary/10 mb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center p-4">
              <Shield className="h-8 w-8 md:h-10 md:w-10 text-primary mb-3" />
              <h3 className="font-semibold text-base lg:text-lg mb-1">100% Secure</h3>
              <p className="text-xs md:text-sm text-muted-foreground">All transactions verified on TRON blockchain</p>
            </div>
            <div className="flex flex-col items-center p-4">
              <Lock className="h-8 w-8 md:h-10 md:w-10 text-primary mb-3" />
              <h3 className="font-semibold text-base lg:text-lg mb-1">Fair Games</h3>
              <p className="text-xs md:text-sm text-muted-foreground">Provably fair algorithm with verified results</p>
            </div>
            <div className="flex flex-col items-center p-4">
              <CheckCircle2 className="h-8 w-8 md:h-10 md:w-10 text-primary mb-3" />
              <h3 className="font-semibold text-base lg:text-lg mb-1">Instant Payouts</h3>
              <p className="text-xs md:text-sm text-muted-foreground">Winnings sent directly to your TronLink wallet</p>
            </div>
            <div className="flex flex-col items-center p-4">
              <Trophy className="h-8 w-8 md:h-10 md:w-10 text-primary mb-3" />
              <h3 className="font-semibold text-base lg:text-lg mb-1">VIP Rewards</h3>
              <p className="text-xs md:text-sm text-muted-foreground">Qualify for exclusive Round 2 games with higher prizes</p>
            </div>
          </div>
        </div>
      </div>
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

      {/* Round 2 Entry Modal */}
      <Dialog open={round2Modal} onOpenChange={setRound2Modal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enter Round 2 - High Stakes Game</DialogTitle>
            <DialogDescription>
              <div className="mt-2 space-y-3">
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800">
                  <p className="font-medium mb-1">Warning!</p>
                  <p className="text-sm">If you lose this round, your previous winnings will be lost.</p>
                </div>
                <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-800">
                  <p className="font-medium mb-1">Potential Reward</p>
                  <p className="text-sm">If you win, your amount would be 25x instead of 5x!</p>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="item">Select Number to Bet On</Label>
              <Select value={selectedItem} onValueChange={setSelectedItem}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a number" />
                </SelectTrigger>
                <SelectContent>
                  {currentGame?.items.map((item) => (
                    <SelectItem key={item._id} value={item._id}>
                      Number {item.name} (Odds: {item.odds}x)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => setRound2Modal(false)}
              className="sm:w-1/2"
            >
              Cancel
            </Button>
            <Button 
              className="bg-purple-700 hover:bg-purple-800 sm:w-1/2"
              onClick={() => currentGame && confirmEnterRound2(currentGame._id, selectedItem)}
            >
              Confirm Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}