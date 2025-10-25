import { validateBlockchainReadiness } from '../blockchainValidation';
import type { EventStatus } from '@prisma/client';

describe('validateBlockchainReadiness', () => {
  const createValidEvent = () => ({
    id: 1,
    title: 'Test Event',
    startsAt: new Date(Date.now() + 86400000), // Tomorrow
    endsAt: null,
    venueId: 1,
    venue: {
      id: 1,
      name: 'Test Venue',
      city: 'Test City',
      state: 'TS',
    },
    primaryArtistId: 1,
    primaryArtist: {
      id: 1,
      name: 'Test Artist',
      genre: 'Rock',
    },
    ticketTypes: [
      {
        id: 1,
        name: 'General Admission',
        isActive: true,
        capacity: 100,
      },
    ],
    posterImageUrl: 'https://example.com/poster.jpg',
    status: 'draft' as EventStatus,
  });

  it('returns ready when event has all requirements', () => {
    const event = createValidEvent();
    const result = validateBlockchainReadiness(event);

    expect(result.ready).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });

  it('fails when missing venue', () => {
    const event = createValidEvent();
    event.venueId = null as any;
    event.venue = null as any;

    const result = validateBlockchainReadiness(event);

    expect(result.ready).toBe(false);
    expect(result.errors).toContain('Event must have a venue');
  });

  it('fails when missing artist', () => {
    const event = createValidEvent();
    event.primaryArtistId = null;
    event.primaryArtist = null;

    const result = validateBlockchainReadiness(event);

    expect(result.ready).toBe(false);
    expect(result.errors).toContain('Event must have a primary artist');
  });

  it('fails when artist has no genre', () => {
    const event = createValidEvent();
    event.primaryArtist = {
      id: 1,
      name: 'Test Artist',
      genre: null,
    } as any;

    const result = validateBlockchainReadiness(event);

    expect(result.ready).toBe(false);
    expect(result.errors).toContain('Primary artist must have a genre');
  });

  it('fails when event date is in past', () => {
    const event = createValidEvent();
    event.startsAt = new Date(Date.now() - 86400000); // Yesterday

    const result = validateBlockchainReadiness(event);

    expect(result.ready).toBe(false);
    expect(result.errors).toContain('Event start date must be in the future');
  });

  it('fails when no active ticket types', () => {
    const event = createValidEvent();
    event.ticketTypes = [];

    const result = validateBlockchainReadiness(event);

    expect(result.ready).toBe(false);
    expect(result.errors).toContain('Event must have at least one active ticket type');
  });

  it('fails when all ticket types are inactive', () => {
    const event = createValidEvent();
    event.ticketTypes = [
      {
        id: 1,
        name: 'Inactive Tier',
        isActive: false,
        capacity: 100,
      },
    ];

    const result = validateBlockchainReadiness(event);

    expect(result.ready).toBe(false);
    expect(result.errors).toContain('Event must have at least one active ticket type');
  });

  it('warns when no poster image', () => {
    const event = {
      ...createValidEvent(),
      posterImageUrl: null,
    };

    const result = validateBlockchainReadiness(event);

    expect(result.ready).toBe(true); // Not required for blockchain, but warned
    expect(result.warnings).toContain('Event has no poster image');
  });

  it('handles multiple errors correctly', () => {
    const event = createValidEvent();
    event.venueId = null as any;
    event.venue = null as any;
    event.primaryArtistId = null;
    event.primaryArtist = null;
    event.ticketTypes = [];

    const result = validateBlockchainReadiness(event);

    expect(result.ready).toBe(false);
    expect(result.errors.length).toBeGreaterThan(1);
    expect(result.errors).toContain('Event must have a venue');
    expect(result.errors).toContain('Event must have a primary artist');
    expect(result.errors).toContain('Event must have at least one active ticket type');
  });

  it('provides detailed validation state for UI', () => {
    const event = createValidEvent();
    const result = validateBlockchainReadiness(event);

    expect(result).toHaveProperty('ready');
    expect(result).toHaveProperty('errors');
    expect(result).toHaveProperty('warnings');
    expect(result).toHaveProperty('checks');
    expect(result.checks).toMatchObject({
      hasVenue: true,
      hasArtist: true,
      hasGenre: true,
      isFutureDate: true,
      hasActiveTickets: true,
    });
  });
});
