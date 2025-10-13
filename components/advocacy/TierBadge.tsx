'use client';

/**
 * Tier Badge Component
 *
 * Displays user's current advocacy tier
 */

import { ADVOCACY_TIERS, type AdvocacyTier } from '@/lib/config/advocacyTiers';

interface TierBadgeProps {
  tierId: string;
  size?: 'sm' | 'md' | 'lg';
  showTitle?: boolean;
}

export function TierBadge({ tierId, size = 'md', showTitle = true }: TierBadgeProps) {
  const tier = ADVOCACY_TIERS[tierId] || ADVOCACY_TIERS.starter;

  const sizeClasses = {
    sm: 'text-sm px-2 py-1',
    md: 'text-base px-3 py-1.5',
    lg: 'text-lg px-4 py-2',
  };

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full font-semibold ${sizeClasses[size]}`}
      style={{
        backgroundColor: `${tier.color}20`,
        color: tier.color,
        border: `2px solid ${tier.color}`,
      }}
    >
      <span className="text-xl">{tier.badge}</span>
      {showTitle && <span>{tier.title}</span>}
    </div>
  );
}
