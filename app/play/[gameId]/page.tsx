'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Loader2, ArrowLeft, Info, AlertCircle, CheckCircle, LockKeyhole, Coins} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { toast } from 'sonner'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

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

// Storage key constant for wallet address
const STORED_WALLET_KEY = 'tronlink_wallet_address';

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
  // const [tronAddress, setTronAddress] = useState<string>("");
  
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
        // Check for stored address first
        const storedAddress = localStorage.getItem(STORED_WALLET_KEY);
        if (storedAddress) {
          setIsConnected(true);
          console.log('Using stored TronLink address:', storedAddress);
          return;
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
              // Save to localStorage
              localStorage.setItem(STORED_WALLET_KEY, currentAddress);
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
      // Check if on mobile
      const userAgent = navigator.userAgent || navigator.vendor;
      const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      
      if (isMobile) {
        // On mobile, show manual address input prompt
        const manualAddress = prompt('Enter your TronLink wallet address:');
        
        if (!manualAddress) {
          toast.error('Please enter a valid TronLink address');
          return;
        }
        
        // Basic validation for Tron address format
        if (!/^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(manualAddress)) {
          toast.error('Invalid TronLink address format');
          return;
        }
        
        // Save to localStorage for persistence
        localStorage.setItem(STORED_WALLET_KEY, manualAddress);
        setIsConnected(true);
        toast.success(`Wallet connected: ${manualAddress.slice(0, 8)}...${manualAddress.slice(-6)}`);
        return;
      }
    
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
            // Save to localStorage
            localStorage.setItem(STORED_WALLET_KEY, currentAddress);
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
      
      {/* Game Header */}
      <div className="relative bg-black py-12 mb-8">
        <div className="absolute inset-0 opacity-5 bg-[url('/patterns/noise.png')] mix-blend-overlay"></div>
        <div className="container mx-auto px-4 relative z-10">
          <Button variant="ghost" size="sm" asChild className="mb-6 text-white/70 hover:text-white hover:bg-white/5">
            <Link href="/play">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Games
            </Link>
          </Button>

          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            {/* <div className="w-full lg:w-1/2">
              <motion.h1 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="text-4xl md:text-5xl font-bold text-white"
              >
                {game.name || `Game ${game._id ? game._id.slice(-4) : 'Unknown'}`}
              </motion.h1>
              
              <div className="flex flex-wrap gap-3 mt-4">
                {game.round === 2 && (
                  <Badge className="bg-yellow-500 text-black font-semibold">VIP ROUND 2</Badge>
                )}
                <Badge variant="outline" className="text-white/80 border-white/10 bg-white/5">
                  {game.items?.length || 0} possible outcomes
                </Badge>
                <Badge variant="outline" className="text-white/80 border-white/10 bg-white/5">
                  Min bet: {game.minBet || 2} USDT
                </Badge>
              </div>
              
              {game.description && (
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="text-gray-400 mt-3 max-w-xl"
                >
                  {game.description}
                </motion.p>
              )}

              {isConnected && tronAddress ? (
                <div className="mt-6 bg-green-900/20 text-green-400 rounded-md px-4 py-3 flex items-center border border-green-900/30">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  Wallet connected: {tronAddress.slice(0, 8)}...{tronAddress.slice(-6)}
                </div>
              ) : (
                <Button
                  onClick={connectWallet}
                  className="mt-6 bg-green-700 hover:bg-green-600 text-white"
                >
                  <LockKeyhole className="h-4 w-4 mr-2" />
                  {isTronLinkInstalled ? 'Connect Wallet' : 'Install TronLink'}
                </Button>
              )}
            </div> */}

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative w-full lg:w-[400px] aspect-square rounded-xl overflow-hidden"
            >
              <div className="absolute inset-0 bg-black/20 z-10" />
              <video
                className="w-full h-full object-cover"
                autoPlay
                loop
                muted
                playsInline
              >
                <source src="/coin.mp4" type="video/mp4" />
              </video>
            </motion.div>
          </div>
        </div>
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
                        <h3 className="font-semibold text-lg mb-1">Bet Successfully Placed!</h3>
                        <p className="text-muted-foreground mb-2">
                          Your bet of <span className="font-bold">{betDetails.amount} USDT</span> on <span className="font-bold">{betDetails.item}</span> has been confirmed.
                        </p>
                        <p className="text-sm text-muted-foreground">Placed at: {betDetails.timestamp}</p>
                      </div>
                      <Button 
                        variant="outline" 
                        className="mt-4 md:mt-0 md:ml-4"
                        onClick={() => {
                          setBetPlaced(false);
                          setBetDetails(null);
                        }}
                      >
                        Place Another Bet
                      </Button>
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
            
            {/* Betting Interface */}
            {!betPlaced && (
              <Tabs defaultValue="standard" className="w-full">
                <TabsList className="w-full mb-6">
                  <TabsTrigger value="standard" className="flex-1">Standard Bet</TabsTrigger>
                </TabsList>
                
                <TabsContent value="standard">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        Place Your Bet
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="ml-2 h-8 w-8">
                                <Info className="h-4 w-4" />
                                <span className="sr-only">Bet info</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">Select your desired outcome and enter a bet amount. Winnings are calculated based on the odds shown.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </CardTitle>
                      <CardDescription>
                        Choose your outcome and bet amount to play
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-3">
                        <Label htmlFor="amount" className="text-base font-medium">
                          Bet Amount (USDT TRC-20)
                        </Label>
                        <div className="relative">
                          <Coins className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input
                            id="amount"
                            type="text"
                            value={betAmount}
                            onChange={handleAmountChange}
                            placeholder={`${game.minBet || '2.00'} - ${game.maxBet || 'unlimited'}`}
                            className="pl-10 text-lg"
                            disabled={!isConnected || isPlacingBet}
                          />
                        </div>
                        {game.minBet && game.maxBet && (
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Min: {game.minBet} USDT</span>
                            <span>Max: {game.maxBet} USDT</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <Label className="text-base font-medium">Select Outcome</Label>
                          {selectedItem && (
                            <Badge variant="outline" className="ml-2">
                              Selected: {selectedItem.name} 
                            </Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                          {(game.items || []).map((item) => (
                            <motion.div
                              key={item._id}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Button
                                variant={selectedItem?._id === item._id ? "default" : "outline"}
                                onClick={() => setSelectedItem(item)}
                                className={`w-full h-16 flex flex-col items-center justify-center ${
                                  selectedItem?._id === item._id 
                                    ? "bg-primary text-primary-foreground border-primary" 
                                    : "hover:bg-primary/10"
                                }`}
                                disabled={isPlacingBet || !isConnected}
                              >
                                <span className="text-lg font-bold">{item.name}</span>
                               
                              </Button>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                      
                      {selectedItem && betAmount && !isNaN(parseFloat(betAmount)) && (
                        <div className="bg-muted p-4 rounded-lg">
                          <h4 className="font-medium mb-2">Potential Win</h4>
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">If outcome is {selectedItem.name}:</span>
                            <span className="text-lg font-bold text-green-600">
                              {(parseFloat(betAmount) * selectedItem.odds).toFixed(2)} USDT
                            </span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      <Button
                        className="w-full py-6 text-lg font-semibold"
                        onClick={handlePlaceBet}
                        disabled={isPlacingBet || !selectedItem || !betAmount || !isConnected}
                      >
                        {isPlacingBet ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Processing Bet...
                          </>
                        ) : !isConnected ? (
                          'Connect Wallet to Place Bet'
                        ) : !selectedItem || !betAmount ? (
                          'Select Outcome & Enter Amount'
                        ) : (
                          `Place ${betAmount} USDT Bet on ${selectedItem.name}`
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Security Information */}
            {/* <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-primary" />
                  Secure & Fair Gaming
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Blockchain Verified</h4>
                    <p className="text-sm text-muted-foreground">All bets are recorded on the TRON blockchain for transparency</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Provably Fair</h4>
                    <p className="text-sm text-muted-foreground">Our fair algorithm ensures every outcome is random and verifiable</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Instant Payouts</h4>
                    <p className="text-sm text-muted-foreground">Winning payouts are sent directly to your connected wallet</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full" 
                  onClick={() => setShowSecurityInfo(!showSecurityInfo)}
                >
                  {showSecurityInfo ? 'Hide Details' : 'Learn More'}
                </Button>
                
                {showSecurityInfo && (
                  <div className="border-t pt-4 mt-2 text-sm text-muted-foreground">
                    <p className="mb-2">
                      Our platform uses smart contracts to handle all bets and payouts. Each game result is generated using a provably fair algorithm that can be independently verified.
                    </p>
                    <p>
                      Your funds are always under your control through your TronLink wallet, and all transactions are publicly visible on the TRON blockchain.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card> */}
            
            {/* Recent Winners */}
            {/* <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center">
                  <Trophy className="h-5 w-5 mr-2 text-amber-500" />
                  Recent Winners
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentWinners.map((winner, i) => (
                    <div key={i} className="flex justify-between items-center pb-3 border-b last:border-0 last:pb-0">
                      <div>
                        <div className="font-medium">{winner.name}</div>
                        <div className="text-sm text-muted-foreground">Won with {winner.item}</div>
                      </div>
                      <div className="font-bold text-green-600">{winner.amount} USDT</div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="ghost" size="sm" className="w-full">
                  View All Winners
                </Button>
              </CardFooter>
            </Card> */}
            
            {/* Need Help? */}
            {/* <Card>
              <CardHeader className="pb-3">
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  If you have any questions about placing bets or how the game works, our support team is here to help.
                </p>
                <Button variant="outline" className="w-full">
                  Contact Support
                </Button>
              </CardContent>
            </Card> */}
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