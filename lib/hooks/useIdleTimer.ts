import { useEffect, useRef } from 'react';

interface UseIdleTimerOptions {
  /** Timeout in milliseconds (default: 30 minutes) */
  timeout?: number;
  /** Callback when user becomes idle */
  onIdle: () => void;
  /** Events to listen for user activity */
  events?: string[];
  /** Whether to enable the idle timer */
  enabled?: boolean;
}

/**
 * Hook to detect user inactivity and trigger auto-disconnect
 * Used for wallet security - automatically disconnects after period of inactivity
 */
export function useIdleTimer({
  timeout = 30 * 60 * 1000, // 30 minutes default
  onIdle,
  events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'],
  enabled = true,
}: UseIdleTimerOptions) {
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!enabled) return;

    const resetTimer = () => {
      // Clear existing timer
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timer
      timeoutRef.current = setTimeout(() => {
        onIdle();
      }, timeout);
    };

    // Initialize timer
    resetTimer();

    // Add event listeners
    events.forEach((event) => {
      window.addEventListener(event, resetTimer, { passive: true });
    });

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [timeout, onIdle, events, enabled]);
}
