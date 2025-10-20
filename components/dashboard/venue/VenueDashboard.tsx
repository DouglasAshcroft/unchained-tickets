"use client";

import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { api } from '@/lib/api/client';
import { VenueOnboardingPanel } from '@/components/dashboard/venue/VenueOnboardingPanel';
import type { ChecklistTaskId } from '@/lib/config/venueChecklist';
import type {
  VenueDashboardData,
  VenueDashboardEvent,
  VenueDashboardSeatMap,
} from '@/lib/mocks/venueDashboard';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const percentFormatter = new Intl.NumberFormat('en-US', {
  style: 'percent',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

interface VenueDashboardProps {
  data: VenueDashboardData;
}

export function VenueDashboard({ data }: VenueDashboardProps) {
  const { venue, stats, events, posterQueue, payouts, support } = data;
  const [checklist, setChecklist] = useState(data.checklist);
  const [seatMaps, setSeatMaps] = useState<VenueDashboardSeatMap[]>(data.seatMaps);
  const [pendingTaskId, setPendingTaskId] = useState<ChecklistTaskId | null>(null);

  const checklistMutation = useMutation({
    mutationFn: ({ task, complete }: { task: ChecklistTaskId; complete: boolean }) =>
      api.setVenueChecklistItem(venue.slug, task, complete),
  });

  const handleChecklistToggle = (task: ChecklistTaskId, nextComplete: boolean) => {
    const previous = checklist;
    const next = checklist.map((item) =>
      item.id === task ? { ...item, complete: nextComplete } : item
    );

    setChecklist(next);
    setPendingTaskId(task);

    checklistMutation.mutate(
      { task, complete: nextComplete },
      {
        onError: (error: any) => {
          const message =
            error?.data?.error || error?.message || 'Failed to update checklist';
          toast.error(message);
          setChecklist(previous);
          setPendingTaskId(null);
        },
        onSuccess: () => {
          setPendingTaskId(null);
        },
      }
    );
  };

  const handleSeatMapCreated = (seatMap: VenueDashboardSeatMap) => {
    setSeatMaps((current) => [seatMap, ...current]);
    setChecklist((current) =>
      current.map((item) =>
        item.id === 'seat_map' ? { ...item, complete: true } : item
      )
    );
  };

  const completedCount = useMemo(
    () => checklist.filter((item) => item.complete).length,
    [checklist]
  );

  const onboardingProgress = useMemo(
    () => (checklist.length ? completedCount / checklist.length : 0),
    [checklist, completedCount]
  );

  const onboardingStatus = useMemo(() => {
    if (onboardingProgress === 0) return 'incomplete';
    if (onboardingProgress === 1) return 'complete';
    return 'in_progress';
  }, [onboardingProgress]);

  const progressPercent = Math.round(onboardingProgress * 100);

  const onboardingHelper =
    onboardingStatus === 'complete'
      ? 'You’re ready to launch new events. Keep the poster queue clear to unlock collectibles.'
      : 'Finish the checklist below to unlock automated poster approvals and payouts.';

  // Expose slug globally for nested upload component without prop drilling
  if (typeof window !== 'undefined') {
    (window as any).__UNCHAINED_VENUE_SLUG__ = venue.slug;
  }

  return (
    <div className="space-y-10">
      <header className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-widest text-grit-400">Venue control center</p>
            <h1 className="brand-heading text-3xl font-bold bg-gradient-to-r from-resistance-500 via-hack-green to-acid-400 bg-clip-text text-transparent">
              {venue.name}
            </h1>
            <p className="text-sm text-grit-400">
              {venue.city && venue.state ? `${venue.city}, ${venue.state}` : 'Location pending'} · Capacity {venue.capacity ?? '—'}
            </p>
          </div>
          <div className="w-full max-w-md rounded-xl border border-grit-500/30 bg-ink-900/70 p-4">
            <div className="flex items-center justify-between text-xs text-grit-400">
              <span>Onboarding progress</span>
              <span>{percentFormatter.format(onboardingProgress)}</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-ink-800">
              <div
                className={`h-full bg-gradient-to-r ${
                  onboardingStatus === 'complete'
                    ? 'from-hack-green to-acid-400'
                    : 'from-resistance-500 via-hack-green to-acid-400'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="mt-3 text-xs text-grit-400">{onboardingHelper}</p>
          </div>
        </div>
      </header>

      <VenueOnboardingPanel
        venueId={venue.id}
        venueSlug={venue.slug}
        seatMaps={seatMaps}
        checklist={checklist}
        onboardingProgress={onboardingProgress}
        pendingTaskId={pendingTaskId}
      onToggleChecklist={handleChecklistToggle}
        onSeatMapCreated={handleSeatMapCreated}
      />

      <StatsGrid stats={stats} />

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="brand-heading text-xl text-bone-100">Events overview</h2>
          <p className="text-xs text-grit-400">Manage drafts, live onsales, and recently completed events.</p>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <EventColumn title="Drafts" description="Polish details before you go live." events={events.drafts} accent="border-dashed" />
          <EventColumn title="On sale" description="Track live inventory & poster approvals." events={events.published} />
          <EventColumn title="Recently completed" description="Review redemption stats & payouts." events={events.completed} />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <PosterQueue tasks={posterQueue} />
        <PayoutsList payouts={payouts} />
        <SupportPanel support={support} />
      </section>
    </div>
  );
}

interface StatsGridProps {
  stats: VenueDashboardData['stats'];
}

function StatsGrid({ stats }: StatsGridProps) {
  const cards = [
    {
      label: 'Upcoming events',
      value: stats.upcomingEvents,
      helper: 'Within the next 60 days',
    },
    {
      label: 'Draft events',
      value: stats.draftEvents,
      helper: 'Awaiting review or poster upload',
    },
    {
      label: 'Tickets sold (30d)',
      value: stats.ticketsSold30d.toLocaleString(),
      helper: 'Across all events',
    },
    {
      label: 'Gross revenue (30d)',
      value: currencyFormatter.format(stats.grossRevenue30d),
      helper: 'Before fees & payouts',
    },
  ];

  return (
    <section>
      <h2 className="brand-heading text-xl text-bone-100">Snapshot</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-grit-500/30 bg-ink-900/70 p-5 shadow-ink"
          >
            <p className="text-xs uppercase tracking-widest text-grit-400">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold text-bone-100">{card.value}</p>
            <p className="mt-1 text-xs text-grit-400">{card.helper}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

interface EventColumnProps {
  title: string;
  description: string;
  events: VenueDashboardEvent[];
  accent?: 'border-dashed';
}

function EventColumn({ title, description, events, accent }: EventColumnProps) {
  return (
    <div className={`rounded-xl border border-grit-500/30 bg-ink-900/70 p-5 shadow-ink ${accent === 'border-dashed' ? 'border-dashed' : ''}`}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="brand-heading text-lg text-bone-100">{title}</h3>
          <p className="text-xs text-grit-400">{description}</p>
        </div>
        <span className="text-xs text-grit-400">{events.length} events</span>
      </div>
      <div className="mt-4 space-y-3">
        {events.map((event) => (
          <div key={event.id} className="rounded-lg border border-grit-500/30 bg-ink-800/60 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-bone-100">{event.title}</p>
                <p className="text-xs text-grit-400">
                  {format(new Date(event.startsAt), 'PPP p')}
                  {event.endsAt ? ` – ${format(new Date(event.endsAt), 'PPP p')}` : ''}
                </p>
              </div>
              <span className="rounded-full border border-grit-500/40 px-3 py-1 text-xs uppercase tracking-widest text-grit-300">
                {event.status}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-grit-400">
              <span className="rounded-full border border-grit-500/40 px-2 py-0.5 uppercase tracking-widest">{event.tiers.length} tiers</span>
              {event.posterStatus && (
                <span
                  className={`rounded-full border px-2 py-0.5 uppercase tracking-widest ${
                    event.posterStatus === 'approved'
                      ? 'border-hack-green/40 text-hack-green'
                      : event.posterStatus === 'pending'
                      ? 'border-acid-400/40 text-acid-400'
                      : 'border-resistance-500/40 text-resistance-500'
                  }`}
                >
                  Poster · {event.posterStatus.replace('_', ' ')}
                </span>
              )}
              {event.grossSales > 0 && (
                <span className="rounded-full border border-grit-500/40 px-2 py-0.5 uppercase tracking-widest">
                  {currencyFormatter.format(event.grossSales)} gross
                </span>
              )}
            </div>
          </div>
        ))}
        {events.length === 0 && (
          <div className="rounded-lg border border-grit-500/30 bg-ink-800/40 p-4 text-xs text-grit-400">
            Nothing here yet. Create a new event to populate this column.
          </div>
        )}
      </div>
    </div>
  );
}

interface PosterQueueProps {
  tasks: VenueDashboardData['posterQueue'];
}

function PosterQueue({ tasks }: PosterQueueProps) {
  return (
    <div className="rounded-xl border border-grit-500/30 bg-ink-900/70 p-5 shadow-ink">
      <h3 className="brand-heading text-lg text-bone-100">Poster workflow</h3>
      <p className="text-xs text-grit-400">
        Keep staff aligned with collectible approvals and rarity drops.
      </p>
      <div className="mt-4 space-y-3">
        {tasks.map((task) => (
          <div key={task.id} className="rounded-lg border border-grit-500/30 bg-ink-800/40 p-4 text-sm text-bone-100">
            <div className="flex items-center justify-between gap-3">
              <p className="font-medium">{task.eventName}</p>
              <span
                className={`rounded-full border px-2 py-0.5 text-xs uppercase tracking-widest ${
                  task.status === 'approved'
                    ? 'border-hack-green/40 text-hack-green'
                    : task.status === 'awaiting_approval'
                    ? 'border-acid-400/40 text-acid-400'
                    : 'border-resistance-500/40 text-resistance-500'
                }`}
              >
                {task.status.replace('_', ' ')}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-grit-400">
              <span>Tier · {task.tier}</span>
              {task.dueDate && <span>Due {format(new Date(task.dueDate), 'PPP')}</span>}
            </div>
          </div>
        ))}
        {tasks.length === 0 && (
          <div className="rounded-lg border border-grit-500/30 bg-ink-800/40 p-4 text-xs text-grit-400">
            All poster assets are approved. Great work!
          </div>
        )}
      </div>
    </div>
  );
}

interface PayoutsListProps {
  payouts: VenueDashboardData['payouts'];
}

function PayoutsList({ payouts }: PayoutsListProps) {
  return (
    <div className="rounded-xl border border-grit-500/30 bg-ink-900/70 p-5 shadow-ink">
      <h3 className="brand-heading text-lg text-bone-100">Payout timeline</h3>
      <p className="text-xs text-grit-400">
        Settlements across fiat processors and Base paymaster.
      </p>
      <div className="mt-4 space-y-3">
        {payouts.map((payout) => (
          <div key={payout.id} className="rounded-lg border border-grit-500/30 bg-ink-800/40 p-4 text-sm text-bone-100">
            <div className="flex items-center justify-between gap-3">
              <span>{currencyFormatter.format(payout.amount)} {payout.currency}</span>
              <span className="text-xs uppercase tracking-widest text-grit-400">{payout.status}</span>
            </div>
            <p className="mt-2 text-xs text-grit-400">Scheduled {format(new Date(payout.scheduledFor), 'PPP')}</p>
          </div>
        ))}
        {payouts.length === 0 && (
          <div className="rounded-lg border border-grit-500/30 bg-ink-800/40 p-4 text-xs text-grit-400">
            No payouts scheduled. Connect payouts or settle completed events to populate this list.
          </div>
        )}
      </div>
    </div>
  );
}

interface SupportPanelProps {
  support: VenueDashboardData['support'];
}

function SupportPanel({ support }: SupportPanelProps) {
  return (
    <div className="rounded-xl border border-grit-500/30 bg-ink-900/70 p-5 shadow-ink">
      <h3 className="brand-heading text-lg text-bone-100">Support & docs</h3>
      <div className="mt-4 space-y-4 text-sm text-grit-300">
        <div>
          <p className="text-xs uppercase tracking-widest text-grit-400">Concierge contacts</p>
          <ul className="mt-2 space-y-2">
            {support.contacts.map((contact) => (
              <li key={contact.email} className="flex flex-col">
                <span className="text-bone-100">{contact.name}</span>
                <span className="text-xs text-grit-400">{contact.role} · {contact.email}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-grit-400">Playbooks</p>
          <ul className="mt-2 space-y-2">
            {support.docs.map((doc) => (
              <li key={doc.href}>
                <a href={doc.href} className="text-acid-400 hover:underline">
                  {doc.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
