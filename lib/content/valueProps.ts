/**
 * Reusable value proposition definitions
 * Used across multiple pages and components
 * DRY principle: Define once, use everywhere
 */

import { VALUE_PROPS, BASE_EDUCATION } from './baseMessaging';

// ============================================================================
// CORE VALUE PROPOSITIONS (for home page, about page, etc.)
// ============================================================================

export const CORE_VALUE_PROPS = [
  VALUE_PROPS.ownership,
  VALUE_PROPS.transparency,
  VALUE_PROPS.creators,
] as const;

// ============================================================================
// TECHNICAL VALUE PROPS (for wallet/payment pages)
// ============================================================================

export const TECHNICAL_VALUE_PROPS = [
  VALUE_PROPS.lowFees,
  VALUE_PROPS.security,
  VALUE_PROPS.collectibles,
] as const;

// ============================================================================
// BASE WALLET BENEFITS (for profile/wallet pages)
// ============================================================================

export const BASE_WALLET_BENEFITS = BASE_EDUCATION.benefits;

// ============================================================================
// FEATURE HIGHLIGHTS (marketing-focused)
// ============================================================================

export const FEATURE_HIGHLIGHTS = [
  {
    category: "Ownership",
    icon: "🎫",
    title: "Your Tickets, Your Rules",
    points: [
      "Own your tickets as NFTs",
      "Transfer or resell anytime",
      "Keep them as collectibles forever",
    ],
  },
  {
    category: "Transparency",
    icon: "💎",
    title: "See What You Pay",
    points: [
      "Clear pricing upfront",
      "No hidden fees",
      "Every transaction is verifiable",
    ],
  },
  {
    category: "Artists",
    icon: "🎵",
    title: "Support Who You Love",
    points: [
      "More money to artists and venues",
      "Fewer middlemen taking cuts",
      "Direct connection to creators",
    ],
  },
] as const;

// ============================================================================
// COMPARISON: OLD vs NEW (for marketing/about page)
// ============================================================================

export const TICKETING_COMPARISON = {
  oldWay: {
    title: "The Old Internet",
    icon: "❌",
    problems: [
      "High fees and hidden charges",
      "Platform controls your tickets",
      "Artists get small cuts",
      "Tickets lost when platform changes",
      "Scalpers and fraud",
    ],
  },
  newWay: {
    title: "The Onchain Way",
    icon: "✅",
    benefits: [
      "Minimal network fees",
      "You own your tickets forever",
      "More money to creators",
      "Permanent NFT ownership",
      "Fraud-proof verification",
    ],
  },
} as const;

// ============================================================================
// USER JOURNEY VALUE PROPS
// ============================================================================

export const USER_JOURNEY = {
  discover: {
    step: 1,
    icon: "🔍",
    title: "Discover Events",
    description: "Browse upcoming shows and find your favorite artists",
  },
  purchase: {
    step: 2,
    icon: "🎫",
    title: "Get Tickets",
    description: "Buy tickets with your wallet. Own them as NFTs instantly.",
  },
  attend: {
    step: 3,
    icon: "🎉",
    title: "Attend the Show",
    description: "Check in with your NFT ticket. Enjoy the experience.",
  },
  collect: {
    step: 4,
    icon: "✨",
    title: "Reveal Your Collectible",
    description: "After the show, your ticket transforms into a unique poster",
  },
} as const;

// ============================================================================
// WHY ONCHAIN? (educational content)
// ============================================================================

export const WHY_ONCHAIN = {
  headline: "Why Bring Ticketing Onchain?",
  subheadline: "The internet is broken. Platforms control everything. We're building something better.",
  reasons: [
    {
      icon: "🔓",
      title: "No Gatekeepers",
      description: "Your tickets aren't locked in someone else's platform. You own them.",
    },
    {
      icon: "💰",
      title: "Fairer Economics",
      description: "More money goes to artists and venues. Less to middlemen.",
    },
    {
      icon: "🌍",
      title: "Open & Global",
      description: "Anyone, anywhere can participate. No geographic restrictions.",
    },
    {
      icon: "🛡️",
      title: "Built to Last",
      description: "Your tickets exist on Ethereum. They'll outlive any single company.",
    },
  ],
} as const;

// ============================================================================
// TYPES
// ============================================================================

export type ValuePropItem = {
  icon: string;
  title: string;
  description: string;
  benefit?: string;
};

export type FeatureHighlight = typeof FEATURE_HIGHLIGHTS[number];
export type UserJourneyStep = typeof USER_JOURNEY[keyof typeof USER_JOURNEY];
