'use client'

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { useSession } from "next-auth/react"
import { useToast } from "@/components/ui/use-toast"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface TransactionItem {
  name: string;
  odds: number;
  _id: string;
}

interface UserDetails {
  _id: string;
  username: string;
  profile_pic?: {
    Location: string;
  };
}

interface Transaction {
  _id: string;
  userId: string;
  gameId: string;
  type: string;
  amount: number;
  status: string;
  adminApproved: boolean;
  item: string;
  createdAt: string;
  user_details?: UserDetails;
}

interface TransactionsResponse {
  data: {
    records: Transaction[];
    count: number;
  };
  message: string;
  success: boolean;
}

export default function TransactionsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/auth/signin?callbackUrl=/admin/transactions')
    },
  })

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://spinwin.shreyanshkataria.com'
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTransactions = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const token = session?.user?.authToken
      if (!token) {
        if (status === 'loading') return
        throw new Error("Authentication token not found. Please sign in again.")
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/admin/transaction-list?limit=10&page=1&status`, {
        headers: {
          Authorization: `${token}`,
          "Content-Type": "application/json",
          "Cache-Control": "no-cache"
        },
      })

      if (response.status === 401 || response.status === 403) {
        toast({
          title: "Authentication Error",
          description: "Your session has expired. Please sign in again.",
          variant: "destructive",
        })
        router.push('/auth/signin?callbackUrl=/admin/transactions')
        return
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch transactions: ${response.status}`)
      }

      const responseData: TransactionsResponse = await response.json()
      if (responseData.success && responseData.data?.records) {
        setTransactions(responseData.data.records)
      } else {
        setError('Unexpected API response format')
      }
    } catch (error) {
      console.error("Error fetching transactions:", error)
      setError(error instanceof Error ? error.message : "Failed to load transactions")
    } finally {
      setIsLoading(false)
    }
  }, [session, status, router, toast, API_BASE_URL])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchTransactions()
    }
  }, [status, fetchTransactions])

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
        <h1 className="text-3xl font-bold">Transactions</h1>
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
          <p className="ml-2">Loading transactions...</p>
        </div>
      ) : transactions.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-gray-500">No transactions found.</p>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Admin Approved</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => {
                const item: TransactionItem = JSON.parse(transaction.item || '{}')
                const username = transaction.user_details?.username || "Unknown"
                return (
                  <TableRow key={transaction._id}>
                    <TableCell>
                      <div className="text-black">{username}</div>
                    </TableCell>
                    <TableCell>
                      <div className="capitalize text-black">{transaction.type}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-black">${transaction.amount.toFixed(2)}</div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-sm ${
                        transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                        transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {transaction.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="text-black">{item.name} (x{item.odds})</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-black">{new Date(transaction.createdAt).toLocaleString()}</div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-sm ${
                        transaction.adminApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {transaction.adminApproved ? 'Yes' : 'No'}
                      </span>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
