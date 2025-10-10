'use client';

import { useState, useEffect } from 'react';

type ConnectionStatus = 'connected' | 'disconnected' | 'checking';

/**
 * API Status Indicator - Only visible in development mode
 * Shows real-time connection status to the backend API
 */
export function ApiStatus() {
  const [status, setStatus] = useState<ConnectionStatus>('checking');
  const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true';

  useEffect(() => {
    if (!isDevMode) return;

    const checkApiHealth = async () => {
      try {
        const response = await fetch('/api/health', {
          method: 'GET',
          cache: 'no-store',
        });

        if (response.ok) {
          setStatus('connected');
        } else {
          setStatus('disconnected');
        }
      } catch {
        setStatus('disconnected');
      }
    };

    // Initial check
    checkApiHealth();

    // Poll every 10 seconds
    const interval = setInterval(checkApiHealth, 10000);

    return () => clearInterval(interval);
  }, [isDevMode]);

  // Don't render in production
  if (!isDevMode) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <div className="bg-ink-900/95 border border-grit-500/30 rounded-lg p-3 shadow-xl backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                status === 'connected'
                  ? 'bg-hack-green animate-pulse'
                  : status === 'disconnected'
                  ? 'bg-resistance-500'
                  : 'bg-cobalt-400 animate-pulse'
              }`}
            />
            <span className="text-xs font-medium text-bone-100">
              API: {status === 'connected' ? 'Connected' : status === 'disconnected' ? 'Offline' : 'Checking...'}
            </span>
          </div>
          {status === 'disconnected' && (
            <span className="text-xs text-grit-400">
              Run <code className="bg-ink-800 px-1 py-0.5 rounded">npm run dev</code>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
