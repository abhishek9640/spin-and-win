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
        className="mb-6 bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2 rounded-md font-medium transition duration-200 flex items-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Back to Games
      </button>
      
      <h1 className="text-3xl font-bold mb-8 text-gray-800 border-b pb-4">Game Details</h1>
      
      <div className="grid gap-8">
        {/* Game Info */}
        <div className="bg-white shadow-md rounded-lg p-6 border border-gray-100">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Game Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="mb-2"><span className="font-semibold text-gray-700">Game ID:</span> <span className="text-gray-900">{gameDetails._id}</span></p>
              <p className="mb-2"><span className="font-semibold text-gray-700">Status:</span> 
                <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  gameDetails.status === 'completed' ? 'bg-green-100 text-green-800' : 
                  gameDetails.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {gameDetails.status}
                </span>
              </p>
              <p className="mb-2"><span className="font-semibold text-gray-700">Round:</span> <span className="font-mono text-gray-900">{gameDetails.round}</span></p>
            </div>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="mb-2"><span className="font-semibold text-gray-700">Created:</span> <span className="text-gray-900">{new Date(gameDetails.createdAt).toLocaleString()}</span></p>
              <p className="mb-2"><span className="font-semibold text-gray-700">Updated:</span> <span className="text-gray-900">{new Date(gameDetails.updatedAt).toLocaleString()}</span></p>
              <p className="mb-2"><span className="font-semibold text-gray-700">Settled:</span> 
                <span className={`ml-2 ${gameDetails.is_settled_winning_price ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}`}>
                  {gameDetails.is_settled_winning_price ? 'Yes' : 'No'}
                </span>
              </p>
            </div>
          </div>
        </div>
        
        {/* Items */}
        <div className="bg-white shadow-md rounded-lg p-6 border border-gray-100">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Items</h2>
          {Array.isArray(gameDetails.items) && gameDetails.items.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {gameDetails.items.map((item) => (
                <div 
                  key={item._id}
                  className={`border p-4 rounded-lg ${
                    Array.isArray(gameDetails.winning_items) && 
                    gameDetails.winning_items.some(wi => wi._id === item._id) 
                      ? 'bg-green-50 border-green-300 shadow' 
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <p className="text-lg font-semibold mb-1">{item.name}</p>
                  <p className="text-gray-600">Odds: <span className="font-mono font-medium">{item.odds}</span></p>
                  {Array.isArray(gameDetails.winning_items) && 
                    gameDetails.winning_items.some(wi => wi._id === item._id) && (
                    <div className="mt-2 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-green-600 font-semibold">WINNER</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No items available</p>
          )}
        </div>
        
        {/* Winners */}
        <div className="bg-white shadow-md rounded-lg p-6 border border-gray-100">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Winners</h2>
          {Array.isArray(gameDetails.winners) && gameDetails.winners.length > 0 ? (
            <div className="space-y-4">
              {gameDetails.winners.map((winner, index) => {
                const user = getWinnerDetails(winner.userId);
                return (
                  <div key={winner._id || index} className="border border-green-200 bg-green-50 p-5 rounded-lg shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex items-center gap-4">
                        {user?.profile_pic?.Location && (
                          <div className="relative">
                            <Image 
                              src={user.profile_pic.Location} 
                              alt={user.username}
                              width={64}
                              height={64}
                              className="rounded-full border-2 border-green-300"
                            />
                            <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        )}
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">{user?.username || "Unknown User"}</h3>
                          {user?.email && <p className="text-gray-600">{user.email}</p>}
                          {user?.phone_number && <p className="text-gray-600">{user.phone_number}</p>}
                          {user?.gender && <p className="text-gray-600">Gender: {user.gender}</p>}
                          {user?.crypto_address && (
                            <p className="text-gray-600 text-sm mt-1">
                              Crypto: <span className="font-mono text-xs">{user.crypto_address}</span>
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="md:ml-auto bg-white rounded-lg p-4 shadow-sm">
                        <p className="text-gray-700 font-medium">Winning Item: <span className="text-green-600 font-bold">{winner.item?.name}</span></p>
                        <p className="text-gray-700 font-medium">Odds: <span className="font-mono font-bold">{winner.item?.odds}</span></p>
                        <p className="text-gray-700 font-medium">Amount Won: <span className="text-green-600 font-bold">${winner.amountWon.toFixed(2)}</span></p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 italic">No winners yet</p>
          )}
        </div>
        
        {/* Participants and Bets */}
        <div className="bg-white shadow-md rounded-lg p-6 border border-gray-100">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Participants and Bets</h2>
          {gameDetails.users && gameDetails.users.length > 0 ? (
            <div className="space-y-6">
              {gameDetails.users.map(userId => {
                const userBetsList = userBets.get(userId) || [];
                const userDetail = userBetsList.length > 0 ? userBetsList[0].userDetails : null;
                
                if (!userDetail) return null;
                
                const isWinner = gameDetails.winners.some(w => w.userId === userId);
                
                return (
                  <div key={userId} className={`border p-6 rounded-lg ${isWinner ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}>
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
                      {userDetail.profile_pic?.Location && (
                        <Image 
                          src={userDetail.profile_pic.Location} 
                          alt={userDetail.username}
                          width={80}
                          height={80}
                          className="rounded-full border-2 border-gray-200"
                        />
                      )}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-bold text-gray-800">{userDetail.username}</h3>
                          {isWinner && (
                            <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Winner
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600">{userDetail.email}</p>
                        <p className="text-gray-600">{userDetail.phone_number}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
                            {userDetail.gender}
                          </span>
                          <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${
                            userDetail.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {userDetail.is_active ? 'Active' : 'Inactive'}
                          </span>
                          <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${
                            userDetail.is_email_verified ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {userDetail.is_email_verified ? 'Verified' : 'Unverified'}
                          </span>
                          <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">
                            {userDetail.role}
                          </span>
                        </div>
                        {userDetail.crypto_address && (
                          <p className="text-gray-500 text-xs mt-1">
                            <span className="font-medium">Crypto Address:</span>{' '}
                            <span className="font-mono">{userDetail.crypto_address}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {userBetsList.length > 0 ? (
                      <div>
                        <h3 className="font-semibold mb-3 text-lg text-gray-700 border-b pb-2">Bets History</h3>
                        <div className="grid gap-4 md:grid-cols-2">
                          {userBetsList.map((bet, index) => {
                            const betItem = parseItemString(bet.item);
                            const isWinningBet = gameDetails.winning_items.some(wi => wi._id === betItem._id);
                            
                            return (
                              <div 
                                key={index} 
                                className={`p-4 rounded-lg ${
                                  isWinningBet ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
                                }`}
                              >
                                <div className="flex justify-between mb-2">
                                  <span className="font-semibold text-gray-700">Round {bet.round_count}</span>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    bet.transactionDetails.status === 'completed' 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {bet.transactionDetails.status}
                                  </span>
                                </div>
                                
                                <p className="text-gray-700">Amount: <span className="font-bold">${bet.amount.toFixed(2)}</span></p>
                                
                                <div className="mt-2 p-2 bg-white rounded border border-gray-100">
                                  <p className="text-gray-700">Selected Item: <span className="font-medium">{betItem.name}</span></p>
                                  <p className="text-gray-700">Odds: <span className="font-mono">{betItem.odds}</span></p>
                                </div>
                                
                                <p className="mt-2 text-gray-600 text-xs">
                                  <span className="font-medium">Transaction:</span>{' '}
                                  <span className="font-mono">{bet.transaction_id}</span>
                                </p>
                                
                                <p className="text-gray-600 text-xs">
                                  <span className="font-medium">Date:</span>{' '}
                                  <span>{new Date(bet.transactionDetails.createdAt).toLocaleString()}</span>
                                </p>
                                
                                {isWinningBet && (
                                  <div className="mt-2 flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-green-600 font-semibold">Winning Bet</span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">No bets found for this user</p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 italic">No participants found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameDetailsPage; 