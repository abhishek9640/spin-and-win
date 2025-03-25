"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useSession } from "next-auth/react"

export default function CreateGamePage() {
  const router = useRouter()
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/auth/signin?callbackUrl=/admin/games/create')
    },
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)
  
  const [gameData, setGameData] = useState({
    name: "Spin & Win Game",
    description: "Daily two-round spin and win game with numbers 1-9.",
    // List of wheel items with name (number) and odds
    items: [
      { name: 1, odds: 1 },
      { name: 2, odds: 2 },
      { name: 3, odds: 3 },
      { name: 4, odds: 4 },
      { name: 5, odds: 5 },
      { name: 6, odds: 6 },
      { name: 7, odds: 7 },
      { name: 8, odds: 8 },
      { name: 9, odds: 9 }
    ],
    // The following fields are for the UI only and won't be sent to the API
    uiConfig: {
      minBet: 1,
      maxBet: 100,
      gameDate: getTomorrowDate(),
      round1StartTime: "12:00",
      round1Duration: 12,
      round2StartTime: "00:00",
      round2Duration: 12,
      allowMultipleNumbersInRound1: true,
      allowOnlyOneNumberInRound2: true,
      noWinnerScenario: true,
    }
  })

  // If session is loading, show loading state
  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        <p className="ml-2">Loading session...</p>
      </div>
    )
  }

  // Helper function to get tomorrow's date in YYYY-MM-DD format
  function getTomorrowDate() {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    if (name.startsWith('uiConfig.')) {
      const configName = name.split('.')[1]
      setGameData(prev => ({
        ...prev,
        uiConfig: {
          ...prev.uiConfig,
          [configName]: value
        }
      }))
    } else {
      setGameData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (name.startsWith('uiConfig.')) {
      const configName = name.split('.')[1]
      setGameData(prev => ({
        ...prev,
        uiConfig: {
          ...prev.uiConfig,
          [configName]: parseFloat(value)
        }
      }))
    } else {
      setGameData(prev => ({
        ...prev,
        [name]: parseFloat(value)
      }))
    }
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    if (name.startsWith('uiConfig.')) {
      const configName = name.split('.')[1]
      setGameData(prev => ({
        ...prev,
        uiConfig: {
          ...prev.uiConfig,
          [configName]: checked
        }
      }))
    } else {
      setGameData(prev => ({
        ...prev,
        [name]: checked
      }))
    }
  }

  const handleItemChange = (index: number, field: 'name' | 'odds', value: string) => {
    const newItems = [...gameData.items]
    newItems[index] = { 
      ...newItems[index], 
      [field]: field === 'name' ? parseInt(value) : parseFloat(value) 
    }
    setGameData(prev => ({
      ...prev,
      items: newItems
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!session) {
      setFormError("You must be logged in to create a game")
      return
    }
    
    setIsSubmitting(true)
    setFormError(null)
    setFormSuccess(null)

    // Create API payload with only the fields the API expects
    const apiPayload = {
      items: gameData.items
    }

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

    try {
      const token = session.user.authToken
      if (!token) {
        throw new Error("Authentication token not found")
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/admin/create-game`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `${token}`,
        },
        body: JSON.stringify(apiPayload),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to create game")
      }

      setFormSuccess("Game created successfully!")
      // Reset form or redirect
      setTimeout(() => {
        router.push("/admin/games")
      }, 2000)
    } catch (error) {
      console.error("Error creating game:", error)
      setFormError(error instanceof Error ? error.message : "An unknown error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Create New Game</h1>
        <Button onClick={() => router.push("/admin/games")}>Back to Games</Button>
      </div>

      <Card className="p-6">
        {formError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {formError}
          </div>
        )}
        
        {formSuccess && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {formSuccess}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Add a session info display */}
          <div className="bg-gray-50 p-3 rounded text-sm text-gray-600 mb-4">
            Logged in as: {session ? 'Authenticated User' : 'Not authenticated'}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Game Name</Label>
              <Input 
                id="name" 
                name="name" 
                value={gameData.name} 
                onChange={handleInputChange} 
                required 
                placeholder="Enter game name"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                name="description" 
                value={gameData.description} 
                onChange={handleInputChange} 
                rows={3}
                placeholder="Enter game description"
              />
            </div>
          </div>

          {/* Wheel Items Configuration */}
          <div className="border p-4 rounded-lg space-y-4">
            <h3 className="text-lg font-medium">Wheel Items Configuration</h3>
            <p className="text-sm text-gray-500 mb-4">
              Configure the numbers on the wheel and their respective odds. These are the only values that will be sent to the server.
            </p>
            
            <div className="grid grid-cols-1 gap-4">
              {gameData.items.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
                  <div className="space-y-2">
                    <Label htmlFor={`item-name-${index}`}>Number</Label>
                    <Input 
                      id={`item-name-${index}`} 
                      type="number" 
                      value={item.name} 
                      onChange={(e) => handleItemChange(index, 'name', e.target.value)} 
                      min="1" 
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`item-odds-${index}`}>Odds</Label>
                    <Input 
                      id={`item-odds-${index}`} 
                      type="number" 
                      value={item.odds} 
                      onChange={(e) => handleItemChange(index, 'odds', e.target.value)} 
                      min="1"
                      step="0.1" 
                      required
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* UI Configuration (Not sent to API) */}
          <div className="border p-4 rounded-lg space-y-4">
            <h3 className="text-lg font-medium">UI Configuration Settings (Not sent to API)</h3>
            <p className="text-sm text-gray-500 mb-4">
              These settings are for display purposes only and won&apos;t be sent to the server. They can help guide your game setup.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="uiConfig.minBet">Minimum Bet</Label>
                <Input 
                  id="uiConfig.minBet" 
                  name="uiConfig.minBet" 
                  type="number" 
                  value={gameData.uiConfig.minBet} 
                  onChange={handleNumberChange} 
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="uiConfig.maxBet">Maximum Bet</Label>
                <Input 
                  id="uiConfig.maxBet" 
                  name="uiConfig.maxBet" 
                  type="number" 
                  value={gameData.uiConfig.maxBet} 
                  onChange={handleNumberChange} 
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="uiConfig.gameDate">Game Date</Label>
                <Input 
                  id="uiConfig.gameDate" 
                  name="uiConfig.gameDate" 
                  type="date" 
                  value={gameData.uiConfig.gameDate} 
                  onChange={handleInputChange} 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="uiConfig.round1StartTime">Round 1 Start Time</Label>
                <Input 
                  id="uiConfig.round1StartTime" 
                  name="uiConfig.round1StartTime" 
                  type="time" 
                  value={gameData.uiConfig.round1StartTime} 
                  onChange={handleInputChange} 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="uiConfig.round1Duration">Round 1 Duration (hours)</Label>
                <Input 
                  id="uiConfig.round1Duration" 
                  name="uiConfig.round1Duration" 
                  type="number" 
                  value={gameData.uiConfig.round1Duration} 
                  onChange={handleNumberChange} 
                  min="1"
                  max="24"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="uiConfig.round2StartTime">Round 2 Start Time</Label>
                <Input 
                  id="uiConfig.round2StartTime" 
                  name="uiConfig.round2StartTime" 
                  type="time" 
                  value={gameData.uiConfig.round2StartTime} 
                  onChange={handleInputChange} 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="uiConfig.round2Duration">Round 2 Duration (hours)</Label>
                <Input 
                  id="uiConfig.round2Duration" 
                  name="uiConfig.round2Duration" 
                  type="number" 
                  value={gameData.uiConfig.round2Duration} 
                  onChange={handleNumberChange} 
                  min="1"
                  max="24"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 mt-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="uiConfig.allowMultipleNumbersInRound1"
                  name="uiConfig.allowMultipleNumbersInRound1"
                  checked={gameData.uiConfig.allowMultipleNumbersInRound1}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="uiConfig.allowMultipleNumbersInRound1">Allow players to bet on multiple numbers in Round 1</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="uiConfig.allowOnlyOneNumberInRound2"
                  name="uiConfig.allowOnlyOneNumberInRound2"
                  checked={gameData.uiConfig.allowOnlyOneNumberInRound2}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="uiConfig.allowOnlyOneNumberInRound2">Allow players to bet on only one number in Round 2</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="uiConfig.noWinnerScenario"
                  name="uiConfig.noWinnerScenario"
                  checked={gameData.uiConfig.noWinnerScenario}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="uiConfig.noWinnerScenario">If spinner lands on a number no one selected, everyone loses</Label>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting || status !== "authenticated"} className="w-full md:w-auto">
              {isSubmitting ? "Creating..." : "Create Game"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
} 