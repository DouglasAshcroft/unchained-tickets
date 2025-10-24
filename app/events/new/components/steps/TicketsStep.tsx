'use client';

import { TicketTypeCard } from '../form/TicketTypeCard';
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
    <div className="space-y-8">
      {/* Step Description */}
      <div className="mb-6">
        <p className="text-gray-600">
          Configure ticket tiers for your event. Create different ticket tiers with varying prices, perks, and availability.
        </p>
      </div>

      {/* Capacity Overview */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h3 className="mb-3 text-lg font-semibold text-gray-900">Capacity Overview</h3>

        {selectedVenue ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Venue: {selectedVenue.name}</span>
              <span className="font-medium text-gray-900">
                Venue Capacity: {selectedVenue.capacity}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Total Tickets: {totalCapacity}</span>
              <span
                className={`font-medium ${
                  isOverCapacity ? 'text-red-600' : 'text-green-600'
                }`}
              >
                {capacityPercentage}% of capacity
              </span>
            </div>

            {isOverCapacity && selectedVenue?.capacity && (
              <div className="mt-2 rounded-md bg-red-50 p-3">
                <p className="text-sm text-red-600">
                  ⚠️ Warning: Total tickets exceeds venue capacity by{' '}
                  {totalCapacity - selectedVenue.capacity} tickets
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm text-gray-500">
            <p>No venue selected yet.</p>
            <p className="mt-1">Select a venue in the Schedule step to see capacity information.</p>
          </div>
        )}
      </div>

      {/* Ticket Tiers */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Ticket Tiers</h3>
          <button
            type="button"
            onClick={onAddTicket}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            + Add Ticket Tier
          </button>
        </div>

        {ticketTypes.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
            <p className="text-gray-500">
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
