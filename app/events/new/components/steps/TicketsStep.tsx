'use client';

import { TicketTypeCard } from '../form/TicketTypeCard';
import { StepHeader, SectionDivider } from '@/components/ui/forms';
import type { TicketTypeForm, Venue } from '../../types';

interface TicketsStepProps {
  ticketTypes: TicketTypeForm[];
  errors: Record<string, string>;
  selectedVenue: Venue | null;
  handlers: {
    onAddTicket: () => void;
    onRemoveTicket: (id: string) => void;
    onUpdateTicket: (id: string, field: keyof TicketTypeForm, value: string) => void;
    onAddPerk: (ticketId: string) => void;
    onUpdatePerk: (ticketId: string, perkId: string, field: string, value: string | number) => void;
    onRemovePerk: (ticketId: string, perkId: string) => void;
  };
}

export function TicketsStep({
  ticketTypes,
  errors,
  selectedVenue,
  handlers,
}: TicketsStepProps) {
  const { onAddTicket, onRemoveTicket, onUpdateTicket, onAddPerk, onUpdatePerk, onRemovePerk } = handlers;

  // Calculate total capacity
  const totalCapacity = ticketTypes.reduce((sum, ticket) => {
    const capacity = parseInt(ticket.capacity, 10);
    return sum + (isNaN(capacity) ? 0 : capacity);
  }, 0);

  // Calculate capacity percentage
  const capacityPercentage = selectedVenue?.capacity
    ? Math.round((totalCapacity / selectedVenue.capacity) * 100)
    : 0;

  const isOverCapacity = selectedVenue && selectedVenue.capacity && totalCapacity > selectedVenue.capacity;

  // Group errors by ticket ID
  const getTicketErrors = (ticketId: string): Record<string, string> => {
    const ticketErrors: Record<string, string> = {};
    const prefix = `ticketTypes.${ticketId}.`;

    Object.keys(errors || {}).forEach((key) => {
      if (key.startsWith(prefix)) {
        const field = key.replace(prefix, '');
        ticketErrors[field] = errors[key];
      }
    });

    return ticketErrors;
  };

  return (
    <div className="space-y-10">
      {/* Step Description */}
      <StepHeader
        stepNumber="03"
        title="Access Control"
        description="Define the tiers. From backstage passes to general admission, set the price and the privileges."
      />

      {/* Capacity Overview */}
      <div className="space-y-8">
        <SectionDivider variant="resistance">Capacity Monitor</SectionDivider>

        <div className="rounded-xl border border-grit-500/30 bg-ink-800/50 p-6 backdrop-blur-sm dark:border-grit-500/30 dark:bg-ink-800/50 light:border-grit-400/30 light:bg-bone-100/5">
          {selectedVenue ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm text-grit-300 dark:text-grit-300 light:text-grit-500">
                  Venue: {selectedVenue.name}
                </span>
                <span className="font-mono text-sm font-medium text-bone-100 dark:text-bone-100 light:text-ink-900">
                  Capacity: {selectedVenue.capacity}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-mono text-sm text-grit-300 dark:text-grit-300 light:text-grit-500">
                  Total Tickets: {totalCapacity}
                </span>
                <span
                  className={`font-mono text-sm font-medium ${
                    isOverCapacity
                      ? 'text-resistance-400'
                      : 'text-hack-green'
                  }`}
                >
                  {capacityPercentage}% of capacity
                </span>
              </div>

              {isOverCapacity && selectedVenue?.capacity && (
                <div className="mt-4 rounded-lg border border-resistance-500/30 bg-resistance-500/10 p-4">
                  <p className="flex items-start gap-2 font-mono text-sm text-resistance-400">
                    <span className="text-resistance-500">⚠</span>
                    Warning: Total tickets exceeds venue capacity by{' '}
                    {totalCapacity - selectedVenue.capacity} tickets
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center font-mono text-sm text-grit-400">
              <p>No venue selected yet.</p>
              <p className="mt-2">Select a venue in the Schedule step to see capacity information.</p>
            </div>
          )}
        </div>
      </div>

      {/* Ticket Tiers */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <SectionDivider variant="acid">Ticket Tiers</SectionDivider>
          <button
            type="button"
            onClick={onAddTicket}
            className="group inline-flex items-center gap-2 rounded-lg border border-acid-400/30 bg-acid-400/5 px-6 py-3 font-mono text-sm font-medium text-acid-400 transition-all hover:border-acid-400/50 hover:bg-acid-400/10 hover:shadow-lg hover:shadow-acid-400/20 focus:outline-none focus:ring-2 focus:ring-acid-400/50 dark:border-acid-400/30 dark:bg-acid-400/5 dark:text-acid-400 light:border-cobalt-500/30 light:bg-cobalt-500/5 light:text-cobalt-500 light:hover:border-cobalt-500/50 light:hover:bg-cobalt-500/10"
          >
            <svg className="h-5 w-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="uppercase tracking-wider">Add Ticket Tier</span>
          </button>
        </div>

        {ticketTypes.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-grit-500/30 bg-ink-900/20 p-12 text-center backdrop-blur-sm dark:border-grit-500/30 dark:bg-ink-900/20 light:border-grit-400/30 light:bg-bone-100/10">
            <p className="font-mono text-grit-400">
              No ticket tiers yet. Click &quot;Add Ticket Tier&quot; to create your first tier.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {ticketTypes.map((ticket, index) => (
              <TicketTypeCard
                key={ticket.id}
                ticket={ticket}
                index={index}
                errors={getTicketErrors(ticket.id)}
                handlers={{
                  onUpdate: onUpdateTicket,
                  onRemove: onRemoveTicket,
                  onAddPerk,
                  onUpdatePerk,
                  onRemovePerk,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
