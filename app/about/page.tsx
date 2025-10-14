import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-ink-900 to-ink-800">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="noise-overlay absolute inset-0 opacity-30"></div>
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
            <h1 className="brand-heading text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-resistance-500 via-hack-green to-acid-400 bg-clip-text text-transparent">
              About Unchained
            </h1>
            <p className="text-xl md:text-2xl text-grit-300 max-w-3xl mx-auto">
              We're building the future of live music ticketing—transparent, fair, and powered by blockchain technology.
            </p>
          </div>
        </div>

        {/* Mission Section */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-ink-800/50 border border-grit-500/30 rounded-xl p-8 mb-12">
            <h2 className="brand-heading text-3xl font-bold mb-6 text-bone-100">Our Mission</h2>
            <p className="text-lg text-grit-300 mb-4">
              The live music industry has been held hostage by monopolistic ticketing platforms that extract excessive fees, scalp tickets through their own services, and provide zero transparency to fans.
            </p>
            <p className="text-lg text-grit-300">
              Unchained Tickets is here to change that. We use blockchain technology to create NFT tickets that are truly yours—collectible, transferable, and fraud-proof. Artists get paid fairly, fans get transparency, and venues get a platform that works for them.
            </p>
          </div>

          {/* Values Grid */}
          <h2 className="brand-heading text-3xl font-bold mb-8 text-center bg-gradient-to-r from-resistance-500 to-acid-400 bg-clip-text text-transparent">
            Our Values
          </h2>
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            <div className="bg-ink-800/50 border border-grit-500/30 rounded-xl p-6 hover:border-resistance-500/50 transition-all">
              <h3 className="text-xl font-bold mb-3 text-bone-100">💪 Fan Empowerment</h3>
              <p className="text-grit-300">
                Your ticket is an NFT. You own it, you can transfer it, and it becomes a collectible memory of the show.
              </p>
            </div>

            <div className="bg-ink-800/50 border border-grit-500/30 rounded-xl p-6 hover:border-hack-green/50 transition-all">
              <h3 className="text-xl font-bold mb-3 text-bone-100">🎯 Transparency</h3>
              <p className="text-grit-300">
                No hidden fees. Every transaction on the blockchain is visible. You see exactly where your money goes.
              </p>
            </div>

            <div className="bg-ink-800/50 border border-grit-500/30 rounded-xl p-6 hover:border-acid-400/50 transition-all">
              <h3 className="text-xl font-bold mb-3 text-bone-100">🎨 Artist Support</h3>
              <p className="text-grit-300">
                Direct payments to artists with smart contracts. No intermediaries taking unnecessary cuts.
              </p>
            </div>

            <div className="bg-ink-800/50 border border-grit-500/30 rounded-xl p-6 hover:border-resistance-500/50 transition-all">
              <h3 className="text-xl font-bold mb-3 text-bone-100">🔒 Security</h3>
              <p className="text-grit-300">
                Blockchain technology makes ticket fraud virtually impossible. Your tickets are safe and verifiable.
              </p>
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-ink-800/50 border border-grit-500/30 rounded-xl p-8 mb-12">
            <h2 className="brand-heading text-3xl font-bold mb-6 text-bone-100">How It Works</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-resistance-500 flex items-center justify-center text-bone-100 font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-bone-100 mb-1">Browse Events</h4>
                  <p className="text-grit-300">Find shows from your favorite artists and venues on our platform.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-hack-green flex items-center justify-center text-ink-900 font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-bone-100 mb-1">Buy Tickets as NFTs</h4>
                  <p className="text-grit-300">Purchase tickets with crypto or card. Each ticket is minted as an NFT on the Base blockchain.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-acid-400 flex items-center justify-center text-ink-900 font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-bone-100 mb-1">Attend & Collect</h4>
                  <p className="text-grit-300">Show your NFT ticket at the door. After the show, it becomes a collectible memory.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Join the Resistance CTA */}
          <div className="bg-gradient-to-r from-resistance-500/20 to-acid-400/20 border border-resistance-500/50 rounded-xl p-8 text-center">
            <h2 className="brand-heading text-3xl font-bold mb-4 bg-gradient-to-r from-resistance-500 via-hack-green to-acid-400 bg-clip-text text-transparent">
              Join the Resistance
            </h2>
            <p className="text-lg text-grit-300 mb-6 max-w-2xl mx-auto">
              Help us bring fair ticketing to venues everywhere. Advocate for change and track your impact.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/advocate"
                className="px-8 py-4 bg-resistance-500 hover:brightness-110 text-bone-100 rounded-lg font-semibold text-lg transition-all"
              >
                Start Advocating
              </Link>
              <Link
                href="/events"
                className="px-8 py-4 border-2 border-acid-400/60 text-acid-400 hover:bg-acid-400/10 rounded-lg font-semibold text-lg transition-all"
              >
                Browse Events
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
