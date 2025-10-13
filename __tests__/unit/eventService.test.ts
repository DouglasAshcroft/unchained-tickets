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
  findById: vi.fn(),
};

const mockPrisma = {
  $transaction: vi.fn(),
  venueSeatMap: {
    findFirst: vi.fn(),
  },
  seatPosition: {
    findMany: vi.fn(),
  },
  ticketPerk: {
    createMany: vi.fn(),
  },
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

vi.mock('@/lib/db/prisma', () => ({
  prisma: mockPrisma,
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

  const buildTransactionMocks = () => {
    const createdEvent = { id: 99, title: 'ChainFest' };
    const assignmentRecord = { id: 777 };

    const tx = {
      event: {
        create: vi.fn().mockResolvedValue(createdEvent),
      },
      eventTicketType: {
        create: vi.fn().mockResolvedValue({ id: 321, name: 'GA' }),
      },
      eventSeatMapAssignment: {
        create: vi.fn().mockResolvedValue(assignmentRecord),
      },
      eventReservedSeat: {
        createMany: vi.fn(),
      },
      ticketPerk: {
        createMany: vi.fn(),
      },
    };

    mockPrisma.$transaction.mockImplementation(async (callback) =>
      callback(tx as any)
    );

    return { tx, createdEvent, assignmentRecord };
  };

  it('normalizes input, persists ticket types, and returns hydrated event', async () => {
    const venueId = 5;
    const startsAt = '2025-01-10T20:00:00.000Z';
    const endsAt = '2025-01-10T23:00:00.000Z';

    mockVenueRepository.findById.mockResolvedValue({ id: venueId });
    const { tx, createdEvent } = buildTransactionMocks();
    mockEventRepository.findById.mockResolvedValue({
      ...createdEvent,
      tickets: [],
      ticketTypes: [],
      seatMapAssignments: [],
      artists: [],
    });

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
      ticketTypes: [
        {
          name: 'GA',
          pricingType: 'general_admission',
          priceCents: 5000,
          currency: 'usd',
          capacity: 200,
          isActive: true,
        },
      ],
    });

    expect(tx.event.create).toHaveBeenCalledWith({
      data: {
        title: 'ChainFest',
        startsAt: new Date(startsAt),
        endsAt: new Date(endsAt),
        venueId,
        artistId: null,
        posterImageUrl: null,
        externalLink: null,
        mapsLink: 'https://maps.google.com/?q=ChainFest',
        status: 'draft',
      },
    });
    expect(tx.eventTicketType.create).toHaveBeenCalledWith({
      data: {
        eventId: createdEvent.id,
        name: 'GA',
        description: null,
        pricingType: 'general_admission',
        priceCents: 5000,
        currency: 'USD',
        capacity: 200,
        salesStart: null,
        salesEnd: null,
        isActive: true,
      },
    });
    expect(tx.ticketPerk.createMany).not.toHaveBeenCalled();
    expect(tx.eventSeatMapAssignment.create).not.toHaveBeenCalled();
    expect(tx.eventReservedSeat.createMany).not.toHaveBeenCalled();
    expect(result.id).toBe(createdEvent.id);
    expect(mockEventRepository.findById).toHaveBeenCalledWith(createdEvent.id);
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
        ticketTypes: [
          {
            name: 'GA',
            pricingType: 'general_admission',
          },
        ] as any,
      })
    ).rejects.toThrow('Venue not found');
    expect(mockPrisma.$transaction).not.toHaveBeenCalled();
  });

  it('creates perks for ticket types when provided', async () => {
    const venueId = 8;
    mockVenueRepository.findById.mockResolvedValue({ id: venueId });

    const { tx, createdEvent } = buildTransactionMocks();
    tx.eventTicketType.create.mockResolvedValueOnce({ id: 555, name: 'VIP' });
    mockEventRepository.findById.mockResolvedValue({
      ...createdEvent,
      tickets: [],
      ticketTypes: [],
      seatMapAssignments: [],
      artists: [],
    });

    await eventService.createEvent({
      title: 'VIP Bash',
      startsAt: '2025-03-01T18:00:00.000Z',
      venueId,
      posterImageUrl: '',
      mapsLink: '',
      externalLink: '',
      status: 'draft',
      primaryArtistId: null,
      ticketTypes: [
        {
          name: 'VIP',
          pricingType: 'general_admission',
          perks: [
            {
              name: 'Welcome Drink',
              description: 'Includes one complimentary cocktail',
              instructions: 'Redeem at the main bar',
              quantity: 2,
            },
          ],
        },
      ],
    });

    expect(tx.ticketPerk.createMany).toHaveBeenCalledWith({
      data: [
        {
          ticketTypeId: 555,
          name: 'Welcome Drink',
          description: 'Includes one complimentary cocktail',
          instructions: 'Redeem at the main bar',
          quantity: 2,
        },
      ],
    });
  });

  it('throws if primary artist does not exist', async () => {
    mockVenueRepository.findById.mockResolvedValue({ id: 5 });
    mockArtistRepository.findById.mockResolvedValue(null);

    await expect(
      eventService.createEvent({
        title: 'Missing Artist',
        startsAt: '2025-04-01T20:00:00.000Z',
        venueId: 5,
        primaryArtistId: 999,
        ticketTypes: [
          {
            name: 'GA',
            pricingType: 'general_admission',
          },
        ] as any,
      })
    ).rejects.toThrow('Artist not found');
    expect(mockPrisma.$transaction).not.toHaveBeenCalled();
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
        ticketTypes: [
          {
            name: 'GA',
            pricingType: 'general_admission',
          },
        ] as any,
      })
    ).rejects.toThrow('New events can only be draft or published');
    expect(mockPrisma.$transaction).not.toHaveBeenCalled();
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
        ticketTypes: [
          {
            name: 'GA',
            pricingType: 'general_admission',
          },
        ] as any,
      })
    ).rejects.toThrow('Event end time must be after the start time');
    expect(mockPrisma.$transaction).not.toHaveBeenCalled();
  });

  it('allows reserved tiers without an immediate seat map assignment', async () => {
    mockVenueRepository.findById.mockResolvedValue({ id: 12 });
    const createdEvent = { id: 301, title: 'Seated Show' };
    buildTransactionMocks();
    mockEventRepository.findById.mockResolvedValue({
      ...createdEvent,
      tickets: [],
      ticketTypes: [],
      seatMapAssignments: [],
      artists: [],
    });

    await expect(
      eventService.createEvent({
        title: 'Seated Show',
        startsAt: '2025-05-20T19:00:00.000Z',
        venueId: 12,
        posterImageUrl: null,
        externalLink: null,
        mapsLink: null,
        status: 'draft',
        ticketTypes: [
          {
            name: 'Balcony',
            pricingType: 'reserved',
          },
        ] as any,
      })
    ).resolves.not.toThrow();
  });

  it('assigns reserved seats when seat map is provided', async () => {
    const venueId = 22;
    mockVenueRepository.findById.mockResolvedValue({ id: venueId });
    mockPrisma.venueSeatMap.findFirst.mockResolvedValue({ id: 91, venueId });
    mockPrisma.seatPosition.findMany.mockResolvedValue([
      { id: 501 },
      { id: 502 },
    ]);

    const { tx, createdEvent, assignmentRecord } = buildTransactionMocks();
    mockEventRepository.findById.mockResolvedValue({
      ...createdEvent,
      tickets: [],
      ticketTypes: [],
      seatMapAssignments: [],
      artists: [],
    });

    await eventService.createEvent({
      title: 'Seated Show',
      startsAt: '2025-05-20T19:00:00.000Z',
      venueId,
      seatMapId: 91,
      posterImageUrl: null,
      externalLink: null,
      mapsLink: null,
      status: 'draft',
      ticketTypes: [
        {
          name: 'Balcony',
          pricingType: 'reserved',
          priceCents: 12000,
          currency: 'usd',
          capacity: 2,
        },
      ] as any,
    });

    expect(mockPrisma.venueSeatMap.findFirst).toHaveBeenCalledWith({
      where: { id: 91, venueId },
      select: { id: true },
    });
    expect(mockPrisma.seatPosition.findMany).toHaveBeenCalledWith({
      where: {
        row: {
          section: {
            seatMapId: 91,
          },
        },
      },
      select: { id: true },
    });
    expect(tx.eventSeatMapAssignment.create).toHaveBeenCalledWith({
      data: {
        eventId: createdEvent.id,
        seatMapId: 91,
        isPrimary: true,
      },
    });
    expect(tx.eventReservedSeat.createMany).toHaveBeenCalledWith({
      data: [
        {
          eventSeatMapAssignmentId: assignmentRecord.id,
          seatPositionId: 501,
        },
        {
          eventSeatMapAssignmentId: assignmentRecord.id,
          seatPositionId: 502,
        },
      ],
    });
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
