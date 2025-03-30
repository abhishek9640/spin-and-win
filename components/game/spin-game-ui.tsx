// "use client"

// import { useState } from "react"
// import { NumberSpinner } from "@/components/game/number-spinner"
// import { NumberSelector } from "@/components/game/number-selector"
// import { BettingPanel } from "@/components/game/betting-panel"
// import { ResultDisplay } from "@/components/game/result-display"
// import { WinnerModal } from "@/components/game/winner-modal"
// import { Card, CardContent } from "@/components/ui/card"
// import { motion } from "framer-motion"
// import { Alert, AlertDescription } from "@/components/ui/alert"
// import { AlertCircle } from "lucide-react"
// import { useSession } from "next-auth/react"
// import { useToast } from "@/components/ui/use-toast"

// interface GameItem {
//   name: string;
//   odds: number;
//   _id: string;
// }

// interface SpinGameProps {
//   gameId: string;
//   gameItems?: GameItem[];
//   minBet?: number;
//   maxBet?: number;
// }

// type GameState = 'idle' | 'betting' | 'spinning' | 'result' | 'won' | 'lost';

// export function SpinGameUI({ gameId, gameItems = [], minBet = 0.001, maxBet = 1 }: SpinGameProps) {
//   const { data: session } = useSession();
//   const { toast } = useToast();
  
//   const [gameState, setGameState] = useState<GameState>('idle');
//   const [selectedNumber, setSelectedNumber] = useState<string>('');
//   const [betAmount, setBetAmount] = useState<number>(minBet);
//   const [spinResult, setSpinResult] = useState<string>('');
//   const [winAmount, setWinAmount] = useState<number>(0);
//   const [showWinnerModal, setShowWinnerModal] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [isProcessing, setIsProcessing] = useState(false);

//   const validGameItems = gameItems.length > 0 
//     ? gameItems 
//     : Array.from({ length: 10 }, (_, i) => ({ 
//         name: String(i + 1), 
//         odds: 1, 
//         _id: String(i) 
//       }));

//   const possibleNumbers = validGameItems.map(item => item.name);

//   const handleBetChange = (amount: number) => {
//     setBetAmount(Math.min(Math.max(amount, minBet), maxBet));
//   };

//   const handleNumberSelect = (number: string) => {
//     setSelectedNumber(number);
//   };

//   const handleBetCreation = async () => {
//     if (!selectedNumber) {
//       setError('Please select a number first');
//       return;
//     }
    
//     if (betAmount < minBet) {
//       setError(`Minimum bet amount is ${minBet} ETH`);
//       return;
//     }

//     if (!session?.user?.authToken) {
//       setError('Please sign in to place a bet');
//       return;
//     }

//     try {
//       setIsProcessing(true);
//       setError(null);

//       const selectedItem = validGameItems.find(item => item.name === selectedNumber);
//       if (!selectedItem) {
//         throw new Error('Invalid number selected');
//       }

//       const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/user/bet`, {
//         method: 'POST',
//         headers: {
//           'Authorization': `${session.user.authToken}`,
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           game_id: gameId,
//           amount: Number(betAmount.toFixed(2)),
//           item: {
//             name: selectedNumber,
//             odds: selectedItem.odds,
//             _id: selectedItem._id
//           }
//         }),
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || `Failed to place bet: ${response.status}`);
//       }

//       const data = await response.json();
      
//       if (data.success) {
//         toast({
//           title: "Bet Placed Successfully",
//           description: "Your bet has been placed. Starting the game...",
//         });
//         setGameState('spinning');

//         // Start game logic
//         startGame();
//       } else {
//         throw new Error(data.message || 'Failed to place bet');
//       }
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Failed to place bet');
//       toast({
//         title: "Error",
//         description: err instanceof Error ? err.message : 'Failed to place bet',
//         variant: "destructive",
//       });
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   const startGame = () => {
//     setTimeout(() => {
//       const result = possibleNumbers[Math.floor(Math.random() * possibleNumbers.length)];
//       setSpinResult(result);

//       const isWinner = result === selectedNumber;
//       setGameState(isWinner ? 'won' : 'lost');

//       if (isWinner) {
//         const selectedItem = validGameItems.find(item => item.name === selectedNumber);
//         const odds = selectedItem ? selectedItem.odds : 1;
//         const winnings = betAmount * odds;
//         setWinAmount(winnings);

//         setTimeout(() => {
//           setShowWinnerModal(true);
//         }, 500);
//       }
//     }, 2000);
//   };

//   const handlePlayAgain = () => {
//     setGameState('idle');
//     setSpinResult('');
//     setWinAmount(0);
//     setShowWinnerModal(false);
//   };

//   const closeWinnerModal = () => {
//     setShowWinnerModal(false);
//   };

//   return (
//     <div className="container py-8">
//       <motion.h1
//         className="text-4xl md:text-6xl font-bold text-center mb-8 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent"
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//       >
//         Spin & Win
//       </motion.h1>

//       <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
//         <div>
//           <Card className="overflow-hidden">
//             <CardContent className="p-0">
//               <div className="py-8 px-6">
//                 <NumberSpinner 
//                   isSpinning={gameState === 'spinning'} 
//                   result={spinResult}
//                   possibleNumbers={possibleNumbers}
//                 />

//                 {error && (
//                   <Alert variant="destructive" className="mt-4">
//                     <AlertCircle className="h-4 w-4" />
//                     <AlertDescription>{error}</AlertDescription>
//                   </Alert>
//                 )}
                
//                 {(gameState === 'won' || gameState === 'lost') && (
//                   <ResultDisplay 
//                     won={gameState === 'won'} 
//                     amount={gameState === 'won' ? winAmount : betAmount}
//                     selectedNumber={parseInt(selectedNumber, 10)}
//                     resultNumber={spinResult}
//                     onPlayAgain={handlePlayAgain}
//                   />
//                 )}
//               </div>
//             </CardContent>
//           </Card>
//         </div>
        
//         <div className="space-y-6">
//           <BettingPanel 
//             minBet={minBet}
//             maxBet={maxBet}
//             betAmount={betAmount}
//             onBetChange={handleBetChange}
//             onSpin={handleBetCreation}
//             disabled={gameState === 'spinning' || gameState === 'won' || gameState === 'lost'}
//             isProcessing={isProcessing}
//           />
          
//           <NumberSelector 
//             numbers={possibleNumbers}
//             selectedNumber={selectedNumber}
//             onSelectNumber={handleNumberSelect}
//             disabled={gameState === 'spinning' || gameState === 'won' || gameState === 'lost' || isProcessing}
//           />
//         </div>
//       </div>

//       {showWinnerModal && (
//         <WinnerModal 
//           winAmount={winAmount}
//           onClose={closeWinnerModal}
//           onPlayAgain={handlePlayAgain}
//         />
//       )}
//     </div>
//   );
// }
