/**
 * Register On-Chain API Route Tests
 *
 * Tests the API endpoint that venues use to register events on the blockchain.
 * This is a CRITICAL endpoint for the core value proposition.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../route';
import type { NextRequest } from 'next/server';

// Mock the OnChainEventService
let mockRegisterEventOnChain: any;

vi.mock('@/lib/services/OnChainEventService', () => ({
  registerEventOnChain: (...args: any[]) => mockRegisterEventOnChain(...args),
}));

describe('POST /api/events/:id/register-on-chain', () => {
  beforeEach(() => {
    mockRegisterEventOnChain = vi.fn();
  });

  it('should register event successfully', async () => {
    // Arrange
    const mockResult = {
      success: true,
      onChainEventId: 1,
      txHash: '0xTRANSACTION_HASH',
    };

    mockRegisterEventOnChain.mockResolvedValueOnce(mockResult);

    const mockRequest = {} as NextRequest;
    const mockContext = {
      params: Promise.resolve({ id: '1' }),
    };

    // Act
    const response = await POST(mockRequest, mockContext);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.onChainEventId).toBe(1);
    expect(data.txHash).toBe('0xTRANSACTION_HASH');
    expect(mockRegisterEventOnChain).toHaveBeenCalledWith(1);
  });

  it('should return 400 for invalid event ID', async () => {
    // Arrange
    const mockRequest = {} as NextRequest;
    const mockContext = {
      params: Promise.resolve({ id: 'invalid' }),
    };

    // Act
    const response = await POST(mockRequest, mockContext);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain('Invalid event ID');
    expect(mockRegisterEventOnChain).not.toHaveBeenCalled();
  });

  it('should return 400 when registration fails', async () => {
    // Arrange
    const mockResult = {
      success: false,
      error: 'Event not found in database',
    };

    mockRegisterEventOnChain.mockResolvedValueOnce(mockResult);

    const mockRequest = {} as NextRequest;
    const mockContext = {
      params: Promise.resolve({ id: '999' }),
    };

    // Act
    const response = await POST(mockRequest, mockContext);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Event not found in database');
  });

  it('should return 500 when service throws unexpected error', async () => {
    // Arrange
    mockRegisterEventOnChain.mockRejectedValueOnce(new Error('Blockchain RPC error'));

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
    expect(data.error).toBe('Blockchain RPC error');
  });

  it('should handle non-Error exceptions', async () => {
    // Arrange
    mockRegisterEventOnChain.mockRejectedValueOnce('String error');

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

  it('should return existing registration without error', async () => {
    // Arrange: Event already registered
    const mockResult = {
      success: true,
      onChainEventId: 5,
      txHash: '0xEXISTING_HASH',
    };

    mockRegisterEventOnChain.mockResolvedValueOnce(mockResult);

    const mockRequest = {} as NextRequest;
    const mockContext = {
      params: Promise.resolve({ id: '5' }),
    };

    // Act
    const response = await POST(mockRequest, mockContext);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.onChainEventId).toBe(5);
    expect(data.txHash).toBe('0xEXISTING_HASH');
  });
});
