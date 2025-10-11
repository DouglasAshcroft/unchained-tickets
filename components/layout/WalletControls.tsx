'use client';

import { useCallback, useEffect, useRef, useState, type ComponentType } from 'react';
import { useAccount } from 'wagmi';
import clsx from 'clsx';

type WalletPanelComponent = ComponentType<{ className?: string }>;

type WalletControlsProps = {
  className?: string;
};

export function WalletControls({ className }: WalletControlsProps) {
  const { isConnected } = useAccount();
  const [WalletPanel, setWalletPanel] = useState<WalletPanelComponent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const hasRequestedRef = useRef(false);

  const loadPanel = useCallback(async () => {
    if (WalletPanel || hasRequestedRef.current) {
      setIsLoading(false);
      return;
    }

    hasRequestedRef.current = true;
    setIsLoading(true);

    try {
      const mod = await import('./WalletPanel');
      const Panel = mod.WalletPanel ?? mod.default;
      setWalletPanel(() => Panel);
    } finally {
      setIsLoading(false);
    }
  }, [WalletPanel]);

  useEffect(() => {
    if (isConnected && !WalletPanel && !hasRequestedRef.current) {
      loadPanel();
    }
  }, [isConnected, WalletPanel, loadPanel]);

  if (WalletPanel) {
    return <WalletPanel className={className} />;
  }

  return (
    <button
      type="button"
      onClick={loadPanel}
      className={clsx(
        'flex items-center gap-2 px-4 py-2 rounded-lg border border-grit-500/30 bg-ink-800/50 hover:bg-ink-700/50 transition-all text-sm font-medium text-bone-100',
        isLoading && 'opacity-70 cursor-wait',
        className
      )}
      disabled={isLoading}
    >
      {isLoading ? 'Loading wallet…' : isConnected ? 'Open Wallet' : 'Connect Wallet'}
    </button>
  );
}

export default WalletControls;
