/**
 * Advocate Dashboard Page
 *
 * Shows user's advocacy stats and impact
 */

'use client';

import { useState } from 'react';
import { ImpactStats } from '@/components/advocacy/ImpactStats';
import { ShareButtons } from '@/components/advocacy/ShareButtons';
import { ADVOCACY_TIERS } from '@/lib/config/advocacyTiers';
import Link from 'next/link';

export default function AdvocatePage() {
  const [email, setEmail] = useState('');
  const [showStats, setShowStats] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setShowStats(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Advocacy Dashboard 🌱
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Track your impact in the movement for fair ticketing
          </p>
        </div>

        {!showStats ? (
          /* Email Entry Form */
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-4">Check Your Impact</h2>
            <p className="text-gray-600 mb-6">
              Enter your email to see your advocacy stats and progress
            </p>

            <form onSubmit={handleSubmit} className="flex gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                View Stats
              </button>
            </form>
          </div>
        ) : (
          /* Stats Display */
          <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Your Advocacy Impact</h2>
                  <p className="text-gray-600">{email}</p>
                </div>
                <button
                  onClick={() => setShowStats(false)}
                  className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                >
                  Change Email
                </button>
              </div>

              <ImpactStats email={email} />
            </div>

            {/* Rewards Info */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6">Advocacy Tiers & Rewards</h2>
              <div className="space-y-4">
                {Object.values(ADVOCACY_TIERS).map((tier) => (
                  <div
                    key={tier.id}
                    className="border-l-4 pl-4 py-2"
                    style={{ borderColor: tier.color }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{tier.badge}</span>
                      <span className="font-semibold text-lg">{tier.title}</span>
                      <span className="text-sm text-gray-500">
                        ({tier.threshold}+ advocacies)
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{tier.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {tier.rewards.map((reward, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-1 rounded-full"
                          style={{
                            backgroundColor: `${tier.color}20`,
                            color: tier.color,
                          }}
                        >
                          {reward}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Share Section */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg p-8 text-white">
              <h2 className="text-2xl font-bold mb-4">Spread the Word</h2>
              <p className="mb-6 opacity-90">
                Help us grow the movement for fair ticketing. Share with friends who care about
                music, artists, and fair pricing.
              </p>
              <ShareButtons
                url="https://unchained.tickets/advocate"
                title="Join the Fair Ticketing Movement"
                text="I'm advocating for fair ticketing with Unchained. No hidden fees, NFT protection, and fan rewards. Join me!"
              />
            </div>

            {/* CTA */}
            <div className="text-center">
              <Link
                href="/advocate/leaderboard"
                className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                View Global Leaderboard →
              </Link>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-12 bg-purple-50 border border-purple-200 rounded-xl p-6">
          <h3 className="font-semibold text-purple-900 mb-2">How Advocacy Works</h3>
          <ul className="text-sm text-purple-800 space-y-2">
            <li>• Find events on external platforms (Ticketmaster, etc.)</li>
            <li>• Sign up to advocate and we'll email the venue on your behalf</li>
            <li>• Track your impact and unlock rewards as you advocate</li>
            <li>• Help venues understand that fans want fair ticketing</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
