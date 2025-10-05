'use client';

import { useState, useEffect, useRef } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { Avatar, Name } from '@coinbase/onchainkit/identity';
import { useIdleTimer } from '@/lib/hooks/useIdleTimer';
import Link from 'next/link';

export function WalletMenu() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Auto-disconnect after 30 minutes of inactivity
  useIdleTimer({
    timeout: 30 * 60 * 1000, // 30 minutes
    onIdle: () => {
      if (isConnected) {
        console.log('Auto-disconnecting wallet due to inactivity');
        disconnect();
      }
    },
    enabled: isConnected,
  });

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close menu on disconnect
  useEffect(() => {
    if (!isConnected) {
      setIsOpen(false);
    }
  }, [isConnected]);

  const handleDisconnect = () => {
    disconnect();
    setIsOpen(false);
    // Clear any localStorage auth tokens
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  };

  if (!isConnected || !address) {
    return null;
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-lg border border-grit-500/30 bg-ink-800/50 hover:bg-ink-700/50 transition-all"
        aria-label="Wallet menu"
      >
        <Avatar
          address={address}
          className="w-8 h-8"
        />
        <div className="hidden sm:block text-left">
          <Name address={address} className="text-sm font-medium text-bone-100" />
          <div className="text-xs text-grit-400 font-mono">
            {formatAddress(address)}
          </div>
        </div>
        <svg
          className={`w-4 h-4 text-grit-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-ink-800 border border-grit-500/30 rounded-lg shadow-xl overflow-hidden z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-grit-500/30 bg-ink-900/50">
            <div className="flex items-center gap-3">
              <Avatar address={address} className="w-10 h-10" />
              <div className="flex-1 min-w-0">
                <Name address={address} className="text-sm font-medium text-bone-100 truncate" />
                <div className="text-xs text-grit-400 font-mono">
                  {formatAddress(address)}
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <Link
              href="/my-tickets"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-bone-100 hover:bg-ink-700/50 transition-colors"
            >
              <span className="text-lg">🎫</span>
              <span>My Tickets</span>
            </Link>

            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-bone-100 hover:bg-ink-700/50 transition-colors"
            >
              <span className="text-lg">👤</span>
              <span>Profile</span>
            </Link>

            <div className="border-t border-grit-500/30 my-1" />

            <button
              onClick={handleDisconnect}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-resistance-400 hover:bg-ink-700/50 transition-colors"
            >
              <span className="text-lg">🚪</span>
              <span>Sign Out</span>
            </button>
          </div>

          {/* Footer Info */}
          <div className="px-4 py-2 border-t border-grit-500/30 bg-ink-900/30">
            <p className="text-xs text-grit-500">
              Auto-disconnect after 30 min idle
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
