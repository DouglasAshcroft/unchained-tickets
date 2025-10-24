'use client';

import { VenueSearchInput } from '../form/VenueSearchInput';
import { FormInput, SectionDivider, StepHeader } from '@/components/ui/forms';
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
    <div className="space-y-10">
      {/* Step Description */}
      <StepHeader
        stepNumber="02"
        title="Time & Place"
        description="Lock in the coordinates. When the beat drops and where the crowd gathers."
      />

      {/* Date & Time Section */}
      <div className="space-y-8">
        <SectionDivider variant="hack">Timeline</SectionDivider>

        {/* Start Date/Time */}
        <FormInput
          id="start-date"
          label="Start Date & Time"
          type="datetime-local"
          required
          value={formData.startsAt}
          onChange={(e) => onFieldChange('startsAt', e.target.value)}
          helperText="When does the event start?"
          error={errors?.startsAt}
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />

        {/* End Date/Time */}
        <FormInput
          id="end-date"
          label="End Date & Time"
          type="datetime-local"
          value={formData.endsAt}
          onChange={(e) => onFieldChange('endsAt', e.target.value)}
          helperText="Optional: When does the event end?"
          error={errors?.endsAt}
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        {/* Doors Open */}
        <FormInput
          id="doors-open"
          label="Doors Open"
          type="datetime-local"
          value={formData.doorsOpen}
          onChange={(e) => onFieldChange('doorsOpen', e.target.value)}
          helperText="Optional: When do doors open for attendees?"
          error={errors?.doorsOpen}
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          }
        />
      </div>

      {/* Venue Section */}
      <div className="space-y-8">
        <SectionDivider variant="acid">Location</SectionDivider>

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
        <FormInput
          id="maps-link"
          label="Maps Link"
          type="url"
          required
          value={formData.mapsLink}
          onChange={(e) => onFieldChange('mapsLink', e.target.value)}
          placeholder="https://maps.google.com/?q=venue"
          helperText="Google Maps link to the venue location"
          error={errors?.mapsLink}
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />
      </div>
    </div>
  );
}
