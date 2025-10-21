'use client';

import { useEffect, useRef, useState, type ComponentType } from 'react';
import clsx from 'clsx';

type WalletPanelComponent = ComponentType<{ className?: string }>;

type WalletControlsProps = {
  className?: string;
};

export function WalletControls({ className }: WalletControlsProps) {
  const [WalletPanel, setWalletPanel] = useState<WalletPanelComponent | null>(null);
  const hasRequestedRef = useRef(false);

  useEffect(() => {
    // Load WalletPanel immediately on mount
    if (!WalletPanel && !hasRequestedRef.current) {
      hasRequestedRef.current = true;

      import('./WalletPanel')
        .then((mod) => {
          const Panel = mod.WalletPanel ?? mod.default;
          setWalletPanel(() => Panel);
        })
        .catch((error) => {
          console.error('Failed to load WalletPanel:', error);
        });
    }
  }, [WalletPanel]);

  if (WalletPanel) {
    return <WalletPanel className={className} />;
  }

  // Show minimal loading state while WalletPanel loads
  return (
    <div
      className={clsx(
        'flex items-center gap-2 px-4 py-2 rounded-lg border border-grit-500/30 bg-ink-800/50 text-sm font-medium text-grit-400',
        className
      )}
    >
      <div className="w-5 h-5 border-2 border-grit-500 border-t-acid-400 rounded-full animate-spin" />
      <span>Loading...</span>
    </div>
  );
}

export default WalletControls;
