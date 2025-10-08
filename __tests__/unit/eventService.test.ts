import { describe, expect, it, beforeEach, beforeAll, vi } from 'vitest';
import type { TicketStatus } from '@prisma/client';

const mockEventRepository = {
  findById: vi.fn(),
  findMany: vi.fn(),
  findByVenueId: vi.fn(),
  findByArtistId: vi.fn(),
  search: vi.fn(),
};

const mockVenueRepository = {
  search: vi.fn(),
  findAll: vi.fn(),
  findBySlug: vi.fn(),
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
