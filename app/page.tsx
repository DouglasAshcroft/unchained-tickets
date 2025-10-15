import Link from "next/link";
//TODO: Change layout, change adovcating CTA to fit branding, Maybe propoganda themed.
export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-ink-900 to-ink-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="brand-heading text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-resistance-500 via-hack-green to-acid-400 bg-clip-text text-transparent">
              Join the Resistance
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-grit-300 max-w-3xl mx-auto">
              Experience live music like never before. Buy tickets as NFTs, own
              your memories, and support artists directly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/events"
                className="px-8 py-4 bg-resistance-500 hover:brightness-110 text-ink-900 rounded-lg font-semibold text-lg transition-all"
              >
                Explore Events
              </Link>
              <Link
                href="/about"
                className="px-8 py-4 border-2 border-acid-400/60 text-acid-400 hover:bg-acid-400/10 rounded-lg font-semibold text-lg transition-all"
              >
                Learn More About Unchained
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="noise-overlay relative p-8 rounded-lg border border-grit-500/30 bg-ink-800/50 text-center hover:border-resistance-500/50 transition-all">
            <div className="text-4xl mb-4">🎫</div>
            <h3 className="brand-heading text-xl mb-2 text-bone-100">
              NFT Tickets
            </h3>
            <p className="text-grit-300">
              Your tickets are NFTs - collectible, transferable, and truly yours
            </p>
          </div>
          <div className="noise-overlay relative p-8 rounded-lg border border-grit-500/30 bg-ink-800/50 text-center hover:border-hack-green/50 transition-all">
            <div className="text-4xl mb-4">⛓️</div>
            <h3 className="brand-heading text-xl mb-2 text-bone-100">
              Blockchain Powered
            </h3>
            <p className="text-grit-300">
              Built on Base for fast, secure, and low-cost transactions
            </p>
          </div>
          <div className="noise-overlay relative p-8 rounded-lg border border-grit-500/30 bg-ink-800/50 text-center hover:border-acid-400/50 transition-all">
            <div className="text-4xl mb-4">🎨</div>
            <h3 className="brand-heading text-xl mb-2 text-bone-100">
              Support Artists
            </h3>
            <p className="text-grit-300">
              Direct payments to artists, no middlemen taking cuts
            </p>
          </div>
        </div>
      </div>

      {/* Join the Resistance CTA */}
      <div className="relative overflow-hidden bg-gradient-to-b from-ink-800 to-ink-900">
        <div className="noise-overlay absolute inset-0 opacity-30"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h2 className="brand-heading text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-resistance-500 via-hack-green to-acid-400 bg-clip-text text-transparent">
            How Can You Help?
          </h2>
          <p className="text-xl text-grit-300 mb-8 max-w-2xl mx-auto">
            Join the resistance against unfair ticketing. Help us bring
            transparent, fan-first ticketing to venues everywhere.
          </p>

          <div className="bg-ink-800/50 border border-resistance-500/30 rounded-xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-bone-100 mb-4">
              Join the Resistance
            </h3>
            <p className="text-grit-300 mb-6">
              Sign up to advocate for fair ticketing. We'll help you reach out
              to your favorite venues and track your impact.
            </p>

            <Link
              href="/advocate"
              className="inline-block px-8 py-4 bg-resistance-500 hover:brightness-110 text-bone-100 rounded-lg font-semibold text-lg transition-all"
            >
              Start Advocating →
            </Link>

            <p className="text-sm text-grit-400 mt-6">
              Already advocating?{" "}
              <Link
                href="/profile"
                className="text-acid-400 hover:brightness-110 transition-all"
              >
                Track your impact
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
