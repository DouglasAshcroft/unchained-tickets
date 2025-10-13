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
        <div className="h-20 bg-gray-200 rounded-lg"></div>
        <div className="h-20 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8 text-gray-500">
        No advocacy activity yet. Be the first to advocate!
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Tier */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Your Impact Level</h3>
          <TierBadge tierId={stats.currentTier} size="lg" />
        </div>

        {stats.tierProgress.next && (
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress to {stats.tierProgress.next}</span>
              <span>{stats.tierProgress.remaining} more to go</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-full transition-all duration-500 rounded-full"
                style={{ width: `${stats.tierProgress.progress}%` }}
              />
            </div>
          </div>
        )}

        {!stats.tierProgress.next && (
          <p className="text-purple-700 font-medium">
            🎉 Maximum tier achieved! You&apos;re a legend!
          </p>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-3xl font-bold text-purple-600 mb-1">
            {stats.advocacyCount}
          </div>
          <div className="text-sm text-gray-600">Total Advocacies</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-3xl font-bold text-blue-600 mb-1">
            {stats.totalVenuesReached}
          </div>
          <div className="text-sm text-gray-600">Venues Reached</div>
        </div>
      </div>

      {/* Estimated Impact */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-semibold text-green-900 mb-2">Your Estimated Impact</h4>
        <p className="text-sm text-green-700">
          You&apos;ve helped generate awareness worth approximately{' '}
          <span className="font-bold">${(stats.advocacyCount * 25).toFixed(2)}</span> in
          grassroots marketing value for fair ticketing.
        </p>
      </div>
    </div>
  );
}
