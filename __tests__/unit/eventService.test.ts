import { describe, expect, it, beforeEach, beforeAll, vi } from 'vitest';
import type { TicketStatus } from '@prisma/client';

const mockEventRepository = {
  findById: vi.fn(),
  findMany: vi.fn(),
  findByVenueId: vi.fn(),
  findByArtistId: vi.fn(),
  search: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
};

const mockVenueRepository = {
  search: vi.fn(),
  findAll: vi.fn(),
  findBySlug: vi.fn(),
  findById: vi.fn(),
};

const mockArtistRepository = {
  search: vi.fn(),
  findAll: vi.fn(),
  findBySlug: vi.fn(),
};

vi.mock('@/lib/repositories/EventRepository', () => ({
  eventRepository: mockEventRepository,
}));

vi.mock('@/lib/repositories/VenueRepository', () => ({
  venueRepository: mockVenueRepository,
}));

vi.mock('@/lib/repositories/ArtistRepository', () => ({
  artistRepository: mockArtistRepository,
}));

let eventService: (typeof import('@/lib/services/EventService'))['eventService'];

beforeAll(async () => {
  ({ eventService } = await import('@/lib/services/EventService'));
});

describe('EventService.getEventById', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calculates ticket counts and supporting artists', async () => {
    const tickets = [
      { status: 'minted' as TicketStatus },
      { status: 'reserved' as TicketStatus },
      { status: 'used' as TicketStatus },
    ];

    mockEventRepository.findById.mockResolvedValue({
      id: 42,
      title: 'ChainFest',
      artists: [
        {
          isPrimary: true,
          artist: { id: 1, name: 'Headliner', slug: 'headliner', genre: 'EDM' },
        },
        {
          isPrimary: false,
          artist: { id: 2, name: 'Opener', slug: 'opener', genre: 'House' },
        },
      ],
      tickets,
    });

    const event = await eventService.getEventById(42);

    expect(event.totalTickets).toBe(3);
    expect(event.soldTickets).toBe(2);
    expect(event.availableTickets).toBe(1);
    expect(event.supportingArtists).toEqual([
      { id: 2, name: 'Opener', slug: 'opener', genre: 'House' },
    ]);
  });

  it('throws when event not found', async () => {
    mockEventRepository.findById.mockResolvedValue(null);

    await expect(eventService.getEventById(999)).rejects.toThrow('Event not found');
  });
});

describe('EventService.createEvent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('normalizes input and delegates to repository', async () => {
    const venueId = 5;
    const startsAt = '2025-01-10T20:00:00.000Z';
    const endsAt = '2025-01-10T23:00:00.000Z';

    mockVenueRepository.findById.mockResolvedValue({ id: venueId });

    const createdEvent = { id: 99, title: 'ChainFest' };
    mockEventRepository.create.mockResolvedValue(createdEvent);

    const result = await eventService.createEvent({
      title: '  ChainFest  ',
      startsAt,
      endsAt,
      venueId,
      posterImageUrl: '',
      mapsLink: 'https://maps.google.com/?q=ChainFest',
      externalLink: null,
      status: 'draft',
      primaryArtistId: null,
    });

    expect(mockEventRepository.create).toHaveBeenCalledWith({
      title: 'ChainFest',
      startsAt: new Date(startsAt),
      endsAt: new Date(endsAt),
      venueId,
      artistId: null,
      posterImageUrl: null,
      externalLink: null,
      mapsLink: 'https://maps.google.com/?q=ChainFest',
      status: 'draft',
    });
    expect(result).toBe(createdEvent);
  });

  it('throws if the venue does not exist', async () => {
    mockVenueRepository.findById.mockResolvedValue(null);

    await expect(
      eventService.createEvent({
        title: 'Missing Venue',
        startsAt: '2025-01-10T20:00:00.000Z',
        venueId: 999,
        posterImageUrl: null,
        externalLink: null,
        mapsLink: null,
        status: 'draft',
      })
    ).rejects.toThrow('Venue not found');
    expect(mockEventRepository.create).not.toHaveBeenCalled();
  });

  it('guards against invalid status transitions on create', async () => {
    mockVenueRepository.findById.mockResolvedValue({ id: 7 });

    await expect(
      eventService.createEvent({
        title: 'Bad Status',
        startsAt: '2025-01-10T20:00:00.000Z',
        venueId: 7,
        status: 'canceled',
        posterImageUrl: null,
        externalLink: null,
        mapsLink: null,
      })
    ).rejects.toThrow('New events can only be draft or published');
    expect(mockEventRepository.create).not.toHaveBeenCalled();
  });

  it('validates that end time is after start time', async () => {
    mockVenueRepository.findById.mockResolvedValue({ id: 3 });

    await expect(
      eventService.createEvent({
        title: 'Time Warp',
        startsAt: '2025-01-10T20:00:00.000Z',
        endsAt: '2025-01-10T19:00:00.000Z',
        venueId: 3,
        posterImageUrl: null,
        externalLink: null,
        mapsLink: null,
        status: 'draft',
      })
    ).rejects.toThrow('Event end time must be after the start time');
    expect(mockEventRepository.create).not.toHaveBeenCalled();
  });
});

describe('EventService.updateEvent', () => {
  const baseEvent = {
    id: 42,
    title: 'Original',
    startsAt: new Date('2025-02-01T18:00:00.000Z'),
    endsAt: new Date('2025-02-01T21:00:00.000Z'),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockEventRepository.findById.mockResolvedValue(baseEvent);
    mockEventRepository.update.mockResolvedValue({ ...baseEvent, title: 'Updated' });
  });

  it('updates event details with normalized payload', async () => {
    mockVenueRepository.findById.mockResolvedValue({ id: 11, name: 'Updated Venue' });

    const startsAt = '2025-02-02T18:30:00.000Z';
    const endsAt = '2025-02-02T22:00:00.000Z';

    const result = await eventService.updateEvent(42, {
      title: '  Updated  ',
      venueId: 11,
      startsAt,
      endsAt,
      posterImageUrl: '',
      status: 'published',
      primaryArtistId: null,
    });

    expect(mockVenueRepository.findById).toHaveBeenCalledWith(11);
    expect(mockEventRepository.update).toHaveBeenCalledWith(42, {
      title: 'Updated',
      venueId: 11,
      startsAt: new Date(startsAt),
      endsAt: new Date(endsAt),
      artistId: null,
      posterImageUrl: null,
      externalLink: undefined,
      mapsLink: undefined,
      status: 'published',
    });
    expect(result).toEqual({ ...baseEvent, title: 'Updated' });
  });

  it('throws when event is missing', async () => {
    mockEventRepository.findById.mockResolvedValue(null);

    await expect(
      eventService.updateEvent(404, {
        title: 'Missing',
      })
    ).rejects.toThrow('Event not found');
    expect(mockEventRepository.update).not.toHaveBeenCalled();
  });

  it('throws when new venue is invalid', async () => {
    mockVenueRepository.findById.mockResolvedValue(null);

    await expect(
      eventService.updateEvent(42, {
        venueId: 999,
      })
    ).rejects.toThrow('Venue not found');
    expect(mockEventRepository.update).not.toHaveBeenCalled();
  });

  it('validates end time after start time even when only one is provided', async () => {
    await expect(
      eventService.updateEvent(42, {
        endsAt: '2025-02-01T17:00:00.000Z',
      })
    ).rejects.toThrow('Event end time must be after the start time');
    expect(mockEventRepository.update).not.toHaveBeenCalled();
  });
});
