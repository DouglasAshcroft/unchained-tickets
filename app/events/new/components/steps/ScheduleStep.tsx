'use client';

import { VenueSearchInput } from '../form/VenueSearchInput';
import type { Venue } from '../../types';

interface ScheduleStepProps {
  formData: {
    startsAt: string;
    endsAt: string;
    doorsOpen: string;
    venueId: string;
    mapsLink: string;
  };
  errors: Record<string, string>;
  venues: Venue[];
  selectedVenue: Venue | null;
  handlers: {
    onFieldChange: (field: string, value: string) => void;
    onVenueSelect: (venue: Venue) => void;
  };
}

export function ScheduleStep({
  formData,
  errors,
  venues,
  selectedVenue,
  handlers,
}: ScheduleStepProps) {
  const { onFieldChange, onVenueSelect } = handlers;

  return (
    <div className="space-y-8">
      {/* Step Description */}
      <div className="mb-6">
        <p className="text-gray-600">
          Set the schedule for your event including date, time, and venue location.
        </p>
      </div>

      {/* Date & Time Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">Date & Time</h3>

        {/* Start Date/Time */}
        <div>
          <label htmlFor="start-date" className="mb-1 block text-sm font-medium text-gray-700">
            Start Date & Time *
          </label>
          <input
            id="start-date"
            type="datetime-local"
            value={formData.startsAt}
            onChange={(e) => onFieldChange('startsAt', e.target.value)}
            className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 ${
              errors?.startsAt
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
            aria-describedby={errors?.startsAt ? 'start-date-error' : 'start-date-help'}
          />
          <p id="start-date-help" className="mt-1 text-xs text-gray-500">
            When does the event start?
          </p>
          {errors?.startsAt && (
            <p id="start-date-error" className="mt-1 text-sm text-red-600">
              {errors.startsAt}
            </p>
          )}
        </div>

        {/* End Date/Time */}
        <div>
          <label htmlFor="end-date" className="mb-1 block text-sm font-medium text-gray-700">
            End Date & Time
          </label>
          <input
            id="end-date"
            type="datetime-local"
            value={formData.endsAt}
            onChange={(e) => onFieldChange('endsAt', e.target.value)}
            className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 ${
              errors?.endsAt
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
            aria-describedby="end-date-help"
          />
          <p id="end-date-help" className="mt-1 text-xs text-gray-500">
            Optional: When does the event end?
          </p>
          {errors?.endsAt && (
            <p className="mt-1 text-sm text-red-600">{errors.endsAt}</p>
          )}
        </div>

        {/* Doors Open */}
        <div>
          <label htmlFor="doors-open" className="mb-1 block text-sm font-medium text-gray-700">
            Doors Open
          </label>
          <input
            id="doors-open"
            type="datetime-local"
            value={formData.doorsOpen}
            onChange={(e) => onFieldChange('doorsOpen', e.target.value)}
            className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 ${
              errors?.doorsOpen
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
            aria-describedby="doors-open-help"
          />
          <p id="doors-open-help" className="mt-1 text-xs text-gray-500">
            Optional: When do doors open for attendees?
          </p>
          {errors?.doorsOpen && (
            <p className="mt-1 text-sm text-red-600">{errors.doorsOpen}</p>
          )}
        </div>
      </div>

      {/* Venue Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">Venue</h3>

        {/* Venue Search */}
        <div>
          <VenueSearchInput
            value={selectedVenue?.name || ''}
            onChange={(value) => {
              if (!value) {
                onFieldChange('venueId', '');
              }
            }}
            onSelect={onVenueSelect}
            venues={venues}
            label="Venue *"
            error={errors?.venueId}
            placeholder="Search by venue name or city..."
          />
        </div>

        {/* Maps Link */}
        <div>
          <label htmlFor="maps-link" className="mb-1 block text-sm font-medium text-gray-700">
            Maps Link *
          </label>
          <input
            id="maps-link"
            type="url"
            value={formData.mapsLink}
            onChange={(e) => onFieldChange('mapsLink', e.target.value)}
            className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 ${
              errors?.mapsLink
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
            placeholder="https://maps.google.com/?q=venue"
            aria-describedby="maps-link-help"
          />
          <p id="maps-link-help" className="mt-1 text-xs text-gray-500">
            Google Maps link to the venue location
          </p>
          {errors?.mapsLink && (
            <p className="mt-1 text-sm text-red-600">{errors.mapsLink}</p>
          )}
        </div>
      </div>
    </div>
  );
}
