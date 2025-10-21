/**
 * Centralized messaging system for Unchained Tickets
 * Single source of truth for all user-facing copy
 * Aligned with Base messaging guidelines:
 * - Use "onchain" not "on-chain" or "blockchain"
 * - Skip "Web3", use "crypto" sparingly
 * - Benefits first, tech second
 * - Active voice, not passive
 * - Clear, direct, optimistic
 */

// ============================================================================
// HERO SECTIONS
// ============================================================================

export const HERO_MESSAGES = {
  home: {
    headline: "Own Your Tickets. Support Your Artists.",
    subheadline: "The internet is broken. We're building a better one where you own what you create, connect with anyone, and your money goes to the artists you love.",
    cta: {
      primary: "Explore Events",
      secondary: "Learn More",
    },
  },
  about: {
    headline: "Bringing the World Onchain",
    subheadline: "Unchained Tickets is built on Base, creating a fairer ticketing ecosystem where fans own their tickets as NFTs and creators get their fair share.",
    cta: {
      primary: "Get Started",
      secondary: "View Events",
    },
  },
  events: {
    emptyState: "No events found. Be the first to bring your favorite artist onchain.",
    loadingState: "Finding events near you...",
  },
} as const;

// ============================================================================
// VALUE PROPOSITIONS
// ============================================================================

export const VALUE_PROPS = {
  ownership: {
    icon: "🎫",
    title: "True Ownership",
    description: "Your tickets are NFTs secured on Base. Own them, keep them, trade them. No one can take that away.",
    benefit: "You own your tickets as NFTs - collectible, transferable, and fraud-proof",
  },
  transparency: {
    icon: "💎",
    title: "Fair & Transparent",
    description: "Clear pricing. No hidden charges. See exactly what you're paying for.",
    benefit: "Every transaction is visible and verifiable on the blockchain",
  },
  creators: {
    icon: "🎵",
    title: "Support Creators",
    description: "More of your money goes to the artists and venues you love. Fewer middlemen means more value.",
    benefit: "Artists and venues get a fairer share of every ticket sale",
  },
  lowFees: {
    icon: "⚡",
    title: "Near-Zero Fees",
    description: "Base is an Ethereum Layer 2 network with transaction fees typically under $0.01",
    benefit: "Stop paying dollars in fees. Onchain transactions cost pennies.",
  },
  security: {
    icon: "🔒",
    title: "Secure & Verified",
    description: "Every ticket is secured by Ethereum's battle-tested security. No counterfeits, no fraud.",
    benefit: "Cryptographic proof of ownership for every ticket",
  },
  collectibles: {
    icon: "✨",
    title: "Collectible Memories",
    description: "After the show, your ticket reveals a unique collectible poster. Keep the memory forever.",
    benefit: "Turn your ticket stubs into digital collectibles",
  },
} as const;

// ============================================================================
// BASE NETWORK EDUCATION
// ============================================================================

export const BASE_EDUCATION = {
  whyBase: {
    headline: "Why Use a Base Wallet?",
    description: "Base is an Ethereum Layer 2 network that makes onchain transactions affordable and accessible.",
  },
  benefits: [
    {
      icon: "⚡",
      title: "Near-Zero Fees",
      description: "Base is an Ethereum Layer 2 network with transaction fees typically under $0.01",
    },
    {
      icon: "🔒",
      title: "Secure Checkout",
      description: "Your tickets are NFTs secured by Ethereum's battle-tested security",
    },
    {
      icon: "🎫",
      title: "True Ownership",
      description: "You own your tickets as NFTs - collectible, transferable, and fraud-proof",
    },
  ],
  gettingStarted: {
    newToCrypto: "New to crypto?",
    helpText: "We'll help you create a secure Base wallet for seamless transactions",
  },
} as const;

// ============================================================================
// CALL-TO-ACTION MESSAGES
// ============================================================================

export const CTA_MESSAGES = {
  wallet: {
    connect: "Connect Wallet",
    connecting: "Connecting...",
    connected: "Connected",
    disconnect: "Sign Out",
    switchNetwork: "Switch to Base",
  },
  tickets: {
    buy: "Get Tickets",
    viewMine: "My Tickets",
    transfer: "Transfer Ticket",
    reveal: "Reveal Collectible",
  },
  events: {
    browse: "Explore Events",
    create: "Create Event",
    manage: "Manage Events",
  },
  profile: {
    view: "View Profile",
    edit: "Edit Profile",
    share: "Share Profile",
  },
} as const;

