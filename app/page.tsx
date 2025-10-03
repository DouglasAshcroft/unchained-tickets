import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Join the Resistance
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-gray-400 max-w-3xl mx-auto">
                Experience live music like never before. Buy tickets as NFTs, own your memories, and support artists directly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/events"
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-lg transition-colors"
                >
                  Explore Events
                </Link>
                <Link
                  href="/about"
                  className="px-8 py-4 border border-white/20 hover:border-white/40 rounded-lg font-semibold text-lg transition-colors"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">🎫</div>
              <h3 className="text-xl font-bold mb-2">NFT Tickets</h3>
              <p className="text-gray-400">
                Your tickets are NFTs - collectible, transferable, and truly yours
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">⛓️</div>
              <h3 className="text-xl font-bold mb-2">Blockchain Powered</h3>
              <p className="text-gray-400">
                Built on Base for fast, secure, and low-cost transactions
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-xl font-bold mb-2">Support Artists</h3>
              <p className="text-gray-400">
                Direct payments to artists, no middlemen taking cuts
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
