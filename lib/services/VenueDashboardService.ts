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

    const [seatMapsRaw, checklistStatuses] = await Promise.all([
      prisma.venueSeatMap.findMany({
        where: { venueId },
        orderBy: { createdAt: 'desc' },
        include: {
          sections: {
            include: {
              rows: {
                include: {
                  seats: true,
                },
              },
            },
          },
        },
      }),
      prisma.venueChecklistStatus.findMany({
        where: { venueId },
      }),
    ]);

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

    const seatMaps: VenueDashboardSeatMap[] = seatMapsRaw.map((seatMap) => {
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
