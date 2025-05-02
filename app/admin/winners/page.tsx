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

      const response = await fetch(`${API_BASE_URL}/api/v1/admin/game-list?limit=10&page=1&status`, {
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
        setGames(responseData.data.records);
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

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Games List</h1>
      
      {loading ? (
        <div className="flex justify-center">
          <p>Loading games...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
          <p>{error}</p>
        </div>
      ) : games.length === 0 ? (
        <p>No games found</p>
      ) : (
        <div className="grid gap-4">
          {games.map((game) => (
            <div 
              key={game._id} 
              className="border rounded-lg p-4 cursor-pointer"
              onClick={() => handleViewWinners(game._id)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Game ID: {game._id}</p>
                  <p>Round: {game.round}</p>
                  <p>Status: {game.status}</p>
                  <p>Created: {new Date(game.createdAt).toLocaleDateString()}</p>
                </div>
                <button 
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewWinners(game._id);
                  }}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WinnersPage;
