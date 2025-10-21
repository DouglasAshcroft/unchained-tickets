/**
 * Social Sharing Utilities for Unchained Tickets
 *
 * Aligned with Base messaging guidelines:
 * - Clear, direct, optimistic
 * - Active voice
 * - Focus on benefits first, tech second
 * - "Post. Own. Earn." ethos
 */

export type SocialPlatform = 'twitter' | 'farcaster' | 'lens' | 'hey';

export interface ShareContent {
  message: string;
  url: string;
  hashtags?: string[];
}

/**
 * Base-aligned messaging templates for different contexts
 */
export const SHARE_TEMPLATES = {
  // When user first connects wallet
  welcomeOnchain: {
    message: "Just joined @UnchainedTix on @base 🎫\n\nTrue ticket ownership. Near-zero fees. Collectible NFTs.\n\nThe future of events is onchain.",
    hashtags: ['UnchainedTickets', 'Base', 'Onchain'],
  },

  // After purchasing tickets
  ticketPurchase: (eventName: string) => ({
    message: `Got my tickets to ${eventName} on @UnchainedTix 🎫\n\nMy ticket, my wallet, my proof of attendance.\n\nNo middlemen. No hidden fees. Just me and the music, onchain.\n\nBuilding a better internet starts here.`,
    hashtags: ['UnchainedTickets', 'Base', 'NFTTickets'],
  }),

  // After revealing collectible poster
  posterReveal: (eventName: string) => ({
    message: `Just revealed my collectible ${eventName} poster on @UnchainedTix ✨\n\nAttend the show. Own the memory. Forever.\n\nPost. Own. Earn.`,
    hashtags: ['UnchainedTickets', 'ProofOfAttendance', 'Collectibles'],
  }),

  // General advocacy
  advocate: {
    message: "Tired of being a guest on someone else's platform?\n\nI use @UnchainedTix on @base\n\nYour tickets. Your data. Your collectibles. Yours to keep.\n\nBringing the world onchain, one event at a time.",
    hashtags: ['UnchainedTickets', 'Base', 'Onchain'],
  },

  // After attending event
  attended: (eventName: string) => ({
    message: `Just attended ${eventName} 🎶\n\nMy @UnchainedTix NFT is now a verified proof-of-attendance collectible.\n\nNot for likes. Not for an algorithm. For me.\n\nThis is how events should work.`,
    hashtags: ['UnchainedTickets', 'ProofOfAttendance'],
  }),
} as const;

/**
 * Generate share URL for Twitter/X
 */
export function generateTwitterShareUrl(content: ShareContent): string {
  const params = new URLSearchParams({
    text: content.message,
    url: content.url,
  });

  if (content.hashtags && content.hashtags.length > 0) {
    params.append('hashtags', content.hashtags.join(','));
  }

  return `https://twitter.com/intent/tweet?${params.toString()}`;
}

/**
 * Generate share URL for Farcaster
 * Uses Warpcast for direct casting
 */
export function generateFarcasterShareUrl(content: ShareContent): string {
  const text = `${content.message}\n\n${content.url}`;
  const params = new URLSearchParams({
    text,
  });

  return `https://warpcast.com/~/compose?${params.toString()}`;
}

/**
 * Generate share URL for Lens Protocol
 * Uses Hey.xyz as the primary Lens client
 */
export function generateLensShareUrl(content: ShareContent): string {
  const text = `${content.message}\n\n${content.url}`;

  return `https://hey.xyz/?text=${encodeURIComponent(text)}`;
}

/**
 * Generate share URL for Hey (Lens Protocol)
 */
export function generateHeyShareUrl(content: ShareContent): string {
  return generateLensShareUrl(content); // Hey is the main Lens client
}

/**
 * Get share URL for any platform
 */
export function getShareUrl(platform: SocialPlatform, content: ShareContent): string {
  switch (platform) {
    case 'twitter':
      return generateTwitterShareUrl(content);
    case 'farcaster':
      return generateFarcasterShareUrl(content);
    case 'lens':
    case 'hey':
      return generateLensShareUrl(content);
    default:
      return generateTwitterShareUrl(content);
  }
}

/**
 * Generate referral/profile URL for sharing
 */
export function generateProfileUrl(address?: string): string {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://unchained.tickets';

  if (address) {
    return `${baseUrl}/profile/${address}`;
  }

  return baseUrl;
}

/**
 * Track social share event (for analytics)
 */
export function trackSocialShare(platform: SocialPlatform, context: string) {
  // Send to analytics service
  if (typeof window !== 'undefined') {
    console.log(`Social share: ${platform} - ${context}`);

    // You can integrate with your analytics provider here
    // Example: plausible, mixpanel, amplitude, etc.
    if (window.plausible) {
      window.plausible('Social Share', {
        props: {
          platform,
          context,
        },
      });
    }
  }
}

/**
 * Open share dialog in new window
 */
export function openShareDialog(url: string, platform: SocialPlatform) {
  const width = 550;
  const height = 420;
  const left = (window.screen.width - width) / 2;
  const top = (window.screen.height - height) / 2;

  window.open(
    url,
    `share-${platform}`,
    `width=${width},height=${height},left=${left},top=${top},toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes`
  );
}

// TypeScript declaration for window.plausible
declare global {
  interface Window {
    plausible?: (event: string, options?: { props: Record<string, any> }) => void;
  }
}
