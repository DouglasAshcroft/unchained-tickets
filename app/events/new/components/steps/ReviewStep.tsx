'use client';

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
    <div className="space-y-8">
      {/* Step Description */}
      <div className="mb-6">
        <p className="text-gray-600">
          Review your event details before submitting. Please review all information carefully to ensure accuracy.
        </p>
      </div>

      {/* Event Details Section */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Event Details</h3>
        <div className="space-y-3">
          <div>
            <span className="text-sm font-medium text-gray-600">Title: </span>
            <span className="text-sm text-gray-900">{formData.title}</span>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-600">Artist: </span>
            <span className="text-sm text-gray-900">
              {selectedArtist?.name || 'Unknown artist'}
            </span>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-600">Poster: </span>
            <span className="text-sm text-gray-900">
              {formData.posterImageUrl ? formData.posterImageUrl : 'None'}
            </span>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-600">External Link: </span>
            <span className="text-sm text-gray-900">
              {formData.externalLink ? formData.externalLink : 'None'}
            </span>
          </div>
        </div>
      </div>

      {/* Schedule Section */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Schedule</h3>
        <div className="space-y-3">
          <div>
            <span className="text-sm font-medium text-gray-600">Venue: </span>
            <span className="text-sm text-gray-900">
              {selectedVenue?.name || 'Unknown venue'}
              {selectedVenue?.city && ` (${selectedVenue.city})`}
            </span>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-600">Start Time: </span>
            <span className="text-sm text-gray-900">{formatDateTime(formData.startsAt)}</span>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-600">End Time: </span>
            <span className="text-sm text-gray-900">{formatDateTime(formData.endsAt)}</span>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-600">Doors Open: </span>
            <span className="text-sm text-gray-900">{formatDateTime(formData.doorsOpen)}</span>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-600">Maps Link: </span>
            <span className="text-sm text-gray-900">{formData.mapsLink}</span>
          </div>
        </div>
      </div>

      {/* Tickets Section */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Tickets</h3>
        <div className="mb-4">
          <span className="text-sm font-medium text-gray-600">
            {formData.ticketTypes.length} ticket tier{formData.ticketTypes.length !== 1 ? 's' : ''}
          </span>
          <span className="ml-4 text-sm text-gray-600">
            Total capacity: {totalCapacity}
          </span>
        </div>

        <div className="space-y-4">
          {formData.ticketTypes.map((ticket: TicketTypeForm) => (
            <div key={ticket.id} className="rounded-md border border-gray-200 bg-gray-50 p-4">
              <div className="mb-2 font-medium text-gray-900">{ticket.name}</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">Price: </span>
                  <span className="text-gray-900">{formatPrice(ticket.price, ticket.currency)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Capacity: </span>
                  <span className="text-gray-900">{ticket.capacity} tickets</span>
                </div>
                {ticket.description && (
                  <div className="col-span-2">
                    <span className="text-gray-600">Description: </span>
                    <span className="text-gray-900">{ticket.description}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Helper Message */}
      <div className="rounded-lg bg-blue-50 p-4">
        <p className="text-sm text-blue-800">
          ✓ Everything looks good? Click &quot;Create Event&quot; to publish your event!
        </p>
      </div>
    </div>
  );
}
