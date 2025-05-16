'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Loader2, ArrowLeft, AlertCircle, CheckCircle, LockKeyhole} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import Link from 'next/link'
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
  round?: number;
}

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.gameId as string;
  const { data: session, status: sessionStatus } = useSession();
  
  const [isTronLinkInstalled, setIsTronLinkInstalled] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [tronAddress, setTronAddress] = useState<string>("");
  const [addressStored, setAddressStored] = useState<boolean>(false);
  
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<GameItem | null>(null);
  const [betAmount, setBetAmount] = useState<string>('');
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  // const [showSecurityInfo, setShowSecurityInfo] = useState(false);
  const [betPlaced, setBetPlaced] = useState(false);
  const [betDetails, setBetDetails] = useState<{amount: string; item: string; timestamp: string} | null>(null);
      // const [recentWinners] = useState([
      //   { name: "Alex", item: "7", amount: 240.50 },
      //   { name: "Jessica", item: "21", amount: 450.75 },
      //   { name: "Michael", item: "12", amount: 120.25 },
      // ]);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://spinwin.shreyanshkataria.com';

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
          if (session?.user?.authToken && !addressStored) {
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
  }, [API_BASE_URL, session?.user?.authToken, addressStored]);

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
            'Cache-Control': 'no-cache',
            "ngrok-skip-browser-warning": "true"
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
          
          // If it's a Round 2 game, automatically set bet amount to previous bet amount
          if (gameData.round === 2 && gameData.minBet) {
            setBetAmount(gameData.minBet.toString());
          }
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

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only valid number format with up to 2 decimal places
    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
      setBetAmount(value);
    }
  };

  const handlePlaceBet = async () => {
    if (!game || !selectedItem || !betAmount || !session?.user?.authToken) {
      toast.error('Please select an item and enter a valid amount');
      return;
    }

    const amount = parseFloat(betAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (game.minBet && amount < game.minBet) {
      toast.error(`Minimum bet amount is ${game.minBet} USDT`);
      return;
    }

    if (game.maxBet && amount > game.maxBet) {
      toast.error(`Maximum bet amount is ${game.maxBet} USDT`);
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

        // Store bet details
        setBetPlaced(true);
        setBetDetails({
          amount: amount.toFixed(2),
          item: selectedItem.name,
          timestamp: new Date().toLocaleString()
        });

        // Make API call to set transaction as done
        try {
          const setTransResponse = await fetch(`${API_BASE_URL}/api/v1/user/set-trans-done`, {
            method: 'POST',
            headers: {
              'Authorization': `${session.user.authToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              transactionId: data.trans_id
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
      toast.error(err instanceof Error ? err.message : 'Failed to place bet');
    } finally {
      setIsPlacingBet(false);
    }
  };

  // Check if we need to show loading state
  if (sessionStatus === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <div className="flex flex-col justify-center items-center h-[80vh]">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <span className="text-xl font-medium">Loading game details...</span>
          <p className="text-muted-foreground mt-2">Please wait while we prepare your game</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !game) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="max-w-md mx-auto">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-4 text-red-500">Error Loading Game</h1>
            <p className="mb-8 text-muted-foreground">{error || 'Game not found'}</p>
            <Button asChild size="lg">
              <Link href="/play">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Games
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Main game display (always show game UI once loaded, with wallet warning if needed)
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95 text-foreground">
      <Header />
      
      {/* Video Header */}
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

      <div className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Game Info and Betting Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bet Placed Message */}
            {betPlaced && betDetails && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mb-6"
              >
                <Card className="overflow-hidden border-green-500/50 bg-green-50/50 dark:bg-green-950/10">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row items-center p-6">
                      <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full mb-4 md:mb-0 md:mr-6">
                        <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="text-center md:text-left md:flex-1">
                        <h3 className="font-semibold text-lg mb-1">Bet Successfully Placed! and Result will announced at 09:00 PM</h3>
                        <p className="text-muted-foreground mb-2">
                          Your bet of <span className="font-bold">{betDetails.amount} USDT</span> on <span className="font-bold">{betDetails.item}</span> has been confirmed.
                        </p>
                        <p className="text-sm text-muted-foreground">Placed at: {betDetails.timestamp}</p>
                      </div>
                      {/* <Button 
                        variant="outline" 
                        className="mt-4 md:mt-0 md:ml-4"
                        onClick={() => {
                          setBetPlaced(false);
                          setBetDetails(null);
                        }}
                      >
                        Place Another Bet
                      </Button> */}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
            
            {/* Connect Wallet Notice */}
            {!isConnected && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mb-6"
              >
                <Card className="overflow-hidden border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/10">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row items-center p-6">
                      <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-full mb-4 md:mb-0 md:mr-6">
                        <LockKeyhole className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div className="text-center md:text-left md:flex-1">
                        <h3 className="font-semibold text-lg mb-1">Connect Your TronLink Wallet</h3>
                        <p className="text-muted-foreground mb-4">
                          Connect your TronLink wallet to place bets and win rewards. All transactions are secure and verified on the TRON blockchain.
                        </p>
                        <Button 
                          onClick={connectWallet}
                          className="bg-amber-600 hover:bg-amber-700 text-white"
                        >
                          {isTronLinkInstalled ? 'Connect TronLink Wallet' : 'Install TronLink Wallet'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
            
            {/* Display wallet status if connected */}
            {isConnected && tronAddress && (
              <div className="mb-6 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded-lg p-4 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                <span>Wallet connected: {tronAddress.slice(0, 8)}...{tronAddress.slice(-6)}</span>
              </div>
            )}
            
            {/* Betting Interface */}
            {!betPlaced && (
              <Card className="w-full bg-black text-white border-gray-800">
                <CardContent className="p-4 sm:p-6">
                  <div className="grid grid-cols-2 gap-3 sm:gap-6">
                    {/* Left side - Number grid */}
                    <div className="space-y-2 sm:space-y-4">
                      <h3 className="text-base sm:text-xl font-medium">SELECT YOUR LUCKY NUMBER</h3>
                      
                      {/* 3x3 Grid of Numbers */}
                      <div className="grid grid-cols-3 gap-2 sm:gap-4">
                        {[...Array(9)].map((_, index) => {
                          const number = index + 1; // 1 to 9
                          const buttonItem = game.items?.find(item => item.name === number.toString());
                          const isSelected = selectedItem?.name === number.toString();
                          
                          return (
                            <Button
                              key={index}
                              variant="outline"
                              onClick={() => buttonItem && setSelectedItem(buttonItem)}
                              className={`h-12 sm:h-16  transition-all duration-200
                                ${isSelected 
                                  ? "bg-primary text-primary-foreground border-primary scale-105 shadow-glow" 
                                  : "bg-gray-800 hover:bg-gray-700"
                                }`}
                              disabled={isPlacingBet || !isConnected}
                            >
                              <span className="text-lg sm:text-xl font-bold">
                                {number}
                              </span>
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                    
                    {/* Right side - Bet amount and Play button */}
                    <div className="space-y-3 sm:space-y-6 flex flex-col">
                      {game.round !== 2 ? (
                        // Only show amount input for regular games
                        <div className="space-y-2 sm:space-y-3 flex-grow">
                          <h3 className="text-base sm:text-xl font-medium">BET AMOUNT</h3>
                          <div className="relative">
                            <Input
                              id="amount"
                              type="text"
                              value={betAmount}
                              onChange={handleAmountChange}
                              placeholder="0 USDT"
                              className="pl-2 sm:pl-4 text-base sm:text-lg py-3 sm:py-6 bg-transparent border border-gray-700 rounded-lg text-white"
                              disabled={!isConnected || isPlacingBet}
                            />
                          </div>
                          <div className="text-xs sm:text-sm text-gray-400">
                            Minimum bet amount: {game.minBet || 10}USDT
                          </div>
                        </div>
                      ) : (
                        // For Round 2 games, show a fixed amount
                        <div className="space-y-2 sm:space-y-3 flex-grow">
                          <h3 className="text-base sm:text-xl font-medium">VIP ROUND BET</h3>
                          <div className="bg-purple-900/30 border border-purple-500 rounded-lg p-4 text-center">
                            <span className="text-xl font-bold">{betAmount} USDT</span>
                            <p className="text-xs text-purple-300 mt-1">Fixed amount from your qualifying bet</p>
                          </div>
                          <div className="text-xs sm:text-sm text-purple-400">
                            Win up to 25x your bet amount in Round 2!
                          </div>
                        </div>
                      )}
                      
                      <Button
                        className="w-full py-4 sm:py-8 text-lg sm:text-2xl font-semibold bg-gray-700 hover:bg-gray-600 text-white rounded-lg border border-gray-500"
                        onClick={handlePlaceBet}
                        disabled={isPlacingBet || !selectedItem || !betAmount || !isConnected}
                      >
                        {isPlacingBet ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          "PLAY NOW"
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          

        </div>
      </div>
      
      {/* Trust Footer */}
      <div className="bg-muted py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center items-center gap-4 mb-4">
            <Badge variant="outline" className="px-3 py-1">SSL Secured</Badge>
            <Badge variant="outline" className="px-3 py-1">Provably Fair</Badge>
            <Badge variant="outline" className="px-3 py-1">Blockchain Verified</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2025 Spin &amp; Win. All rights reserved. Licensed and regulated gaming platform.
          </p>
        </div>
      </div>
    </div>
  );
} 