import { renderHook, waitFor } from '@testing-library/react';
import { act } from '@testing-library/react';
import { useBlockchainRegistration } from '../useBlockchainRegistration';
import { vi } from 'vitest';

// Mock the API client
vi.mock('@/lib/api/client', () => ({
  api: {
    registerEventOnChain: vi.fn(),
    registerTiersOnChain: vi.fn(),
    updateEventStatus: vi.fn(),
  },
}));

// Import after mocking
import { api } from '@/lib/api/client';

describe('useBlockchainRegistration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with idle state', () => {
    const { result } = renderHook(() => useBlockchainRegistration());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.progress).toBe('idle');
    expect(result.current.error).toBeNull();
  });

  it('registers event and tiers sequentially on success', async () => {
    const mockEventResult = {
      success: true,
      onChainEventId: 1,
      txHash: '0xevent123',
    };

    const mockTiersResult = [
      { success: true, tierName: 'VIP', onChainTierId: 0, txHash: '0xtier1' },
      { success: true, tierName: 'General', onChainTierId: 1, txHash: '0xtier2' },
    ];

    // Add delays to allow state updates to be captured
    vi.mocked(api.registerEventOnChain).mockImplementation(() =>
      new Promise((resolve) => setTimeout(() => resolve(mockEventResult), 50))
    );
    vi.mocked(api.registerTiersOnChain).mockImplementation(() =>
      new Promise((resolve) => setTimeout(() => resolve(mockTiersResult), 50))
    );

    const { result } = renderHook(() => useBlockchainRegistration());

    let registerPromise: Promise<any>;
    await act(async () => {
      registerPromise = result.current.register(123);
      // Wait a tick to let state update
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Should start with registering event
    expect(result.current.isLoading).toBe(true);
    expect(result.current.progress).toBe('registering-event');

    await waitFor(() => {
      expect(api.registerEventOnChain).toHaveBeenCalledWith(123);
    });

    // Should move to registering tiers
    await waitFor(() => {
      expect(result.current.progress).toBe('registering-tiers');
    }, { timeout: 3000 });

    await waitFor(() => {
      expect(api.registerTiersOnChain).toHaveBeenCalledWith(123);
    });

    // Should complete successfully
    await waitFor(() => {
      expect(result.current.progress).toBe('complete');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    const registerResult = await registerPromise;
    expect(registerResult.success).toBe(true);
    expect(registerResult.eventResult).toEqual(mockEventResult);
    expect(registerResult.tiersResult).toEqual(mockTiersResult);
  });

  it('handles event registration failure', async () => {
    const mockEventResult = {
      success: false,
      error: 'Contract not deployed',
    };

    vi.mocked(api.registerEventOnChain).mockResolvedValueOnce(mockEventResult);

    const { result } = renderHook(() => useBlockchainRegistration());

    let registerPromise: Promise<any>;
    act(() => {
      registerPromise = result.current.register(123);
    });

    await waitFor(() => {
      expect(result.current.progress).toBe('error');
      expect(result.current.error).toBe('Contract not deployed');
      expect(result.current.isLoading).toBe(false);
    });

    const registerResult = await registerPromise;
    expect(registerResult.success).toBe(false);
    expect(registerResult.error).toBe('Contract not deployed');
    expect(api.registerTiersOnChain).not.toHaveBeenCalled();
  });

  it('handles tier registration failure', async () => {
    const mockEventResult = {
      success: true,
      onChainEventId: 1,
      txHash: '0xevent123',
    };

    const mockTiersResult = [
      { success: true, tierName: 'VIP', onChainTierId: 0, txHash: '0xtier1' },
      { success: false, tierName: 'General', error: 'Gas estimation failed' },
    ];

    vi.mocked(api.registerEventOnChain).mockResolvedValueOnce(mockEventResult);
    vi.mocked(api.registerTiersOnChain).mockResolvedValueOnce(mockTiersResult);

    const { result } = renderHook(() => useBlockchainRegistration());

    let registerPromise: Promise<any>;
    act(() => {
      registerPromise = result.current.register(123);
    });

    await waitFor(() => {
      expect(result.current.progress).toBe('complete');
      expect(result.current.isLoading).toBe(false);
    });

    const registerResult = await registerPromise;
    expect(registerResult.success).toBe(true); // Event succeeded
    expect(registerResult.partialFailure).toBe(true);
    expect(registerResult.failedTiers).toEqual(['General']);
  });

  it('handles network errors gracefully', async () => {
    vi.mocked(api.registerEventOnChain).mockRejectedValueOnce(
      new Error('Network request failed')
    );

    const { result } = renderHook(() => useBlockchainRegistration());

    let registerPromise: Promise<any>;
    act(() => {
      registerPromise = result.current.register(123);
    });

    await waitFor(() => {
      expect(result.current.progress).toBe('error');
      expect(result.current.error).toContain('Network request failed');
      expect(result.current.isLoading).toBe(false);
    });

    const registerResult = await registerPromise;
    expect(registerResult.success).toBe(false);
  });

  it('can be reset after completion', async () => {
    const mockEventResult = { success: true, onChainEventId: 1, txHash: '0xevent' };
    const mockTiersResult = [{ success: true, tierName: 'VIP', onChainTierId: 0, txHash: '0xtier' }];

    vi.mocked(api.registerEventOnChain).mockResolvedValueOnce(mockEventResult);
    vi.mocked(api.registerTiersOnChain).mockResolvedValueOnce(mockTiersResult);

    const { result } = renderHook(() => useBlockchainRegistration());

    act(() => {
      result.current.register(123);
    });

    await waitFor(() => {
      expect(result.current.progress).toBe('complete');
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.progress).toBe('idle');
    expect(result.current.error).toBeNull();
  });

  it('prevents concurrent registration attempts', async () => {
    const mockEventResult = { success: true, onChainEventId: 1, txHash: '0xevent' };
    const mockTiersResult = [{ success: true, tierName: 'VIP', onChainTierId: 0, txHash: '0xtier' }];

    vi.mocked(api.registerEventOnChain).mockResolvedValueOnce(mockEventResult);
    vi.mocked(api.registerTiersOnChain).mockResolvedValueOnce(mockTiersResult);

    const { result } = renderHook(() => useBlockchainRegistration());

    act(() => {
      result.current.register(123);
    });

    // Try to register again while first is in progress
    const secondAttempt = act(() => {
      return result.current.register(456);
    });

    await expect(secondAttempt).rejects.toThrow('Registration already in progress');
  });

  it('updates progress state during registration', async () => {
    const mockEventResult = { success: true, onChainEventId: 1, txHash: '0xevent' };
    const mockTiersResult = [{ success: true, tierName: 'VIP', onChainTierId: 0, txHash: '0xtier' }];

    // Add delays to allow state updates to be captured
    vi.mocked(api.registerEventOnChain).mockImplementation(() =>
      new Promise((resolve) => setTimeout(() => resolve(mockEventResult), 50))
    );
    vi.mocked(api.registerTiersOnChain).mockImplementation(() =>
      new Promise((resolve) => setTimeout(() => resolve(mockTiersResult), 50))
    );

    const { result } = renderHook(() => useBlockchainRegistration());

    await act(async () => {
      result.current.register(123);
    });

    // Should start with registering-event
    await waitFor(() => {
      expect(result.current.progress).toBe('registering-event');
    });

    // Should eventually be complete
    await waitFor(() => {
      expect(result.current.progress).toBe('complete');
    }, { timeout: 3000 });

    // Verify both API methods were called in order
    const eventCallOrder = vi.mocked(api.registerEventOnChain).mock.invocationCallOrder[0];
    const tiersCallOrder = vi.mocked(api.registerTiersOnChain).mock.invocationCallOrder[0];
    expect(eventCallOrder).toBeLessThan(tiersCallOrder);
  });

  it('provides transaction hashes in result', async () => {
    const mockEventResult = { success: true, onChainEventId: 1, txHash: '0xevent123' };
    const mockTiersResult = [
      { success: true, tierName: 'VIP', onChainTierId: 0, txHash: '0xtier1' },
      { success: true, tierName: 'General', onChainTierId: 1, txHash: '0xtier2' },
    ];

    vi.mocked(api.registerEventOnChain).mockResolvedValueOnce(mockEventResult);
    vi.mocked(api.registerTiersOnChain).mockResolvedValueOnce(mockTiersResult);

    const { result } = renderHook(() => useBlockchainRegistration());

    let registerPromise: Promise<any>;
    act(() => {
      registerPromise = result.current.register(123);
    });

    const registerResult = await registerPromise;

    expect(registerResult.eventTxHash).toBe('0xevent123');
    expect(registerResult.tierTxHashes).toEqual(['0xtier1', '0xtier2']);
  });
});
