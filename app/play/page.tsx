import { SpinGameUI } from "@/components/game/spin-game-ui"
import { Header } from "@/components/header"

export default function PlayPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <Header />
      <SpinGameUI />
    </div>
  )
}

