/**
 * Advocacy Leaderboard Page
 *
 * Shows top advocates globally
 */

//TODO Global Leaderboard is mocked and fixed - this needs to be tied to actual user stats from the database

"use client";

import { useEffect, useState } from "react";
import { TierBadge } from "@/components/advocacy/TierBadge";

import Link from "next/link";
import type { LeaderboardEntry } from "@/lib/types/advocacy";

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch("/api/advocacy/leaderboard?limit=50");
      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data);
      }
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-ink-900 to-ink-800">
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12 max-w-5xl">
          {/* Header */}
          <div className="text-center mb-8">
            <Link
              href="/profile"
              className="text-acid-400 hover:brightness-110 text-sm font-medium mb-4 inline-block transition-all"
            >
              ← Back to Profile
            </Link>
            <h1 className="brand-heading text-4xl font-bold mb-4 bg-gradient-to-r from-resistance-500 via-hack-green to-acid-400 bg-clip-text text-transparent">
              Global Leaderboard 🏆
            </h1>
            <p className="text-lg text-grit-300 max-w-2xl mx-auto">
              Top Resistance members fighting to overthrow the status quo
            </p>
          </div>

          {/* Leaderboard */}
          <div className="bg-ink-800/50 border border-grit-500/30 rounded-xl overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-grit-500">
                <div className="animate-pulse">Loading leaderboard...</div>
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="p-8 text-center text-grit-500">
                Be the first to support the cause!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-ink-700 border-b border-grit-500/30">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-grit-400 uppercase tracking-wider">
                        Rank
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-grit-400 uppercase tracking-wider">
                        Advocate
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-grit-400 uppercase tracking-wider">
                        Tier
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-grit-400 uppercase tracking-wider">
                        Advocacies
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-grit-500/30">
                    {leaderboard.map((entry) => (
                      <tr
                        key={entry.rank}
                        className={
                          entry.rank <= 3
                            ? "bg-gradient-to-r from-resistance-500/10 to-acid-400/10"
                            : "hover:bg-ink-700/50"
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
                            <span className="text-sm font-medium text-bone-100">
                              #{entry.rank}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-bone-100">
                            {entry.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <TierBadge tierId={entry.currentTier} size="sm" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="text-sm font-bold text-resistance-500">
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
              <div className="bg-ink-800/50 border border-grit-500/30 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-resistance-500 mb-1">
                  {leaderboard.length}
                </div>
                <div className="text-sm text-grit-400">Total Advocates</div>
              </div>
              <div className="bg-ink-800/50 border border-grit-500/30 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-acid-400 mb-1">
                  {leaderboard.reduce(
                    (sum, entry) => sum + entry.advocacyCount,
                    0
                  )}
                </div>
                <div className="text-sm text-grit-400">Total Advocacies</div>
              </div>
              <div className="bg-ink-800/50 border border-grit-500/30 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-hack-green mb-1">
                  {leaderboard[0]?.advocacyCount || 0}
                </div>
                <div className="text-sm text-grit-400">Top Advocate</div>
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="mt-8 bg-gradient-to-r from-resistance-500 to-acid-400 rounded-xl p-8 text-ink-900 text-center">
            <h2 className="text-2xl font-bold mb-4">
              Want to climb the ranks?
            </h2>
            <p className="mb-6 opacity-90 max-w-2xl mx-auto">
              Start messaging your favorite venues for better ticketing. Your
              voice matters in building a better music industry.
            </p>
            <Link
              href="/events"
              className="inline-block px-6 py-3 bg-ink-900 text-bone-100 rounded-lg hover:bg-ink-800 transition-all font-medium"
            >
              Browse Events
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
