/**
 * Advocacy Tier Configuration
 *
 * Gamification system for advocacy actions
 */

// TODO: Review and adjust reward values for optimal conversion
// Consider A/B testing different tier thresholds and rewards

export interface AdvocacyTier {
  id: string;
  threshold: number;
  badge: string;
  title: string;
  description: string;
  rewards: string[];
  color: string;
}

export const ADVOCACY_TIERS: Record<string, AdvocacyTier> = {
  starter: {
    id: 'starter',
    threshold: 1,
    badge: '🌱',
    title: 'Advocate',
    description: 'Welcome to the movement! You\'ve sent your first advocacy email.',
    rewards: [
      'Exclusive newsletter updates',
      'Early access to new features',
    ],
    color: '#10b981', // green-500
  },
  activist: {
    id: 'activist',
    threshold: 5,
    badge: '⚡',
    title: 'Activist',
    description: 'You\'re making waves! 5 venues are hearing from fans.',
    rewards: [
      'Priority customer support',
      'Advocate profile badge',
      '5% future ticket discount',
    ],
    color: '#3b82f6', // blue-500
  },
  champion: {
    id: 'champion',
    threshold: 15,
    badge: '🔥',
    title: 'Champion',
    description: 'You\'re a force of change! 15 venues reached.',
    rewards: [
      'Featured on leaderboard',
      '10% future ticket discount',
      'Exclusive merch access',
      'Beta feature testing',
    ],
    color: '#f59e0b', // amber-500
  },
  legend: {
    id: 'legend',
    threshold: 50,
    badge: '👑',
    title: 'Legend',
    description: 'Legendary advocate! 50 venues are listening.',
    rewards: [
      'VIP community access',
      '15% future ticket discount',
      'Free event swag',
      'Monthly recognition',
      'Direct line to support',
    ],
    color: '#8b5cf6', // violet-500
  },
  revolutionary: {
    id: 'revolutionary',
    threshold: 100,
    badge: '🚀',
    title: 'Revolutionary',
    description: 'You\'re changing the industry! 100+ venues reached.',
    rewards: [
      'Lifetime recognition',
      '20% future ticket discount',
      'Annual free ticket',
      'Advisory board invitation',
      'Exclusive events access',
      'Partnership opportunities',
    ],
    color: '#ec4899', // pink-500
  },
};

/**
 * Calculate current tier based on advocacy count
 */
export function calculateTier(advocacyCount: number): AdvocacyTier {
  if (advocacyCount >= ADVOCACY_TIERS.revolutionary.threshold) {
    return ADVOCACY_TIERS.revolutionary;
  }
  if (advocacyCount >= ADVOCACY_TIERS.legend.threshold) {
    return ADVOCACY_TIERS.legend;
  }
  if (advocacyCount >= ADVOCACY_TIERS.champion.threshold) {
    return ADVOCACY_TIERS.champion;
  }
  if (advocacyCount >= ADVOCACY_TIERS.activist.threshold) {
    return ADVOCACY_TIERS.activist;
  }
  return ADVOCACY_TIERS.starter;
}

/**
 * Get progress to next tier
 */
export function getNextTierProgress(advocacyCount: number): {
  current: AdvocacyTier;
  next: AdvocacyTier | null;
  progress: number;
  remaining: number;
} {
  const current = calculateTier(advocacyCount);
  const tiers = Object.values(ADVOCACY_TIERS).sort((a, b) => a.threshold - b.threshold);
  const currentIndex = tiers.findIndex((t) => t.id === current.id);
  const next = currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : null;

  if (!next) {
    return {
      current,
      next: null,
      progress: 100,
      remaining: 0,
    };
  }

  const remaining = next.threshold - advocacyCount;
  const range = next.threshold - current.threshold;
  const progress = ((advocacyCount - current.threshold) / range) * 100;

  return {
    current,
    next,
    progress: Math.min(Math.max(progress, 0), 100),
    remaining,
  };
}
