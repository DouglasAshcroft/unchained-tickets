'use client';

import { StepHeader, SectionDivider } from '@/components/ui/forms';
import type { EventFormData, Artist, Venue, TicketTypeForm } from '../../types';

interface ReviewStepProps {
  formData: EventFormData;
  selectedArtist: Artist | null;
  selectedVenue: Venue | null;
}

export function ReviewStep({ formData, selectedArtist, selectedVenue }: ReviewStepProps) {
  // Calculate total ticket capacity
  const totalCapacity = formData.ticketTypes.reduce((sum: number, ticket) => {
    const capacity = parseInt(ticket.capacity, 10);
    return sum + (isNaN(capacity) ? 0 : capacity);
  }, 0);

  // Format currency
  const formatPrice = (price: string, currency: string): string => {
    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return price;

    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      CAD: 'CA$',
      AUD: 'A$',
      JPY: '¥',
    };

    const symbol = symbols[currency] || currency;
    return `${symbol}${numPrice.toFixed(2)}`;
  };

  // Format date/time
  const formatDateTime = (dateStr: string): string => {
    if (!dateStr) return 'Not specified';
    try {
      const date = new Date(dateStr);
      return date.toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-10">
      {/* Step Description */}
      <StepHeader
        stepNumber="05"
        title="Final Check"
        description="Verify the payload. Review all details before deployment. Once you hit Create Event, we're going live on-chain."
      />

      {/* Event Details Section */}
      <div className="space-y-8">
        <SectionDivider variant="resistance">Event Details</SectionDivider>

        <div className="rounded-xl border border-grit-500/30 bg-ink-800/50 p-6 backdrop-blur-sm dark:border-grit-500/30 dark:bg-ink-800/50 light:border-grit-400/30 light:bg-bone-100/5">
          <div className="space-y-4">
            <div className="flex flex-col gap-1">
              <span className="font-mono text-xs uppercase tracking-wider text-grit-400">Title</span>
              <span className="font-mono text-sm text-bone-100 dark:text-bone-100 light:text-ink-900">{formData.title}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-mono text-xs uppercase tracking-wider text-grit-400">Artist</span>
              <span className="font-mono text-sm text-bone-100 dark:text-bone-100 light:text-ink-900">
                {selectedArtist?.name || 'Unknown artist'}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-mono text-xs uppercase tracking-wider text-grit-400">Poster</span>
              <span className="font-mono text-sm text-bone-100 dark:text-bone-100 light:text-ink-900">
                {formData.posterImageUrl ? formData.posterImageUrl : 'None'}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-mono text-xs uppercase tracking-wider text-grit-400">External Link</span>
              <span className="font-mono text-sm text-bone-100 dark:text-bone-100 light:text-ink-900">
                {formData.externalLink ? formData.externalLink : 'None'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Section */}
      <div className="space-y-8">
        <SectionDivider variant="hack">Schedule</SectionDivider>

        <div className="rounded-xl border border-grit-500/30 bg-ink-800/50 p-6 backdrop-blur-sm dark:border-grit-500/30 dark:bg-ink-800/50 light:border-grit-400/30 light:bg-bone-100/5">
          <div className="space-y-4">
            <div className="flex flex-col gap-1">
              <span className="font-mono text-xs uppercase tracking-wider text-grit-400">Venue</span>
              <span className="font-mono text-sm text-bone-100 dark:text-bone-100 light:text-ink-900">
                {selectedVenue?.name || 'Unknown venue'}
                {selectedVenue?.city && ` (${selectedVenue.city})`}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-mono text-xs uppercase tracking-wider text-grit-400">Start Time</span>
              <span className="font-mono text-sm text-bone-100 dark:text-bone-100 light:text-ink-900">{formatDateTime(formData.startsAt)}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-mono text-xs uppercase tracking-wider text-grit-400">End Time</span>
              <span className="font-mono text-sm text-bone-100 dark:text-bone-100 light:text-ink-900">{formatDateTime(formData.endsAt)}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-mono text-xs uppercase tracking-wider text-grit-400">Doors Open</span>
              <span className="font-mono text-sm text-bone-100 dark:text-bone-100 light:text-ink-900">{formatDateTime(formData.doorsOpen)}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-mono text-xs uppercase tracking-wider text-grit-400">Maps Link</span>
              <span className="font-mono text-sm text-bone-100 dark:text-bone-100 light:text-ink-900">{formData.mapsLink}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tickets Section */}
      <div className="space-y-8">
        <SectionDivider variant="acid">Tickets</SectionDivider>

        <div className="rounded-xl border border-grit-500/30 bg-ink-800/50 p-6 backdrop-blur-sm dark:border-grit-500/30 dark:bg-ink-800/50 light:border-grit-400/30 light:bg-bone-100/5">
          <div className="mb-6 flex items-center gap-4">
            <span className="font-mono text-sm text-grit-300 dark:text-grit-300 light:text-grit-500">
              {formData.ticketTypes.length} ticket tier{formData.ticketTypes.length !== 1 ? 's' : ''}
            </span>
            <span className="font-mono text-sm text-grit-300 dark:text-grit-300 light:text-grit-500">
              Total capacity: {totalCapacity}
            </span>
          </div>

          <div className="space-y-4">
            {formData.ticketTypes.map((ticket: TicketTypeForm) => (
              <div key={ticket.id} className="rounded-lg border border-grit-500/20 bg-ink-900/30 p-4 dark:border-grit-500/20 dark:bg-ink-900/30 light:border-grit-400/20 light:bg-bone-100/20">
                <div className="mb-3 font-mono text-sm font-medium text-acid-400 dark:text-acid-400 light:text-cobalt-500">{ticket.name}</div>
                <div className="grid grid-cols-2 gap-3 font-mono text-sm">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs uppercase tracking-wider text-grit-400">Price</span>
                    <span className="text-bone-100 dark:text-bone-100 light:text-ink-900">{formatPrice(ticket.price, ticket.currency)}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs uppercase tracking-wider text-grit-400">Capacity</span>
                    <span className="text-bone-100 dark:text-bone-100 light:text-ink-900">{ticket.capacity} tickets</span>
                  </div>
                  {ticket.description && (
                    <div className="col-span-2 flex flex-col gap-1">
                      <span className="text-xs uppercase tracking-wider text-grit-400">Description</span>
                      <span className="text-bone-100 dark:text-bone-100 light:text-ink-900">{ticket.description}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Helper Message */}
      <div className="rounded-xl border border-hack-green/30 bg-hack-green/5 p-6 backdrop-blur-sm dark:border-hack-green/30 dark:bg-hack-green/5 light:border-cobalt-500/30 light:bg-cobalt-500/5">
        <p className="flex items-start gap-3 font-mono text-sm text-hack-green dark:text-hack-green light:text-cobalt-600">
          <svg className="mt-0.5 h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>
            Everything looks good? Click <strong className="uppercase tracking-wider">&quot;Create Event&quot;</strong> to deploy your event on-chain!
          </span>
        </p>
      </div>
    </div>
  );
}
