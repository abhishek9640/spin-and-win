'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useToast } from '@/components/ui/use-toast';
import Image from 'next/image';

interface ProfilePic {
  Location: string;
}

interface UserDetail {
  _id: string;
  username: string;
  profile_pic: ProfilePic;
  gender: string;
  email: string;
  phone_number: string;
  role: string;
  is_active: boolean;
  is_deleted: boolean;
  is_email_verified: boolean;
  crypto_address: string | null;
  __v: number;
}

interface Item {
  name: string;
  odds: number;
  _id: string;
}

interface TransactionDetail {
  _id: string;
  userId: string;
  gameId: string;
  type: string;
  amount: number;
  status: string;
  adminApproved: boolean;
  item: string;
  createdAt: string;
  updatedAt?: string;
  __v?: number;
}

interface Bet {
  userId: string;
  amount: number;
  item: string;
  transaction_id: string;
  round_count: number;
  _id: string;
  userDetails: UserDetail;
  transactionDetails: TransactionDetail;
}

interface Winner {
  userId: string;
  item: Item;
  amountWon: number;
  _id: string;
}

interface GameDetails {
  _id: string;
  items: Item[];
  status: string;
  round: number;
  is_settled_winning_price: boolean;
  users: string[];
  winning_items: Item[];
  bets: Bet;
  winners: Winner[];
  usersDetails?: UserDetail;
  createdAt: string;
  updatedAt: string;
  __v: number;
  userDetails?: UserDetail;
  transactionDetails?: TransactionDetail;
}

interface ApiResponse {
  status: string;
  message: string;
  data: {
    records: GameDetails[];
    totalRecords: number;
    totalPages: number;
    currentPage: number;
  };
}

