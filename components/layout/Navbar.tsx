'use client';

import Link from 'next/link';
import { ConnectWallet } from '@coinbase/onchainkit/wallet';
import { useAuth } from '@/lib/hooks/useAuth';

export function Navbar() {
  const { isAuthenticated } = useAuth();

  return (
    <nav className="sticky top-0 z-50 bg-[var(--background)] border-b border-white/10 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
              Unchained
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/events"
              className="text-sm font-medium hover:text-blue-400 transition-colors"
            >
              Events
            </Link>
            <Link
              href="/venues"
              className="text-sm font-medium hover:text-blue-400 transition-colors"
            >
              Venues
            </Link>
            <Link
              href="/artists"
              className="text-sm font-medium hover:text-blue-400 transition-colors"
            >
              Artists
            </Link>
            {isAuthenticated && (
              <Link
                href="/profile"
                className="text-sm font-medium hover:text-blue-400 transition-colors"
              >
                Profile
              </Link>
            )}
          </div>

          {/* Wallet Connect */}
          <div className="flex items-center space-x-4">
            <ConnectWallet />
          </div>
        </div>
      </div>
    </nav>
  );
}
