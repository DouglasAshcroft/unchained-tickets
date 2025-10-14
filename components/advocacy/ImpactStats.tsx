'use client';

/**
 * Impact Stats Component
 *
 * Displays advocacy impact statistics
 */

import { useEffect, useState, useCallback } from 'react';
import { TierBadge } from './TierBadge';

interface ImpactStatsProps {
  email: string;
}

interface Stats {
  advocacyCount: number;
  totalVenuesReached: number;
  currentTier: string;
  tierProgress: {
    current: string;
    next: string | null;
    progress: number;
    remaining: number;
  };
}

export function ImpactStats({ email }: ImpactStatsProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`/api/advocacy/stats/${encodeURIComponent(email)}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  }, [email]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-20 bg-ink-700 rounded-lg"></div>
        <div className="h-20 bg-ink-700 rounded-lg"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8 text-grit-500">
        No advocacy activity yet. Be the first to advocate!
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Tier */}
      <div className="bg-gradient-to-br from-resistance-500/10 to-acid-400/10 border border-resistance-500/30 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-bone-100">Your Impact Level</h3>
          <TierBadge tierId={stats.currentTier} size="lg" />
        </div>

        {stats.tierProgress.next && (
          <div>
            <div className="flex justify-between text-sm text-grit-400 mb-2">
              <span>Progress to {stats.tierProgress.next}</span>
              <span>{stats.tierProgress.remaining} more to go</span>
            </div>
            <div className="w-full bg-ink-700 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-resistance-500 to-acid-400 h-full transition-all duration-500 rounded-full"
                style={{ width: `${stats.tierProgress.progress}%` }}
              />
            </div>
          </div>
        )}

        {!stats.tierProgress.next && (
          <p className="text-hack-green font-medium">
            🎉 Maximum tier achieved! You&apos;re a legend!
          </p>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-ink-700 border border-grit-500/30 rounded-lg p-4">
          <div className="text-3xl font-bold text-resistance-500 mb-1">
            {stats.advocacyCount}
          </div>
          <div className="text-sm text-grit-400">Total Advocacies</div>
        </div>

        <div className="bg-ink-700 border border-grit-500/30 rounded-lg p-4">
          <div className="text-3xl font-bold text-acid-400 mb-1">
            {stats.totalVenuesReached}
          </div>
          <div className="text-sm text-grit-400">Venues Reached</div>
        </div>
      </div>

      {/* Estimated Impact */}
      <div className="bg-hack-green/10 border border-hack-green/30 rounded-lg p-4">
        <h4 className="font-semibold text-hack-green mb-2">Your Estimated Impact</h4>
        <p className="text-sm text-grit-300">
          You&apos;ve helped generate awareness worth approximately{' '}
          <span className="font-bold text-bone-100">${(stats.advocacyCount * 25).toFixed(2)}</span> in
          grassroots marketing value for fair ticketing.
        </p>
      </div>
    </div>
  );
}
