import { subDays } from 'date-fns';
import { EventStatus, TicketStatus, VenueChecklistTask } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import type {
  VenueDashboardData,
  VenueDashboardEvent,
  VenueDashboardPosterTask,
  VenueDashboardSeatMap,
} from '@/lib/mocks/venueDashboard';
import { VENUE_CHECKLIST_DEFINITIONS } from '@/lib/config/venueChecklist';
import { checklistIdToEnum } from '@/lib/utils/venueChecklist';

const SOLD_STATUSES = new Set<TicketStatus>(['minted', 'transferred', 'used', 'revoked']);

class VenueDashboardService {
  async getDashboardData(venueId: number): Promise<VenueDashboardData> {
    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);

    // Optimize: Load venue info separately without full event graph
    const venue = await prisma.venue.findUnique({
      where: { id: venueId },
      select: {
        id: true,
        name: true,
        city: true,
        state: true,
        capacity: true,
      },
    });

    if (!venue) {
      throw new Error('Venue not found');
    }

    // Optimize: Run queries in parallel
    const [events, seatMapStats, checklistStatuses, recentTicketStats] = await Promise.all([
      // Load events with only necessary ticket data
      prisma.event.findMany({
        where: { venueId },
        select: {
          id: true,
          title: true,
          startsAt: true,
          endsAt: true,
          status: true,
          posterImageUrl: true,
          tickets: {
            select: {
              id: true,
              status: true,
              priceCents: true,
              seatSection: true,
              updatedAt: true,
            },
          },
        },
      }),
      // Optimize: Aggregate seat map counts in SQL instead of loading all seats
      prisma.venueSeatMap.findMany({
        where: { venueId },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          description: true,
          status: true,
          version: true,
          createdAt: true,
          structure: true,
          sections: {
            select: {
              id: true,
              rows: {
                select: {
                  id: true,
                  seats: {
                    select: {
                      id: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
      prisma.venueChecklistStatus.findMany({
        where: { venueId },
      }),
      // Optimize: Pre-aggregate 30-day ticket stats
      prisma.ticket.groupBy({
        by: ['status'],
        where: {
          event: { venueId },
          status: { in: Array.from(SOLD_STATUSES) },
          updatedAt: { gte: thirtyDaysAgo },
        },
        _count: { id: true },
        _sum: { priceCents: true },
      }),
    ]);

    // Calculate 30-day stats from aggregated data
    const ticketsSold30d = recentTicketStats.reduce((sum, stat) => sum + stat._count.id, 0);
    const grossRevenue30dCents = recentTicketStats.reduce(
      (sum, stat) => sum + (stat._sum.priceCents || 0),
      0
    );

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
        status: event.status as 'draft' | 'published' | 'completed',
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

    const seatMaps: VenueDashboardSeatMap[] = seatMapStats.map((seatMap) => {
      const sections = seatMap.sections.length;
      let rows = 0;
      let seats = 0;

      for (const section of seatMap.sections) {
        rows += section.rows.length;
        for (const row of section.rows) {
          seats += row.seats.length;
        }
      }

      return {
        id: seatMap.id,
        name: seatMap.name,
        description: seatMap.description,
        status: seatMap.status,
        version: seatMap.version,
        sections,
        rows,
        seats,
        createdAt: seatMap.createdAt.toISOString(),
        structure: seatMap.structure,
      };
    });

    const upcomingEvents = events.filter(
      (event) => event.status === EventStatus.published && event.startsAt >= now
    ).length;

    const stats = {
      upcomingEvents,
      draftEvents: drafts.length,
      ticketsSold30d,
      grossRevenue30d: Math.round(grossRevenue30dCents / 100),
    };

    const statusMap = new Map(
      checklistStatuses.map((status) => [status.task, status])
    );

    const checklist = VENUE_CHECKLIST_DEFINITIONS.map((item) => {
      const enumTask = checklistIdToEnum(item.id);
      const persisted = statusMap.get(enumTask);
      const complete =
        item.type === 'auto'
          ? enumTask === VenueChecklistTask.seat_map
            ? seatMaps.length > 0
            : Boolean(persisted?.completedAt)
          : Boolean(persisted?.completedAt);

      return {
        id: item.id,
        label: item.label,
        description: item.description,
        complete,
        type: item.type,
      };
    });

    const completedCount = checklist.filter((item) => item.complete).length;
    const onboardingProgress = checklist.length
      ? completedCount / checklist.length
      : 0;

    const onboardingStatus =
      onboardingProgress === 0
        ? 'incomplete'
        : onboardingProgress === 1
        ? 'complete'
        : 'in_progress';

    return {
      venue: {
        id: venue.id,
        name: venue.name,
        slug: venue.slug,
        city: venue.city,
        state: venue.state,
        capacity: venue.capacity,
        onboardingProgress,
        onboardingStatus,
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
      seatMaps,
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
