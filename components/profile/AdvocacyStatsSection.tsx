'use client';

import Link from 'next/link';

interface AdvocacyStatsSectionProps {
  stats: {
    advocacyCount: number;
    totalVenuesReached: number;
    currentTier: number;
  };
}

const TIER_INFO = [
  { tier: 1, name: 'Supporter', min: 0, max: 4, color: 'gray' },
  { tier: 2, name: 'Advocate', min: 5, max: 9, color: 'blue' },
  { tier: 3, name: 'Champion', min: 10, max: 19, color: 'purple' },
  { tier: 4, name: 'Legend', min: 20, max: Infinity, color: 'gold' },
];

export function AdvocacyStatsSection({ stats }: AdvocacyStatsSectionProps) {
  const currentTierInfo = TIER_INFO.find((t) => t.tier === stats.currentTier) || TIER_INFO[0];
  const nextTierInfo = TIER_INFO[stats.currentTier] || null;
  const progressToNext = nextTierInfo
    ? ((stats.advocacyCount - currentTierInfo.min) /
        (nextTierInfo.min - currentTierInfo.min)) *
      100
    : 100;

  const getTierColor = (color: string) => {
    const colors: Record<string, string> = {
      gray: 'bg-gray-600',
      blue: 'bg-blue-600',
      purple: 'bg-purple-600',
      gold: 'bg-yellow-500',
    };
    return colors[color] || 'bg-gray-600';
  };

  const getProgressBarColor = (color: string) => {
    const colors: Record<string, string> = {
      gray: 'bg-gray-500',
      blue: 'bg-blue-500',
      purple: 'bg-purple-500',
      gold: 'bg-yellow-400',
    };
    return colors[color] || 'bg-gray-500';
  };

  return (
    <div className="space-y-6">
      {/* Current Tier */}
      <div className="bg-ink-800/50 border border-grit-500/30 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-6 text-bone-100">Advocacy Status</h2>

        <div className="text-center mb-8">
          <div
            className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${getTierColor(
              currentTierInfo.color
            )} mb-4`}
          >
            <span className="text-3xl font-bold text-bone-100">{stats.currentTier}</span>
          </div>
          <h3 className="text-2xl font-bold mb-2 text-bone-100">{currentTierInfo.name}</h3>
          <p className="text-grit-400">Tier {stats.currentTier} Advocate</p>
        </div>

        {/* Progress to Next Tier */}
        {nextTierInfo && (
          <div className="mb-8">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-grit-400">
                {stats.advocacyCount} / {nextTierInfo.min} advocacy actions
              </span>
              <span className="text-grit-400">
                Next: {nextTierInfo.name} (Tier {nextTierInfo.tier})
              </span>
            </div>
            <div className="w-full bg-ink-700 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${getProgressBarColor(
                  nextTierInfo.color
                )}`}
                style={{ width: `${Math.min(progressToNext, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-ink-700 border border-grit-500/30 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-resistance-500">{stats.advocacyCount}</p>
            <p className="text-sm text-grit-400 mt-1">Total Advocacy Actions</p>
          </div>
          <div className="bg-ink-700 border border-grit-500/30 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-resistance-500">{stats.totalVenuesReached}</p>
            <p className="text-sm text-grit-400 mt-1">Venues Reached</p>
          </div>
        </div>
      </div>

      {/* How it Works */}
      <div className="bg-ink-800/50 border border-grit-500/30 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-bone-100">How Advocacy Works</h3>
        <div className="space-y-3 text-sm text-bone-100">
          <div className="flex items-start">
            <span className="text-resistance-500 mr-3">•</span>
            <p>
              <strong>Advocate for venues</strong> you want to see on Unchained Tickets
            </p>
          </div>
          <div className="flex items-start">
            <span className="text-resistance-500 mr-3">•</span>
            <p>
              Each advocacy action counts toward your <strong>tier progression</strong>
            </p>
          </div>
          <div className="flex items-start">
            <span className="text-resistance-500 mr-3">•</span>
            <p>
              Higher tiers unlock <strong>exclusive benefits</strong> and early access
            </p>
          </div>
          <div className="flex items-start">
            <span className="text-resistance-500 mr-3">•</span>
            <p>
              Help us grow the network of <strong>crypto-friendly venues</strong>
            </p>
          </div>
        </div>

        <Link
          href="/advocate"
          className="mt-6 block w-full py-3 bg-resistance-500 hover:brightness-110 rounded-lg text-center font-medium transition-all text-bone-100"
        >
          Continue Advocating
        </Link>
      </div>

      {/* Tier Breakdown */}
      <div className="bg-ink-800/50 border border-grit-500/30 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-bone-100">All Tiers</h3>
        <div className="space-y-3">
          {TIER_INFO.map((tier) => (
            <div
              key={tier.tier}
              className={`flex items-center justify-between p-3 rounded-lg ${
                tier.tier === stats.currentTier ? 'bg-ink-700 ring-2 ring-resistance-500' : 'bg-ink-700/50 border border-grit-500/30'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-10 h-10 rounded-full ${getTierColor(
                    tier.color
                  )} flex items-center justify-center font-bold text-bone-100`}
                >
                  {tier.tier}
                </div>
                <div>
                  <p className="font-medium text-bone-100">{tier.name}</p>
                  <p className="text-xs text-grit-400">
                    {tier.max === Infinity ? `${tier.min}+ actions` : `${tier.min}-${tier.max} actions`}
                  </p>
                </div>
              </div>
              {tier.tier === stats.currentTier && (
                <span className="px-3 py-1 bg-resistance-500 text-bone-100 text-xs rounded-full">
                  Current
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
