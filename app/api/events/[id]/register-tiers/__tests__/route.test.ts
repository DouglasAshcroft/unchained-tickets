/**
 * Register Tiers API Route Tests
 *
 * Tests the API endpoint that registers ticket tiers on the blockchain.
 * Critical for enabling tiered NFT minting.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../route';
import type { NextRequest } from 'next/server';

// Mock the OnChainEventService
let mockRegisterTiersOnChain: any;

vi.mock('@/lib/services/OnChainEventService', () => ({
  registerTiersOnChain: (...args: any[]) => mockRegisterTiersOnChain(...args),
}));

describe('POST /api/events/:id/register-tiers', () => {
  beforeEach(() => {
    mockRegisterTiersOnChain = vi.fn();
  });

  it('should register all tiers successfully', async () => {
    // Arrange
    const mockResults = [
      { success: true, tierName: 'VIP', onChainTierId: 0, txHash: '0xVIP_HASH' },
      { success: true, tierName: 'Premium', onChainTierId: 1, txHash: '0xPREMIUM_HASH' },
      { success: true, tierName: 'GA', onChainTierId: 2, txHash: '0xGA_HASH' },
    ];

    mockRegisterTiersOnChain.mockResolvedValueOnce(mockResults);

    const mockRequest = {} as NextRequest;
    const mockContext = {
      params: Promise.resolve({ id: '1' }),
    };

    // Act
    const response = await POST(mockRequest, mockContext);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data).toHaveLength(3);
    expect(data.every((r: any) => r.success)).toBe(true);
    expect(data[0].tierName).toBe('VIP');
    expect(data[1].tierName).toBe('Premium');
    expect(data[2].tierName).toBe('GA');
    expect(mockRegisterTiersOnChain).toHaveBeenCalledWith(1);
  });

  it('should return 400 for invalid event ID', async () => {
    // Arrange
    const mockRequest = {} as NextRequest;
    const mockContext = {
      params: Promise.resolve({ id: 'not-a-number' }),
    };

    // Act
    const response = await POST(mockRequest, mockContext);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain('Invalid event ID');
    expect(mockRegisterTiersOnChain).not.toHaveBeenCalled();
  });

  it('should return 207 Multi-Status when some tiers fail', async () => {
    // Arrange: VIP succeeds, Premium fails, GA succeeds
    const mockResults = [
      { success: true, tierName: 'VIP', onChainTierId: 0, txHash: '0xVIP_HASH' },
      { success: false, tierName: 'Premium', error: 'Tier already exists' },
      { success: true, tierName: 'GA', onChainTierId: 2, txHash: '0xGA_HASH' },
    ];

    mockRegisterTiersOnChain.mockResolvedValueOnce(mockResults);

    const mockRequest = {} as NextRequest;
    const mockContext = {
      params: Promise.resolve({ id: '1' }),
    };

    // Act
    const response = await POST(mockRequest, mockContext);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(207); // Multi-Status for partial success
    expect(Array.isArray(data)).toBe(true);
    expect(data).toHaveLength(3);
    expect(data[0].success).toBe(true);
    expect(data[1].success).toBe(false);
    expect(data[1].error).toBe('Tier already exists');
    expect(data[2].success).toBe(true);
  });

  it('should return 500 when service throws error', async () => {
    // Arrange: Event not registered on blockchain
    mockRegisterTiersOnChain.mockRejectedValueOnce(
      new Error('Event 1 is not registered on blockchain. Register the event first.')
    );

    const mockRequest = {} as NextRequest;
    const mockContext = {
      params: Promise.resolve({ id: '1' }),
    };

    // Act
    const response = await POST(mockRequest, mockContext);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toContain('not registered on blockchain');
  });

  it('should handle non-Error exceptions', async () => {
    // Arrange
    mockRegisterTiersOnChain.mockRejectedValueOnce('Unexpected error');

    const mockRequest = {} as NextRequest;
    const mockContext = {
      params: Promise.resolve({ id: '1' }),
    };

    // Act
    const response = await POST(mockRequest, mockContext);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Unknown error');
  });

  it('should return empty array when event has no tiers', async () => {
    // Arrange
    mockRegisterTiersOnChain.mockResolvedValueOnce([]);

    const mockRequest = {} as NextRequest;
    const mockContext = {
      params: Promise.resolve({ id: '1' }),
    };

    // Act
    const response = await POST(mockRequest, mockContext);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data).toHaveLength(0);
  });

  it('should handle already registered tiers gracefully', async () => {
    // Arrange: Tiers already registered (service returns success with existing hashes)
    const mockResults = [
      { success: true, tierName: 'VIP', onChainTierId: 0, txHash: '0xEXISTING_VIP_HASH' },
      { success: true, tierName: 'GA', onChainTierId: 1, txHash: '0xEXISTING_GA_HASH' },
    ];

    mockRegisterTiersOnChain.mockResolvedValueOnce(mockResults);

    const mockRequest = {} as NextRequest;
    const mockContext = {
      params: Promise.resolve({ id: '5' }),
    };

    // Act
    const response = await POST(mockRequest, mockContext);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data).toHaveLength(2);
    expect(data.every((r: any) => r.success)).toBe(true);
  });
});
