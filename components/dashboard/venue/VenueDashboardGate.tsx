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
  const { user, hasAnyRole } = useAuth();
  const canAccess = hasAnyRole(RBAC.venueAccess);

  if (!isConnected) {
    return (
      <div className="space-y-4 rounded-xl border border-grit-500/30 bg-ink-900/70 p-8 text-sm text-grit-300">
        <p>Connect your Base wallet to access the venue dashboard.</p>
        <ConnectWallet />
      </div>
    );
  }

  if (!user || !canAccess) {
    return (
      <div className="space-y-4 rounded-xl border border-grit-500/30 bg-ink-900/70 p-8 text-sm text-grit-300">
        <p>This area is restricted to venue partners. If you believe you should have access, contact support.</p>
        <div className="flex gap-3">
          <a
            href="mailto:support@unchained.xyz"
            className="inline-flex items-center gap-2 rounded-md border border-acid-400/40 px-4 py-2 text-acid-400 transition hover:bg-acid-400/10"
          >
            Email support
          </a>
          <Link
            href="/docs/posters"
            className="inline-flex items-center gap-2 rounded-md border border-grit-500/40 px-4 py-2 text-grit-300 transition hover:bg-white/5"
          >
            Read venue docs
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
