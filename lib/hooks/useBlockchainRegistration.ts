/**
 * useBlockchainRegistration Hook
 *
 * Encapsulates blockchain registration logic for events and tiers.
 * Provides progress tracking, error handling, and result management.
 *
 * DRY Principle: Reusable across event creation, editing, and retry flows
 */

import { useState, useCallback } from 'react';
import { api } from '@/lib/api/client';

export type RegistrationProgress =
  | 'idle'
  | 'registering-event'
  | 'registering-tiers'
  | 'complete'
  | 'error';

export interface RegistrationResult {
  success: boolean;
  error?: string;
  partialFailure?: boolean;
  failedTiers?: string[];
  eventResult?: any;
  tiersResult?: any[];
  eventTxHash?: string;
  tierTxHashes?: string[];
}

export interface UseBlockchainRegistrationReturn {
  isLoading: boolean;
  progress: RegistrationProgress;
  error: string | null;
  register: (eventId: number) => Promise<RegistrationResult>;
  reset: () => void;
}

/**
 * Custom hook for managing blockchain event registration
 *
 * @returns Hook state and methods
 */
export function useBlockchainRegistration(): UseBlockchainRegistrationReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<RegistrationProgress>('idle');
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setIsLoading(false);
    setProgress('idle');
    setError(null);
  }, []);

  const register = useCallback(
    async (eventId: number): Promise<RegistrationResult> => {
      // Prevent concurrent registration
      if (isLoading) {
        throw new Error('Registration already in progress');
      }

      setIsLoading(true);
      setProgress('registering-event');
      setError(null);

      try {
        // Step 1: Register event on blockchain
        const eventResult = await api.registerEventOnChain(eventId);

        if (!eventResult.success) {
          setProgress('error');
          setError(eventResult.error || 'Event registration failed');
          setIsLoading(false);

          return {
            success: false,
            error: eventResult.error || 'Event registration failed',
            eventResult,
          };
        }

        // Step 2: Register tiers on blockchain
        setProgress('registering-tiers');
        const tiersResult = await api.registerTiersOnChain(eventId);

        // Check for tier failures
        const failedTiers = tiersResult
          .filter((tier) => !tier.success)
          .map((tier) => tier.tierName);

        const hasFailedTiers = failedTiers.length > 0;

        // Extract transaction hashes
        const eventTxHash = eventResult.txHash;
        const tierTxHashes = tiersResult
          .filter((tier) => tier.success && tier.txHash)
          .map((tier) => tier.txHash!);

        // Complete successfully (even with partial tier failures)
        setProgress('complete');
        setIsLoading(false);

        return {
          success: true,
          partialFailure: hasFailedTiers,
          failedTiers: hasFailedTiers ? failedTiers : undefined,
          eventResult,
          tiersResult,
          eventTxHash,
          tierTxHashes,
        };
      } catch (err) {
        // Handle unexpected errors
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error during registration';

        setProgress('error');
        setError(errorMessage);
        setIsLoading(false);

        return {
          success: false,
          error: errorMessage,
        };
      }
    },
    [isLoading]
  );

  return {
    isLoading,
    progress,
    error,
    register,
    reset,
  };
}
