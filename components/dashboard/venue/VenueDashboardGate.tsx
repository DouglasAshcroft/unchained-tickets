'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { ConnectWallet } from '@coinbase/onchainkit/wallet';
import { useAccount } from 'wagmi';
import { useAuth } from '@/lib/hooks/useAuth';
import { RBAC } from '@/lib/constants/roles';

interface VenueDashboardGateProps {
  children: ReactNode;
}

export function VenueDashboardGate({ children }: VenueDashboardGateProps) {
  const { isConnected } = useAccount();
  const { user, hasAnyRole, isLoading } = useAuth();
  const canAccess = hasAnyRole(RBAC.venueAccess);

  // Wallet not connected
  if (!isConnected) {
    return (
      <div className="space-y-4 rounded-xl border border-grit-500/30 bg-ink-900/70 p-8 text-sm text-grit-300">
        <p className="text-lg font-semibold text-bone-100">🔐 Wallet Required</p>
        <p>Connect your Base wallet to access the venue dashboard.</p>
        <ConnectWallet />
      </div>
    );
  }

  // Wallet connected but still authenticating
  if (isConnected && !user && isLoading) {
    return (
      <div className="space-y-4 rounded-xl border border-grit-500/30 bg-ink-900/70 p-8 text-sm text-grit-300">
        <p className="text-lg font-semibold text-bone-100">⏳ Authenticating...</p>
        <p>Verifying your wallet credentials. This will only take a moment.</p>
      </div>
    );
  }

  // Wallet connected but user doesn't have access
  if (!user || !canAccess) {
    return (
      <div className="space-y-4 rounded-xl border border-grit-500/30 bg-ink-900/70 p-8 text-sm text-grit-300">
        <p className="text-lg font-semibold text-bone-100">⛔ Access Restricted</p>
        <p>
          This area is restricted to venue partners, administrators, and developers.
          {' '}If you believe you should have access, please contact support.
        </p>
        <div className="flex gap-3">
          <a
            href="mailto:support@unchained.xyz"
            className="inline-flex items-center gap-2 rounded-md border border-acid-400/40 px-4 py-2 text-acid-400 transition hover:bg-acid-400/10"
          >
            📧 Email Support
          </a>
          <Link
            href="/events"
            className="inline-flex items-center gap-2 rounded-md border border-grit-500/40 px-4 py-2 text-grit-300 transition hover:bg-white/5"
          >
            ← Browse Events
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
