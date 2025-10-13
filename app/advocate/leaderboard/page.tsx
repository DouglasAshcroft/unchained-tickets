/**
 * Advocacy Leaderboard Page
 *
 * Shows top advocates globally
 */

'use client';

import { useEffect, useState } from 'react';
import { TierBadge } from '@/components/advocacy/TierBadge';
import Link from 'next/link';
import type { LeaderboardEntry } from '@/lib/types/advocacy';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/advocacy/leaderboard?limit=50');
      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link
            href="/advocate"
            className="text-purple-600 hover:text-purple-700 text-sm font-medium mb-4 inline-block"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Global Leaderboard 🏆
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Top advocates making waves in the fair ticketing movement
          </p>
        </div>

        {/* Leaderboard */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              <div className="animate-pulse">Loading leaderboard...</div>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No advocates yet. Be the first!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Advocate
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tier
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Advocacies
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {leaderboard.map((entry) => (
                    <tr
                      key={entry.rank}
                      className={
                        entry.rank <= 3
                          ? 'bg-gradient-to-r from-yellow-50 to-amber-50'
                          : 'hover:bg-gray-50'
                      }
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {entry.rank === 1 && (
                            <span className="text-2xl mr-2">🥇</span>
                          )}
                          {entry.rank === 2 && (
                            <span className="text-2xl mr-2">🥈</span>
                          )}
                          {entry.rank === 3 && (
                            <span className="text-2xl mr-2">🥉</span>
                          )}
                          <span className="text-sm font-medium text-gray-900">
                            #{entry.rank}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {entry.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <TierBadge tierId={entry.currentTier} size="sm" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm font-bold text-purple-600">
                          {entry.advocacyCount}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Stats Summary */}
        {leaderboard.length > 0 && (
          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-1">
                {leaderboard.length}
              </div>
              <div className="text-sm text-gray-600">Total Advocates</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {leaderboard.reduce((sum, entry) => sum + entry.advocacyCount, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Advocacies</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {leaderboard[0]?.advocacyCount || 0}
              </div>
              <div className="text-sm text-gray-600">Top Advocate</div>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Want to climb the ranks?</h2>
          <p className="mb-6 opacity-90 max-w-2xl mx-auto">
            Start advocating for fair ticketing at your favorite venues. Every voice matters in
            building a better music industry.
          </p>
          <Link
            href="/events"
            className="inline-block px-6 py-3 bg-white text-purple-600 rounded-lg hover:bg-gray-100 transition-colors font-medium"
          >
            Browse Events
          </Link>
        </div>
      </div>
    </div>
  );
}
