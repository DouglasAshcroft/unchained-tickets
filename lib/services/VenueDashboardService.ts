import { subDays } from 'date-fns';
import { EventStatus, TicketStatus } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import type { VenueDashboardData, VenueDashboardEvent, VenueDashboardPosterTask } from '@/lib/mocks/venueDashboard';

const SOLD_STATUSES = new Set<TicketStatus>(['minted', 'transferred', 'used', 'revoked']);

class VenueDashboardService {
  async getDashboardData(venueId: number): Promise<VenueDashboardData> {
    const venue = await prisma.venue.findUnique({
      where: { id: venueId },
      include: {
        events: {
          include: {
            tickets: true,
          },
        },
      },
    });

    if (!venue) {
      throw new Error('Venue not found');
    }

    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);

    const events = venue.events;

    const ticketsSold30d = events.reduce((total, event) => {
      return (
        total +
        event.tickets.filter(
          (ticket) => SOLD_STATUSES.has(ticket.status) && ticket.updatedAt >= thirtyDaysAgo
        ).length
      );
    }, 0);

    const grossRevenue30dCents = events.reduce((total, event) => {
      return (
        total +
        event.tickets
          .filter(
            (ticket) => SOLD_STATUSES.has(ticket.status) && ticket.updatedAt >= thirtyDaysAgo
          )
          .reduce((sum, ticket) => sum + (ticket.priceCents ?? 0), 0)
      );
    }, 0);

    const toDashboardEvent = (event: (typeof events)[number]): VenueDashboardEvent => {
      const tiers = Array.from(
        new Set(
          event.tickets
            .map((ticket) => ticket.seatSection || undefined)
            .filter(Boolean) as string[]
        )
      );

      const soldGrossCents = event.tickets
        .filter((ticket) => SOLD_STATUSES.has(ticket.status))
        .reduce((sum, ticket) => sum + (ticket.priceCents ?? 0), 0);

      const posterStatus = event.posterImageUrl ? 'approved' : 'pending';

      return {
        id: event.id,
        title: event.title,
        startsAt: event.startsAt.toISOString(),
        endsAt: event.endsAt?.toISOString() ?? null,
        status: event.status,
        tiers: tiers.length > 0 ? tiers : ['General Admission'],
        posterStatus,
        grossSales: Math.round(soldGrossCents / 100),
      };
    };

    const drafts = events
      .filter((event) => event.status === EventStatus.draft)
      .map(toDashboardEvent)
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt));

    const published = events
      .filter((event) => event.status === EventStatus.published)
      .map(toDashboardEvent)
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt));

    const completed = events
      .filter((event) => event.status === EventStatus.completed)
      .map(toDashboardEvent)
      .sort((a, b) => b.startsAt.localeCompare(a.startsAt));

    const posterQueue: VenueDashboardPosterTask[] = drafts
      .filter((event) => event.posterStatus !== 'approved')
      .map((event) => ({
        id: `poster-${event.id}`,
        eventId: event.id,
        eventName: event.title,
        tier: event.tiers[0] ?? 'General Admission',
        status: 'awaiting_upload',
      }));

    const upcomingEvents = events.filter(
      (event) => event.status === EventStatus.published && event.startsAt >= now
    ).length;

    const stats = {
      upcomingEvents,
      draftEvents: drafts.length,
      ticketsSold30d,
      grossRevenue30d: Math.round(grossRevenue30dCents / 100),
    };

    const checklist = [
      {
        id: 'poster-workflow',
        label: 'Confirm collectible poster workflow',
        description: 'Upload poster variants or enable generation prompts for each tier.',
        complete: posterQueue.length === 0,
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
        complete: false,
      },
    ];

    return {
      venue: {
        id: venue.id,
        name: venue.name,
        city: venue.city,
        state: venue.state,
        capacity: venue.capacity,
        onboardingProgress: checklist.filter((item) => item.complete).length / checklist.length,
        onboardingStatus:
          checklist.every((item) => item.complete) ? 'complete' : 'in_progress',
      },
      stats,
      events: {
        drafts,
        published,
        completed,
      },
      checklist,
      posterQueue,
      payouts: [],
      support: {
        contacts: [
          { name: 'Nova Patel', role: 'Venue Success', email: 'nova@unchained.xyz' },
          { name: 'Ledger Cruz', role: 'On-call mint ops', email: 'ops@unchained.xyz' },
        ],
        docs: [
          { label: 'Poster workflow guide', href: '/docs/posters' },
          { label: 'Base paymaster setup', href: '/docs/payments' },
          { label: 'Event checklist template', href: '/docs/checklists' },
        ],
      },
    };
  }
}

export const venueDashboardService = new VenueDashboardService();
