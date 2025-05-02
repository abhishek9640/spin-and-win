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
  amount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface BetsData {
  userDetails: UserDetail[];
  transactionDetails: TransactionDetail[];
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
  bets: BetsData;
  winners: Winner[];
  usersDetails: UserDetail[];
  createdAt: string;
  updatedAt: string;
  __v: number;
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
          const foundGame = responseData.data.records.find(game => game._id === gameId);
          
          if (foundGame) {
            console.log("Found game:", foundGame._id);
            setGameDetails(foundGame);
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
                const user = gameDetails.usersDetails?.find(u => u._id === winner.userId);
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
        
        {/* Users */}
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-bold mb-2">Participants</h2>
          {Array.isArray(gameDetails.usersDetails) && gameDetails.usersDetails.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {gameDetails.usersDetails.map((user) => (
                <div key={user._id} className="border p-3 rounded flex items-center gap-3">
                  {user.profile_pic?.Location && (
                    <Image 
                      src={user.profile_pic.Location} 
                      alt={user.username}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  )}
                  <div>
                    <p><span className="font-medium">Username:</span> {user.username}</p>
                    <p><span className="font-medium">Email:</span> {user.email}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No participants found</p>
          )}
        </div>
        
        {/* Bet Information */}
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-bold mb-2">Bet Information</h2>
          {gameDetails.bets?.userDetails && gameDetails.bets.userDetails.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">User Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {gameDetails.bets.userDetails.map((user) => (
                  <div key={user._id} className="border p-3 rounded flex items-center gap-3">
                    {user.profile_pic?.Location && (
                      <Image 
                        src={user.profile_pic.Location} 
                        alt={user.username}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    )}
                    <div>
                      <p><span className="font-medium">Username:</span> {user.username}</p>
                      <p><span className="font-medium">Email:</span> {user.email}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <h3 className="text-lg font-semibold mt-4">Transaction Details</h3>
              {gameDetails.bets.transactionDetails && gameDetails.bets.transactionDetails.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="py-2 px-4 text-left">Transaction ID</th>
                        <th className="py-2 px-4 text-left">Amount</th>
                        <th className="py-2 px-4 text-left">Status</th>
                        <th className="py-2 px-4 text-left">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gameDetails.bets.transactionDetails.map((transaction, index) => (
                        <tr key={index} className="border-t">
                          <td className="py-2 px-4">{transaction._id}</td>
                          <td className="py-2 px-4">{transaction.amount}</td>
                          <td className="py-2 px-4">{transaction.status}</td>
                          <td className="py-2 px-4">{new Date(transaction.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p>No transaction details available</p>
              )}
            </div>
          ) : (
            <p>No bet information available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameDetailsPage; 