const GameDetailsPage = () => {
  const router = useRouter();
  const pathname = usePathname();
  // Extract the gameId from the path
  const gameId = pathname.split('/').pop();
  
  const [gameDetails, setGameDetails] = useState<GameDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userBets, setUserBets] = useState<Map<string, Bet[]>>(new Map());
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const { data: session, status } = useSession();
  const { toast } = useToast();

  useEffect(() => {
    const fetchGameDetails = async () => {
      try {
        const token = session?.user?.authToken;

        if (!token) {
          if (status === 'loading') return;
          throw new Error("Authentication token not found. Please sign in again.");
        }

        // Fetch all games
        const response = await fetch(`${API_BASE_URL}/api/v1/admin/game-list?limit=50&page=1&status`, {
          headers: {
            "Authorization": `${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.status === 401 || response.status === 403) {
          toast({
            title: "Authentication Error",
            description: "Your session has expired. Please sign in again.",
            variant: "destructive",
          });
          router.push('/auth/signin?callbackUrl=/admin/winners');
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to fetch games');
        }

        const responseData: ApiResponse = await response.json();
        console.log("API Response:", responseData);

        // Find the specific game by ID
        if (responseData.data && Array.isArray(responseData.data.records)) {
          console.log("Looking for game with ID:", gameId);
          const foundGames = responseData.data.records.filter(game => game._id === gameId);
          
          if (foundGames.length > 0) {
            // Get the first game (as reference)
            const baseGame = foundGames[0];
            console.log("Found game:", baseGame._id);
            
            // Organize user bets from all instances of this game
            const betsMap = new Map<string, Bet[]>();
            
            foundGames.forEach(game => {
              if (game.bets) {
                const userId = game.bets.userId;
                if (!betsMap.has(userId)) {
                  betsMap.set(userId, []);
                }
                betsMap.get(userId)?.push(game.bets);
              }
            });
            
            setUserBets(betsMap);
            setGameDetails(baseGame);
          } else {
            console.log(`Game with ID ${gameId} not found in the response`);
            // If no specific game found, just set the first game
            if (responseData.data.records.length > 0) {
              setGameDetails(responseData.data.records[0]);
              console.log("Using first game instead:", responseData.data.records[0]._id);
            } else {
              setError('No games found in the response');
            }
          }
        } else {
          setError('Unexpected API response format');
        }
      } catch (error) {
        console.error('Error fetching game details:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch game details');
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchGameDetails();
    }
  }, [API_BASE_URL, gameId, router, session, status, toast]);

  const handleBack = () => {
    router.back();
  };

  const getWinnerDetails = (winnerId: string) => {
    return userBets.get(winnerId)?.[0]?.userDetails;
  };

  const parseItemString = (itemStr: string) => {
    try {
      return JSON.parse(itemStr);
    } catch {
      return { name: "Unknown", odds: 0 };
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex justify-center">
        <p>Loading game details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <button
          onClick={handleBack}
          className="mb-4 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
        >
          Back to Games
        </button>
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!gameDetails) {
    return (
      <div className="container mx-auto p-6">
        <button
          onClick={handleBack}
          className="mb-4 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
        >
          Back to Games
        </button>
        <p>No game details found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <button
        onClick={handleBack}
        className="mb-4 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
      >
        Back to Games
      </button>
      
      <h1 className="text-2xl font-bold mb-6">Game Details</h1>
      
      <div className="grid gap-6">
        {/* Game Info */}
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-bold mb-2">Game Information</h2>
          <div className="grid grid-cols-2 gap-2">
            <p><span className="font-medium">Game ID:</span> {gameDetails._id}</p>
            <p><span className="font-medium">Status:</span> {gameDetails.status}</p>
            <p><span className="font-medium">Round:</span> {gameDetails.round}</p>
            <p><span className="font-medium">Created:</span> {new Date(gameDetails.createdAt).toLocaleString()}</p>
            <p><span className="font-medium">Updated:</span> {new Date(gameDetails.updatedAt).toLocaleString()}</p>
            <p><span className="font-medium">Settled:</span> {gameDetails.is_settled_winning_price ? 'Yes' : 'No'}</p>
          </div>
        </div>
        
        {/* Items */}
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-bold mb-2">Items</h2>
          {Array.isArray(gameDetails.items) && gameDetails.items.length > 0 ? (
            <div className="grid grid-cols-3 gap-4">
              {gameDetails.items.map((item) => (
                <div 
                  key={item._id}
                  className={`border p-3 rounded ${Array.isArray(gameDetails.winning_items) && 
                    gameDetails.winning_items.some(wi => wi._id === item._id) ? 'bg-green-100 border-green-500' : ''}`}
                >
                  <p><span className="font-medium">Name:</span> {item.name}</p>
                  <p><span className="font-medium">Odds:</span> {item.odds}</p>
                  {Array.isArray(gameDetails.winning_items) && 
                    gameDetails.winning_items.some(wi => wi._id === item._id) && (
                    <p className="text-green-600 font-bold mt-2">WINNER</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p>No items available</p>
          )}
        </div>
        
        {/* Winners */}
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-bold mb-2">Winners</h2>
          {Array.isArray(gameDetails.winners) && gameDetails.winners.length > 0 ? (
            <div className="space-y-4">
              {gameDetails.winners.map((winner, index) => {
                const user = getWinnerDetails(winner.userId);
                return (
                  <div key={winner._id || index} className="border p-3 rounded">
                    <div className="flex items-center gap-3">
                      {user?.profile_pic?.Location && (
                        <Image 
                          src={user.profile_pic.Location} 
                          alt={user.username}
                          width={48}
                          height={48}
                          className="rounded-full"
                        />
                      )}
                      <div>
                        <p><span className="font-medium">User:</span> {user?.username || winner.userId}</p>
                        {user?.email && <p><span className="font-medium">Email:</span> {user.email}</p>}
                      </div>
                    </div>
                    <div className="mt-2">
                      <p><span className="font-medium">Winning Item:</span> {winner.item?.name} (Odds: {winner.item?.odds})</p>
                      <p><span className="font-medium">Amount Won:</span> {winner.amountWon}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p>No winners yet</p>
          )}
        </div>
        
        {/* Participants and Bets */}
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-bold mb-2">Participants and Bets</h2>
          {gameDetails.users && gameDetails.users.length > 0 ? (
            <div className="space-y-6">
              {gameDetails.users.map(userId => {
                const userBetsList = userBets.get(userId) || [];
                const userDetail = userBetsList.length > 0 ? userBetsList[0].userDetails : null;
                
                if (!userDetail) return null;
                
                return (
                  <div key={userId} className="border p-4 rounded">
                    <div className="flex items-center gap-3 mb-4">
                      {userDetail.profile_pic?.Location && (
                        <Image 
                          src={userDetail.profile_pic.Location} 
                          alt={userDetail.username}
                          width={48}
                          height={48}
                          className="rounded-full"
                        />
                      )}
                      <div>
                        <p className="text-lg font-semibold">{userDetail.username}</p>
                        <p>{userDetail.email}</p>
                        <p className="text-sm text-gray-500">ID: {userId}</p>
                      </div>
                    </div>
                    
                    {userBetsList.length > 0 ? (
                      <div>
                        <h3 className="font-semibold mb-2 text-lg">Bets</h3>
                        <div className="grid gap-3">
                          {userBetsList.map((bet, index) => {
                            const betItem = parseItemString(bet.item);
                            return (
                              <div key={index} className="bg-gray-50 p-3 rounded">
                                <p><span className="font-medium">Round:</span> {bet.round_count}</p>
                                <p><span className="font-medium">Amount:</span> {bet.amount}</p>
                                <p><span className="font-medium">Selected Item:</span> {betItem.name} (Odds: {betItem.odds})</p>
                                <p><span className="font-medium">Transaction:</span> {bet.transaction_id}</p>
                                <p>
                                  <span className="font-medium">Status:</span> 
                                  <span className={bet.transactionDetails.status === 'completed' ? 'text-green-600' : 'text-yellow-600'}>
                                    {bet.transactionDetails.status}
                                  </span>
                                </p>
                                {gameDetails.winners.some(w => w.userId === userId) && (
                                  <p className="text-green-600 font-bold mt-1">WINNER</p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <p>No bets found for this user</p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p>No participants found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameDetailsPage; 