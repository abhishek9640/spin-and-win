import { Header } from "@/components/header"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Header />
      <div className="container py-20 px-4 md:px-6">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
          About Crypto Spin
        </h1>
        <div className="prose prose-invert max-w-none">
          <p className="text-zinc-400 text-lg leading-relaxed">
            Crypto Spin is a next-generation crypto gaming platform that combines the excitement of casino gaming with
            the security and transparency of blockchain technology. Our mission is to provide a fair, transparent, and
            entertaining gaming experience for crypto enthusiasts worldwide.
          </p>
          {/* Add more content as needed */}
        </div>
      </div>
    </div>
  )
}

