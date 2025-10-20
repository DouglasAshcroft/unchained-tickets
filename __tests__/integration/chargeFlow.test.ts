import { describe, it, expect, beforeEach, vi } from 'vitest';

const mockPrisma = {
  event: { findUnique: vi.fn() },
  ticket: { create: vi.fn(), update: vi.fn(), findUnique: vi.fn(), delete: vi.fn() },
  charge: { create: vi.fn(), update: vi.fn(), updateMany: vi.fn(), findUnique: vi.fn() },
  wallet: { findUnique: vi.fn(), create: vi.fn() },
  nFTContract: { findFirst: vi.fn() },
  nFTMint: { create: vi.fn() },
  $transaction: vi.fn((callback) => {
    // For transactions, call the callback with the mock prisma client
    if (typeof callback === 'function') {
      return callback(mockPrisma);
    }
    // For array-based transactions, return the results
    return Promise.all(callback);
  }),
};

vi.mock('@/lib/db/prisma', () => ({ prisma: mockPrisma }));

const mintTicketMock = vi.fn();
vi.mock('@/lib/services/NFTMintingService', () => ({
  NFTMintingService: vi.fn().mockImplementation(() => ({ mintTicket: mintTicketMock })),
}));

const createChargeMock = vi.fn();
vi.mock('@/lib/services/CoinbaseCommerceService', () => ({
  getCoinbaseCommerceService: vi.fn(() => ({
    createCharge: createChargeMock,
  })),
  CoinbaseCommerceService: {
    verifyWebhookSignature: vi.fn(() => true),
  },
}));

describe('charge flow', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockPrisma.event.findUnique.mockResolvedValue({
      id: 1,
      title: 'Resistance Fest',
      startsAt: new Date('2025-11-01T20:00:00Z'),
      venue: { name: 'Resistance Hall' },
    });
    mockPrisma.ticket.create.mockResolvedValue({
      id: 'ticket-id',
      status: 'reserved',
    });
    mockPrisma.charge.create.mockImplementation(({ data }) => Promise.resolve({ id: 'charge-db-id', ...data }));
    createChargeMock.mockResolvedValue({
      id: 'coinbase-charge-id',
      hosted_url: 'https://commerce.coinbase.com/charges/test',
    });
  });

  it('creates a coinbase charge in production mode', async () => {
    process.env.NEXT_PUBLIC_DEV_MODE = 'false';
    const { POST } = await import('@/app/api/checkout/create-charge/route');

    const response = await POST(new Request('http://localhost/api/checkout/create-charge', {
      method: 'POST',
      body: JSON.stringify({
        eventId: 1,
        ticketTier: 'VIP',
        quantity: 2,
        totalPrice: 100,
      }),
    }));

    expect(createChargeMock).toHaveBeenCalledWith(expect.objectContaining({
      name: expect.stringContaining('Resistance Fest'),
      metadata: expect.objectContaining({ ticketTier: 'VIP', quantity: 2 }),
    }));

    const json = await response.json();
    expect(json.chargeId).toBe('coinbase-charge-id');
    expect(json.status).toBe('pending');
    expect(mockPrisma.charge.create).toHaveBeenCalled();
  });
});
