import { describe, expect, it, beforeEach, vi } from 'vitest';

const mockPrisma = {
  event: { findUnique: vi.fn() },
  ticket: { create: vi.fn(), update: vi.fn() },
  charge: { create: vi.fn(), update: vi.fn() },
  wallet: { findUnique: vi.fn(), create: vi.fn() },
  nFTContract: { findFirst: vi.fn() },
  nFTMint: { create: vi.fn() },
};

vi.mock('@/lib/db/prisma', () => ({ prisma: mockPrisma }));

const mintTicketMock = vi.fn();
vi.mock('@/lib/services/NFTMintingService', () => ({
  NFTMintingService: vi.fn().mockImplementation(() => ({
    mintTicket: mintTicketMock,
  })),
}));

const createChargeMock = vi.fn();
vi.mock('@/lib/services/CoinbaseCommerceService', () => ({
  getCoinbaseCommerceService: vi.fn(() => ({ createCharge: createChargeMock })),
}));

const buildRequest = (body: any) =>
  new Request('http://localhost/api/checkout/create-charge', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

const TEST_EVENT = {
  id: 1,
  title: 'Resistance Fest',
  startsAt: new Date('2025-11-01T20:00:00Z'),
  venue: { name: 'Resistance Hall' },
};

beforeEach(() => {
  vi.clearAllMocks();
  process.env.NEXT_PUBLIC_DEV_MODE = 'true';
  process.env.BASE_RPC_URL = 'https://base-sepolia.example';
  process.env.MINTING_PRIVATE_KEY = '0xabc';
  process.env.NFT_CONTRACT_ADDRESS = '0x123';

  mockPrisma.event.findUnique.mockResolvedValue(TEST_EVENT);
  mockPrisma.ticket.create.mockResolvedValue({ id: 'ticket-id' });
  mockPrisma.wallet.findUnique.mockResolvedValue(null);
  mockPrisma.wallet.create.mockResolvedValue({ id: 10 });
  mockPrisma.nFTContract.findFirst.mockResolvedValue({ id: 20 });
  mockPrisma.charge.create.mockImplementation(({ data }: any) => ({ id: 'charge-db-id', ...data }));
  mockPrisma.charge.update.mockImplementation(({ data }: any) => ({ id: 'charge-db-id', ...data }));
});

describe('checkout create-charge handler (dev mode)', () => {
  it('returns mint-failed when minting service throws', async () => {
    mintTicketMock.mockRejectedValue(new Error('mint error'));

    const { POST } = await import('@/app/api/checkout/create-charge/route');
    const response = await POST(
      buildRequest({ eventId: 1, ticketTier: 'VIP', quantity: 1, totalPrice: 42, walletAddress: '0xWallet' })
    );

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.status).toBe('mint-failed');
    expect(json.chargeId).toBeDefined();
    expect(mockPrisma.charge.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'retrying',
          mintRetryCount: 1,
          mintLastError: 'mint error',
        }),
      })
    );
  });

  it('mints ticket and returns completed status in dev mode', async () => {
    mintTicketMock.mockResolvedValue({ txHash: '0xhash', tokenId: '123' });

    const { POST } = await import('@/app/api/checkout/create-charge/route');
    const response = await POST(
      buildRequest({ eventId: 1, ticketTier: 'VIP', quantity: 1, totalPrice: 42, walletAddress: '0xWallet' })
    );

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.status).toBe('completed');
    expect(json.tokenId).toBe('123');
    expect(mockPrisma.ticket.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'minted' }) })
    );
    expect(mockPrisma.charge.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'confirmed',
          mintRetryCount: 0,
          mintLastError: null,
        }),
      })
    );
  });
});

describe('checkout create-charge handler (production mode)', () => {
  it('calls Coinbase Commerce when dev mode disabled', async () => {
    process.env.NEXT_PUBLIC_DEV_MODE = 'false';
    createChargeMock.mockResolvedValue({ id: 'coinbase-id', hosted_url: 'https://hosted' });

    const { POST } = await import('@/app/api/checkout/create-charge/route');
    const response = await POST(buildRequest({ eventId: 1, ticketTier: 'VIP', quantity: 2, totalPrice: 84 }));

    expect(createChargeMock).toHaveBeenCalled();
    expect(response.status).toBe(201);
    const json = await response.json();
    expect(json.chargeId).toBe('coinbase-id');
    expect(json.status).toBe('pending');
  });
});
