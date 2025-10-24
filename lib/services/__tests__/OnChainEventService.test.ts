/**
 * OnChainEventService Tests
 *
 * Tests the CORE blockchain integration functionality - registering events
 * and ticket tiers on-chain. This is critical infrastructure that enables
 * NFT ticket minting for venues.
 *
 * These are unit tests using mocked dependencies (Prisma + viem).
 * Integration tests that hit real blockchain are in e2e tests.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Create mock functions outside of the mock factory
let mockPrismaEvent: any;
let mockPrismaEventBlockchainRegistry: any;
let mockPrismaEventTicketType: any;
let mockPrismaEventTierBlockchainRegistry: any;
let mockSimulate: any;
let mockWriteContract: any;
let mockWaitForReceipt: any;

// Mock Prisma client BEFORE imports
vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    get event() { return mockPrismaEvent; },
    get eventBlockchainRegistry() { return mockPrismaEventBlockchainRegistry; },
    get eventTicketType() { return mockPrismaEventTicketType; },
    get eventTierBlockchainRegistry() { return mockPrismaEventTierBlockchainRegistry; },
  },
}));

// Mock viem clients
vi.mock('viem', () => ({
  createPublicClient: vi.fn(() => ({
    get simulateContract() { return mockSimulate; },
    get waitForTransactionReceipt() { return mockWaitForReceipt; },
  })),
  createWalletClient: vi.fn(() => ({
    get writeContract() { return mockWriteContract; },
  })),
  http: vi.fn(),
}));

vi.mock('viem/accounts', () => ({
  privateKeyToAccount: vi.fn(() => ({
    address: '0xMINTING_WALLET_ADDRESS' as `0x${string}`,
  })),
}));

vi.mock('viem/chains', () => ({
  base: { id: 8453, name: 'Base' },
  baseSepolia: { id: 84532, name: 'Base Sepolia' },
}));

// Now import the module under test
import {
  registerEventOnChain,
  registerTiersOnChain,
  getOnChainEventId,
  isEventRegisteredOnChain,
  getBlockchainRegistry,
} from '../OnChainEventService';

// Mock environment variables
const originalEnv = process.env;
beforeEach(() => {
  // Initialize mock functions
  mockPrismaEvent = {
    findUnique: vi.fn(),
  };
  mockPrismaEventBlockchainRegistry = {
    findUnique: vi.fn(),
    create: vi.fn(),
  };
  mockPrismaEventTicketType = {
    findMany: vi.fn(),
  };
  mockPrismaEventTierBlockchainRegistry = {
    findFirst: vi.fn(),
    create: vi.fn(),
    findMany: vi.fn(),
  };
  mockSimulate = vi.fn();
  mockWriteContract = vi.fn();
  mockWaitForReceipt = vi.fn();

  process.env = {
    ...originalEnv,
    NEXT_PUBLIC_CHAIN_ID: '84532',
    BASE_RPC_URL: 'https://sepolia.base.org',
    NFT_CONTRACT_ADDRESS: '0xCONTRACT_ADDRESS',
    MINTING_PRIVATE_KEY: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
  };

  // Set default mock returns
  mockSimulate.mockResolvedValue({});
  mockWriteContract.mockResolvedValue('0xTRANSACTION_HASH');
  mockWaitForReceipt.mockResolvedValue({
    status: 'success',
    blockNumber: 12345n,
  });
});

afterEach(() => {
  process.env = originalEnv;
});

describe('OnChainEventService', () => {
  describe('registerEventOnChain', () => {
    it('should register a new event on the blockchain', async () => {
      // Arrange: Mock database responses
      const mockEvent = {
        id: 1,
        title: 'Test Concert',
        startsAt: new Date('2025-12-01T20:00:00Z'),
        endsAt: new Date('2025-12-01T23:00:00Z'),
        venueId: 1,
        artistId: 1,
        status: 'published',
        venue: { id: 1, name: 'Test Venue' },
        artists: [{ artist: { id: 1, name: 'Test Artist' } }],
        ticketTypes: [
          {
            id: 1,
            eventId: 1,
            name: 'General Admission',
            priceCents: 5000,
            capacity: 200,
            isActive: true,
          },
        ],
      };

      mockPrismaEventBlockchainRegistry.findUnique.mockResolvedValueOnce(null); // Not registered yet
      mockPrismaEvent.findUnique.mockResolvedValueOnce(mockEvent);
      mockPrismaEventBlockchainRegistry.create.mockResolvedValueOnce({
        id: 1,
        eventId: 1,
        onChainEventId: 1,
        contractAddress: '0xCONTRACT_ADDRESS',
        registrationTxHash: '0xTRANSACTION_HASH',
        registeredAt: new Date(),
        chainId: 84532,
      });

      // Act: Register event on blockchain
      const result = await registerEventOnChain(1);

      // Assert: Verify successful registration
      expect(result.success).toBe(true);
      expect(result.onChainEventId).toBe(1);
      expect(result.txHash).toBe('0xTRANSACTION_HASH');

      // Verify blockchain calls
      expect(mockSimulate).toHaveBeenCalledWith(
        expect.objectContaining({
          functionName: 'createEvent',
          args: expect.arrayContaining([
            BigInt(1), // onChainEventId
            BigInt(200), // maxSupply (total capacity)
          ]),
        })
      );

      expect(mockWriteContract).toHaveBeenCalled();
      expect(mockWaitForReceipt).toHaveBeenCalledWith({ hash: '0xTRANSACTION_HASH' });

      // Verify database create was called
      expect(mockPrismaEventBlockchainRegistry.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          eventId: 1,
          onChainEventId: 1,
          contractAddress: '0xTEST_CONTRACT_ADDRESS',
          registrationTxHash: '0xTRANSACTION_HASH',
          chainId: 84532,
        }),
      });
    });

    it('should return existing registration if event is already registered', async () => {
      // Arrange: Mock existing registration
      const existingRegistry = {
        id: 1,
        eventId: 1,
        onChainEventId: 1,
        contractAddress: '0xCONTRACT_ADDRESS',
        registrationTxHash: '0xEXISTING_HASH',
        registeredAt: new Date(),
        chainId: 84532,
      };

      mockPrismaEventBlockchainRegistry.findUnique.mockResolvedValueOnce(existingRegistry);

      // Act: Try to register again
      const result = await registerEventOnChain(1);

      // Assert: Should return existing registration without blockchain calls
      expect(result.success).toBe(true);
      expect(result.onChainEventId).toBe(1);
      expect(result.txHash).toBe('0xEXISTING_HASH');

      // Verify NO blockchain calls were made
      expect(mockSimulate).not.toHaveBeenCalled();
      expect(mockWriteContract).not.toHaveBeenCalled();

      // Verify NO new database record was created
      expect(mockPrismaEventBlockchainRegistry.create).not.toHaveBeenCalled();
    });

    it('should return error if event does not exist', async () => {
      // Arrange: Mock database to return null event
      mockPrismaEventBlockchainRegistry.findUnique.mockResolvedValueOnce(null);
      mockPrismaEvent.findUnique.mockResolvedValueOnce(null);

      // Act: Try to register non-existent event
      const result = await registerEventOnChain(999999);

      // Assert: Should return error
      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');

      // Verify NO blockchain calls
      expect(mockWriteContract).not.toHaveBeenCalled();
    });

    it('should calculate correct total capacity from multiple ticket types', async () => {
      // Arrange: Event with 3 ticket types
      const mockEvent = {
        id: 1,
        title: 'Multi-Tier Event',
        startsAt: new Date('2025-12-01T20:00:00Z'),
        venueId: 1,
        status: 'published',
        venue: { id: 1, name: 'Test Venue' },
        artists: [],
        ticketTypes: [
          { id: 1, name: 'VIP', capacity: 50, priceCents: 10000, isActive: true },
          { id: 2, name: 'Premium', capacity: 100, priceCents: 7500, isActive: true },
          { id: 3, name: 'GA', capacity: 300, priceCents: 5000, isActive: true },
        ],
      };

      mockPrismaEventBlockchainRegistry.findUnique.mockResolvedValueOnce(null);
      mockPrismaEvent.findUnique.mockResolvedValueOnce(mockEvent);
      mockPrismaEventBlockchainRegistry.create.mockResolvedValueOnce({
        id: 1,
        eventId: 1,
        onChainEventId: 1,
        contractAddress: '0xCONTRACT_ADDRESS',
        registrationTxHash: '0xTRANSACTION_HASH',
        registeredAt: new Date(),
        chainId: 84532,
      });

      // Act: Register event
      const result = await registerEventOnChain(1);

      // Assert: Check that maxSupply was calculated correctly (50 + 100 + 300 = 450)
      expect(result.success).toBe(true);
      expect(mockSimulate).toHaveBeenCalledWith(
        expect.objectContaining({
          args: expect.arrayContaining([
            BigInt(1), // onChainEventId
            BigInt(450), // maxSupply should be total of all capacities
          ]),
        })
      );
    });

    it('should handle blockchain transaction reverted', async () => {
      // Arrange
      const mockEvent = {
        id: 1,
        title: 'Test',
        startsAt: new Date(),
        venueId: 1,
        status: 'published',
        venue: {},
        artists: [],
        ticketTypes: [{ capacity: 100 }],
      };

      mockPrismaEventBlockchainRegistry.findUnique.mockResolvedValueOnce(null);
      mockPrismaEvent.findUnique.mockResolvedValueOnce(mockEvent);
      mockWaitForReceipt.mockResolvedValueOnce({
        status: 'reverted',
        blockNumber: 12345n,
      });

      // Act
      const result = await registerEventOnChain(1);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('reverted');

      // Verify NO database record was created
      expect(mockPrismaEventBlockchainRegistry.create).not.toHaveBeenCalled();
    });

    it('should handle simulation failures', async () => {
      // Arrange
      const mockEvent = {
        id: 1,
        title: 'Test',
        startsAt: new Date(),
        venueId: 1,
        status: 'published',
        venue: {},
        artists: [],
        ticketTypes: [{ capacity: 100 }],
      };

      mockPrismaEventBlockchainRegistry.findUnique.mockResolvedValueOnce(null);
      mockPrismaEvent.findUnique.mockResolvedValueOnce(mockEvent);
      mockSimulate.mockRejectedValueOnce(new Error('Insufficient gas'));

      // Act
      const result = await registerEventOnChain(1);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('simulation failed');

      // Verify transaction was NOT sent
      expect(mockWriteContract).not.toHaveBeenCalled();
    });
  });

  describe('registerTiersOnChain', () => {
    it('should register all active ticket tiers on the blockchain', async () => {
      // Arrange: Mock event with blockchain registration
      const mockRegistry = {
        id: 1,
        eventId: 1,
        onChainEventId: 1,
        contractAddress: '0xCONTRACT_ADDRESS',
        registrationTxHash: '0xEVENT_HASH',
        registeredAt: new Date(),
        chainId: 84532,
      };

      const mockTiers = [
        { id: 1, eventId: 1, name: 'VIP', capacity: 50, priceCents: 10000, isActive: true },
        { id: 2, eventId: 1, name: 'Premium', capacity: 100, priceCents: 7500, isActive: true },
        { id: 3, eventId: 1, name: 'General Admission', capacity: 300, priceCents: 5000, isActive: true },
      ];

      mockPrismaEventBlockchainRegistry.findUnique.mockResolvedValueOnce(mockRegistry);
      mockPrismaEventTicketType.findMany.mockResolvedValueOnce(mockTiers);
      mockPrismaEventTierBlockchainRegistry.findFirst.mockResolvedValue(null); // None registered yet
      mockPrismaEventTierBlockchainRegistry.create.mockResolvedValue({});

      // Act: Register tiers
      const results = await registerTiersOnChain(1);

      // Assert: All tiers should be registered
      expect(results).toHaveLength(3);
      expect(results.every(r => r.success)).toBe(true);
      expect(results[0].tierName).toBe('VIP'); // Most expensive first (sorted by priceCents desc)
      expect(results[1].tierName).toBe('Premium');
      expect(results[2].tierName).toBe('General Admission');

      // Verify blockchain calls (3 tiers = 3 simulate + 3 write + 3 wait)
      expect(mockSimulate).toHaveBeenCalledTimes(3);
      expect(mockWriteContract).toHaveBeenCalledTimes(3);
      expect(mockWaitForReceipt).toHaveBeenCalledTimes(3);

      // Verify database creates
      expect(mockPrismaEventTierBlockchainRegistry.create).toHaveBeenCalledTimes(3);
    });

    it('should throw error if event is not registered on blockchain first', async () => {
      // Arrange: No blockchain registration
      mockPrismaEventBlockchainRegistry.findUnique.mockResolvedValueOnce(null);

      // Act & Assert: Should throw error
      await expect(registerTiersOnChain(1)).rejects.toThrow(
        /not registered on blockchain/i
      );

      // Verify NO blockchain calls
      expect(mockWriteContract).not.toHaveBeenCalled();
    });

    it('should skip already registered tiers', async () => {
      // Arrange: One tier already registered
      const mockRegistry = {
        id: 1,
        eventId: 1,
        onChainEventId: 1,
      };

      const mockTiers = [
        { id: 1, eventId: 1, name: 'VIP', capacity: 50, priceCents: 10000, isActive: true },
        { id: 2, eventId: 1, name: 'GA', capacity: 300, priceCents: 5000, isActive: true },
      ];

      mockPrismaEventBlockchainRegistry.findUnique.mockResolvedValueOnce(mockRegistry);
      mockPrismaEventTicketType.findMany.mockResolvedValueOnce(mockTiers);

      // VIP is already registered
      mockPrismaEventTierBlockchainRegistry.findFirst
        .mockResolvedValueOnce({
          id: 1,
          registryId: 1,
          ticketTypeId: 1,
          onChainTierId: 0,
          registrationTxHash: '0xEXISTING_TIER_HASH',
          registeredAt: new Date(),
        })
        .mockResolvedValueOnce(null); // GA not registered

      mockPrismaEventTierBlockchainRegistry.create.mockResolvedValue({});

      // Act: Register tiers (should skip VIP, register GA)
      const results = await registerTiersOnChain(1);

      // Assert: Both returned, VIP uses existing hash
      expect(results).toHaveLength(2);
      expect(results[0].tierName).toBe('VIP');
      expect(results[0].txHash).toBe('0xEXISTING_TIER_HASH');
      expect(results[1].tierName).toBe('GA');
      expect(results[1].txHash).toBe('0xTRANSACTION_HASH');

      // Verify only 1 blockchain call (for GA, VIP was skipped)
      expect(mockSimulate).toHaveBeenCalledTimes(1);
      expect(mockWriteContract).toHaveBeenCalledTimes(1);
      expect(mockPrismaEventTierBlockchainRegistry.create).toHaveBeenCalledTimes(1);
    });

    it('should return empty array if no active ticket types', async () => {
      // Arrange: No active tiers
      mockPrismaEventBlockchainRegistry.findUnique.mockResolvedValueOnce({ id: 1, eventId: 1 });
      mockPrismaEventTicketType.findMany.mockResolvedValueOnce([]);

      // Act: Register tiers (none exist)
      const results = await registerTiersOnChain(1);

      // Assert: Empty array
      expect(results).toEqual([]);

      // Verify NO blockchain calls
      expect(mockWriteContract).not.toHaveBeenCalled();
    });

    it('should map tier names to blockchain enum correctly', async () => {
      // Arrange
      const mockRegistry = { id: 1, eventId: 1, onChainEventId: 1 };
      const mockTiers = [
        { id: 1, name: 'VIP Experience', capacity: 50, priceCents: 10000, isActive: true },
        { id: 2, name: 'Premium Seating', capacity: 100, priceCents: 7500, isActive: true },
        { id: 3, name: 'General Admission', capacity: 300, priceCents: 5000, isActive: true },
      ];

      mockPrismaEventBlockchainRegistry.findUnique.mockResolvedValueOnce(mockRegistry);
      mockPrismaEventTicketType.findMany.mockResolvedValueOnce(mockTiers);
      mockPrismaEventTierBlockchainRegistry.findFirst.mockResolvedValue(null);
      mockPrismaEventTierBlockchainRegistry.create.mockResolvedValue({});

      // Act
      await registerTiersOnChain(1);

      // Assert: Check tier enum mapping
      expect(mockSimulate).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          args: expect.arrayContaining([
            BigInt(1), // onChainEventId
            'VIP Experience',
            0, // VIP enum = 0
          ]),
        })
      );

      expect(mockSimulate).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          args: expect.arrayContaining([
            BigInt(1),
            'Premium Seating',
            1, // PREMIUM enum = 1
          ]),
        })
      );

      expect(mockSimulate).toHaveBeenNthCalledWith(
        3,
        expect.objectContaining({
          args: expect.arrayContaining([
            BigInt(1),
            'General Admission',
            2, // GENERAL_ADMISSION enum = 2
          ]),
        })
      );
    });
  });

  describe('getOnChainEventId', () => {
    it('should return on-chain event ID for registered event', async () => {
      // Arrange
      mockPrismaEventBlockchainRegistry.findUnique.mockResolvedValueOnce({
        id: 1,
        eventId: 1,
        onChainEventId: 42,
      });

      // Act
      const onChainId = await getOnChainEventId(1);

      // Assert
      expect(onChainId).toBe(42);
    });

    it('should return null for unregistered event', async () => {
      // Arrange
      mockPrismaEventBlockchainRegistry.findUnique.mockResolvedValueOnce(null);

      // Act
      const onChainId = await getOnChainEventId(999999);

      // Assert
      expect(onChainId).toBeNull();
    });
  });

  describe('isEventRegisteredOnChain', () => {
    it('should return true for registered event', async () => {
      // Arrange
      mockPrismaEventBlockchainRegistry.findUnique.mockResolvedValueOnce({
        id: 1,
        eventId: 1,
        onChainEventId: 1,
      });

      // Act
      const isRegistered = await isEventRegisteredOnChain(1);

      // Assert
      expect(isRegistered).toBe(true);
    });

    it('should return false for unregistered event', async () => {
      // Arrange
      mockPrismaEventBlockchainRegistry.findUnique.mockResolvedValueOnce(null);

      // Act
      const isRegistered = await isEventRegisteredOnChain(999999);

      // Assert
      expect(isRegistered).toBe(false);
    });
  });

  describe('getBlockchainRegistry', () => {
    it('should return full registry with tier registrations', async () => {
      // Arrange
      const mockFullRegistry = {
        id: 1,
        eventId: 1,
        onChainEventId: 1,
        contractAddress: '0xADDRESS',
        registrationTxHash: '0xHASH',
        registeredAt: new Date(),
        chainId: 84532,
        tierRegistrations: [
          {
            id: 1,
            onChainTierId: 0,
            registrationTxHash: '0xTIER_HASH',
            ticketType: {
              id: 1,
              name: 'VIP',
              capacity: 50,
              priceCents: 10000,
            },
          },
        ],
        genesisTicket: null,
      };

      mockPrismaEventBlockchainRegistry.findUnique.mockResolvedValueOnce(mockFullRegistry);

      // Act
      const fullRegistry = await getBlockchainRegistry(1);

      // Assert
      expect(fullRegistry).toBeDefined();
      expect(fullRegistry?.onChainEventId).toBe(1);
      expect(fullRegistry?.tierRegistrations).toHaveLength(1);
      expect(fullRegistry?.tierRegistrations[0].ticketType.name).toBe('VIP');
    });

    it('should return null for unregistered event', async () => {
      // Arrange
      mockPrismaEventBlockchainRegistry.findUnique.mockResolvedValueOnce(null);

      // Act
      const registry = await getBlockchainRegistry(999999);

      // Assert
      expect(registry).toBeNull();
    });
  });
});
