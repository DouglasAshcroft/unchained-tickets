export type VenueDashboardEvent = {
  id: number;
  title: string;
  startsAt: string;
  endsAt?: string | null;
  status: 'draft' | 'published' | 'completed';
  tiers: string[];
  posterStatus?: 'pending' | 'approved' | 'needs_revision';
  grossSales: number;
};

export type VenueDashboardChecklistItem = {
  id: string;
  label: string;
  description: string;
  complete: boolean;
};

export type VenueDashboardPosterTask = {
  id: string;
  eventId: number;
  eventName: string;
  tier: string;
  status: 'awaiting_upload' | 'awaiting_approval' | 'approved';
  dueDate?: string;
};

export type VenueDashboardPayout = {
  id: string;
  amount: number;
  currency: string;
  scheduledFor: string;
  status: 'pending' | 'processing' | 'paid';
};

export type VenueDashboardData = {
  venue: {
    id: number;
    name: string;
    city?: string | null;
    state?: string | null;
    capacity?: number | null;
    onboardingProgress: number;
    onboardingStatus: 'incomplete' | 'in_progress' | 'complete';
  };
  stats: {
    upcomingEvents: number;
    draftEvents: number;
    ticketsSold30d: number;
    grossRevenue30d: number;
  };
  events: {
    drafts: VenueDashboardEvent[];
    published: VenueDashboardEvent[];
    completed: VenueDashboardEvent[];
  };
  checklist: VenueDashboardChecklistItem[];
  posterQueue: VenueDashboardPosterTask[];
  payouts: VenueDashboardPayout[];
  support: {
    contacts: {
      name: string;
      role: string;
      email: string;
    }[];
    docs: {
      label: string;
      href: string;
    }[];
  };
};

export const mockVenueDashboard: VenueDashboardData = {
  venue: {
    id: 42,
    name: 'Neon Forge Arena',
    city: 'Austin',
    state: 'TX',
    capacity: 4200,
    onboardingProgress: 0.55,
    onboardingStatus: 'in_progress',
  },
  stats: {
    upcomingEvents: 4,
    draftEvents: 3,
    ticketsSold30d: 1864,
    grossRevenue30d: 94210,
  },
  events: {
    drafts: [
      {
        id: 401,
        title: 'Synthetic Sunrise',
        startsAt: '2025-07-12T20:00:00Z',
        status: 'draft',
        tiers: ['GA', 'VIP Balconies'],
        posterStatus: 'awaiting_upload',
        grossSales: 0,
      },
      {
        id: 402,
        title: 'Holo Harbor Sessions',
        startsAt: '2025-08-01T02:00:00Z',
        status: 'draft',
        tiers: ['GA', 'Underworld Lounge'],
        posterStatus: 'awaiting_approval',
        grossSales: 0,
      },
    ],
    published: [
      {
        id: 310,
        title: 'Baselines & Breakers',
        startsAt: '2025-06-28T02:00:00Z',
        status: 'published',
        tiers: ['GA', 'VIP'],
        posterStatus: 'approved',
        grossSales: 22350,
      },
      {
        id: 311,
        title: 'Circuit Ritual',
        startsAt: '2025-07-04T02:00:00Z',
        status: 'published',
        tiers: ['GA', 'VIP Tables'],
        posterStatus: 'approved',
        grossSales: 18700,
      },
    ],
    completed: [
      {
        id: 250,
        title: 'Neon Bloom Festival',
        startsAt: '2025-05-19T02:00:00Z',
        endsAt: '2025-05-21T06:00:00Z',
        status: 'completed',
        tiers: ['GA', 'VIP', 'Artist Circle'],
        posterStatus: 'approved',
        grossSales: 50215,
      },
    ],
  },
  checklist: [
    {
      id: 'poster-workflow',
      label: 'Confirm collectible poster workflow',
      description: 'Upload poster variants or enable generation prompts for each tier.',
      complete: false,
    },
    {
      id: 'staff-accounts',
      label: 'Invite venue staff',
      description: 'Add front-of-house and door staff for ticket scanning access.',
      complete: false,
    },
    {
      id: 'payout-method',
      label: 'Verify payout details',
      description: 'Connect bank account or Base paymaster address for settlements.',
      complete: true,
    },
  ],
  posterQueue: [
    {
      id: 'poster-401-VIP',
      eventId: 401,
      eventName: 'Synthetic Sunrise',
      tier: 'VIP Balconies',
      status: 'awaiting_upload',
      dueDate: '2025-06-20',
    },
    {
      id: 'poster-402-GA',
      eventId: 402,
      eventName: 'Holo Harbor Sessions',
      tier: 'GA',
      status: 'awaiting_approval',
      dueDate: '2025-06-25',
    },
  ],
  payouts: [
    {
      id: 'payout-1',
      amount: 18250,
      currency: 'USD',
      scheduledFor: '2025-05-30',
      status: 'processing',
    },
    {
      id: 'payout-2',
      amount: 2200,
      currency: 'USDC',
      scheduledFor: '2025-06-02',
      status: 'pending',
    },
  ],
  support: {
    contacts: [
      {
        name: 'Nova Patel',
        role: 'Venue Success',
        email: 'nova@unchained.xyz',
      },
      {
        name: 'Ledger Cruz',
        role: 'On-call mint ops',
        email: 'ops@unchained.xyz',
      },
    ],
    docs: [
      {
        label: 'Poster workflow guide',
        href: '/docs/posters',
      },
      {
        label: 'Base paymaster setup',
        href: '/docs/payments',
      },
      {
        label: 'Event checklist template',
        href: '/docs/checklists',
      },
    ],
  },
};
