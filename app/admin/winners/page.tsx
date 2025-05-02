'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useToast } from '@/components/ui/use-toast';

interface Item {
  name: string;
  odds: number;
  _id: string;
}

interface Winner {
  userId: string;
  item: Item;
  amountWon: number;
  _id: string;
}

interface Game {
  _id: string;
  round: number;
  status: string;
  createdAt: string;
  items: Item[];
  winning_items: Item[];
  winners: Winner;
}

interface GamesResponse {
  status: string;
  message: string;
  data: {
    records: Game[];
    totalRecords: number;
    totalPages: number;
    currentPage: number;
  };
}

const WinnersPage = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const router = useRouter();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const { data: session, status } = useSession();
  const { toast } = useToast();

  const fetchGames = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = session?.user?.authToken;

      if (!token) {
        if (status === 'loading') return;
        throw new Error("Authentication token not found. Please sign in again.");
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/admin/game-list?limit=50&page=1&status`, {
        headers: {
          "Authorization": `${token}`,
          "Content-Type": "application/json",
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
        throw new Error(`Failed to fetch games: ${response.status}`);
      }

      const responseData: GamesResponse = await response.json();

      if (responseData.data && responseData.data.records) {
        // Filter unique games by ID
        const uniqueGames = responseData.data.records.reduce<Game[]>((unique, game) => {
          // Check if the game ID already exists in our unique array
          const exists = unique.some(g => g._id === game._id);
          if (!exists) {
            unique.push(game);
          }
          return unique;
        }, []);
        
        setGames(uniqueGames);
      } else {
        setError('Unexpected API response format');
      }
    } catch (error) {
      console.error('Error fetching games:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to load games";
      setError(errorMessage);

      if (retryCount < 2 && status === 'authenticated') {
        setRetryCount(prev => prev + 1);
        setTimeout(() => fetchGames(), 1000);
      }
    } finally {
      if (status !== 'loading') setLoading(false);
    }
  }, [API_BASE_URL, router, retryCount, session, status, toast]);

  useEffect(() => {
    if (status === 'authenticated') fetchGames();
  }, [status, fetchGames]);

  const handleViewWinners = (gameId: string) => {
    router.push(`/admin/winners/${gameId}`);
  };

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'active':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 border-b pb-4">Games List</h1>
      
      {loading ? (
        <div className="flex justify-center items-center p-12">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mb-4"></div>
            <p className="text-gray-600">Loading games...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-6 rounded-md shadow-sm">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="font-medium">{error}</p>
          </div>
        </div>
      ) : games.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-600 text-lg">No games found</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {games.map((game) => {
            const hasWinners = Array.isArray(game.winners) && game.winners.length > 0;
            const statusStyle = getStatusStyle(game.status);
            
            return (
              <div 
                key={game._id} 
                className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
                onClick={() => handleViewWinners(game._id)}
              >
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyle}`}>
                        {game.status}
                      </span>
                      {hasWinners && (
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Has Winners
                        </span>
                      )}
                    </div>
                    
                    <div>
                      <p className="text-gray-500 text-sm mb-1">Game ID</p>
                      <p className=" text-sm text-gray-900">{game._id}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                      <div>
                        <p className="text-gray-500 text-sm">Round</p>
                        <p className="font-medium text-gray-900">{game.round}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">Date</p>
                        <p className="font-medium text-gray-900">{new Date(game.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">Items</p>
                        <p className="font-medium text-gray-900">{Array.isArray(game.items) ? game.items.length : 0}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">Winning Items</p>
                        <p className="font-medium text-gray-900">{Array.isArray(game.winning_items) ? game.winning_items.length : 0}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="md:self-center flex md:block">
                    <button 
                      className="bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2 rounded-md font-medium transition duration-200 flex items-center ml-auto"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewWinners(game._id);
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WinnersPage;