// ============================================================================
// COMMON PHRASES (BASE-ALIGNED)
// ============================================================================

export const COMMON_PHRASES = {
  // Replace "powered by" with "built on"
  builtOnBase: "Built on Base",

  // Replace "blockchain" with "onchain"
  onchain: "onchain",
  bringingWorldOnchain: "Bringing the world onchain",

  // Avoid "Web3" - use specific benefits instead
  walletConnection: "Connect your wallet",
  cryptoPayments: "Crypto payments enabled",

  // Active voice CTAs
  getStarted: "Get Started",
  learnMore: "Learn More",
  exploreEvents: "Explore Events",

  // Benefits-first language
  ownYourTickets: "Own your tickets",
  supportArtists: "Support artists",
  collectMemories: "Collect memories",
} as const;

// ============================================================================
// ERROR & EMPTY STATES
// ============================================================================

export const STATES = {
  loading: {
    default: "Loading...",
    events: "Finding events...",
    tickets: "Loading your tickets...",
    wallet: "Connecting wallet...",
  },
  error: {
    default: "Something went wrong. Please try again.",
    wallet: "Failed to connect wallet. Please try again.",
    network: "Please switch to Base network to continue.",
    transaction: "Transaction failed. Please try again.",
  },
  empty: {
    events: "No events found. Check back soon for new shows.",
    tickets: "You don't have any tickets yet. Browse events to get started.",
    collectibles: "Your collectibles will appear here after attending events.",
  },
  success: {
    purchase: "Ticket purchased! Check your wallet.",
    transfer: "Ticket transferred successfully.",
    reveal: "Collectible revealed! View it in your collection.",
  },
} as const;

// ============================================================================
// WALLET & PAYMENT MESSAGING
// ============================================================================

export const WALLET_MESSAGES = {
  notConnected: {
    headline: "No wallet connected",
    description: "Connect your wallet to get started with onchain payments",
  },
  connected: {
    status: "Connected",
    network: "Base Network",
    preferredMethod: "This is your preferred payment method for crypto-enabled events",
  },
  traditional: {
    headline: "Traditional Payment Methods",
    description: "Add a credit/debit card for venues that don't accept crypto payments yet",
    note: "Traditional payment methods may include processing fees. Crypto payments have minimal network fees.",
  },
} as const;

// ============================================================================
// SOCIAL SHARING
// ============================================================================

export const SOCIAL_MESSAGES = {
  shareUnchained: "Share Unchained",
  shareOnX: "Share on 𝕏",
  shareOnFarcaster: "Cast on Farcaster",
  shareOnLens: "Post on Lens",
  templates: {
    welcome: "Just joined @UnchainedTix on @base 🎫\n\nTrue ticket ownership. Near-zero fees. Collectible NFTs.",
    advocate: "Tired of being a guest on someone else's platform?\n\nI use @UnchainedTix on @base\n\nYour tickets. Your data. Your collectibles. Yours to keep.\n\nBringing the world onchain, one event at a time.",
    event: "Just got tickets on @UnchainedTix 🎫\n\nOwn your tickets as NFTs on @base\n\nSee you there!",
    collectible: "Just revealed my collectible poster from @UnchainedTix ✨\n\nTicket stubs → NFT collectibles\n\nBuilt on @base",
  },
} as const;

// ============================================================================
// FOOTER & LEGAL
// ============================================================================

export const FOOTER_MESSAGES = {
  tagline: "Bringing the world onchain, one ticket at a time.",
  builtOn: "Built on Base",
  copyright: (year: number) => `© ${year} Unchained Tickets. All rights reserved.`,
  links: {
    about: "About",
    events: "Events",
    docs: "Docs",
    support: "Support",
    terms: "Terms",
    privacy: "Privacy",
  },
} as const;

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type ValueProp = typeof VALUE_PROPS[keyof typeof VALUE_PROPS];
export type HeroMessage = {
  headline: string;
  subheadline: string;
  cta: {
    primary: string;
    secondary: string;
  };
};
export type CTAMessage = typeof CTA_MESSAGES[keyof typeof CTA_MESSAGES];
