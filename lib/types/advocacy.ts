/**
 * Advocacy System TypeScript Types
 */

export interface AdvocacyRequest {
  id: number;
  email: string;
  eventId: number;
  venueName: string;
  venueEmail: string | null;
  userMessage: string | null;
  emailSent: boolean;
  sentAt: Date | null;
  createdAt: Date;
}

export interface EventImpression {
  id: number;
  eventId: number;
  sessionId: string;
  referrer: string | null;
  clickedThrough: boolean;
  createdAt: Date;
}

export interface VenueMarketingValue {
  id: number;
  venueName: string;
  venueEmail: string | null;
  totalImpressions: number;
  totalClicks: number;
  totalAdvocates: number;
  estimatedAdValue: number;
  weeklyImpressions: number;
  monthlyImpressions: number;
  lastUpdated: Date;
  createdAt: Date;
}

export interface WaitlistSignup {
  id: number;
  email: string;
  referralCode: string | null;
  referredByCode: string | null;
  rewards: number;
  walletId: number | null;
  notes: string | null;
  confirmedAt: Date | null;
  createdAt: Date;
  advocacyCount: number;
  totalVenuesReached: number;
  currentTier: string;
}

export interface AdvocacyEmailData {
  advocacyRequest: AdvocacyRequest;
  event: {
    title: string;
    startsAt: Date;
    venue: {
      name: string;
    };
  };
  stats: {
    impressions: number;
    clickThroughs: number;
    estimatedAdValue: number;
    advocacyCount: number;
  };
}

export interface AdvocacyStats {
  email: string;
  advocacyCount: number;
  totalVenuesReached: number;
  currentTier: string;
  tierProgress: {
    current: string;
    next: string | null;
    progress: number;
    remaining: number;
  };
  recentAdvocacies: AdvocacyRequest[];
}

export interface LeaderboardEntry {
  email: string;
  advocacyCount: number;
  currentTier: string;
  rank: number;
}

export interface AdvocacySubmission {
  email: string;
  eventId: number;
  userMessage?: string;
  agreeToTerms: boolean;
}
