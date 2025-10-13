'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { ThemeToggle } from '@/components/ThemeToggle';
import { RBAC } from '@/lib/constants/roles';
import { WalletControls } from './WalletControls';

export function Navbar() {
  const { isAuthenticated, hasAnyRole } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const canAccessVenueDashboard = hasAnyRole(RBAC.venueAccess);

  return (
    <nav className="sticky top-0 z-50 bg-ink-900/95 dark:bg-ink-900/95 light:bg-bone-100/95 border-b border-grit-500/30 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="brand-heading text-xl sm:text-2xl font-bold bg-gradient-to-r from-resistance-500 via-hack-green to-acid-400 bg-clip-text text-transparent">
              Unchained
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/events"
              className="text-sm font-medium text-bone-100 hover:text-acid-400 transition-colors"
            >
              Events
            </Link>
            <Link
              href="/venues"
              className="text-sm font-medium text-bone-100 hover:text-acid-400 transition-colors"
            >
              Venues
            </Link>
            {canAccessVenueDashboard && (
              <>
                <Link
                  href="/dashboard/venue"
                  className="text-sm font-medium text-bone-100 hover:text-acid-400 transition-colors"
                >
                  Venue Dashboard
                </Link>
                <Link
                  href="/events/new"
                  className="text-sm font-medium text-bone-100 hover:text-acid-400 transition-colors"
                >
                  Create Event
                </Link>
                <Link
                  href="/staff/scanner"
                  className="text-sm font-medium text-bone-100 hover:text-acid-400 transition-colors"
                >
                  Staff Scanner
                </Link>
              </>
            )}
            <Link
              href="/artists"
              className="text-sm font-medium text-bone-100 hover:text-acid-400 transition-colors"
            >
              Artists
            </Link>
            <Link
              href="/my-tickets"
              className="text-sm font-medium text-bone-100 hover:text-acid-400 transition-colors"
            >
              My Tickets
            </Link>
            {isAuthenticated && (
              <Link
                href="/profile"
                className="text-sm font-medium text-bone-100 hover:text-acid-400 transition-colors"
              >
                Profile
              </Link>
            )}
          </div>

          {/* Theme Toggle & Wallet Connect */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <ThemeToggle />
            <div className="hidden sm:block">
              <WalletControls />
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg border border-grit-500/30 bg-ink-800/50 hover:bg-ink-700/50 transition-all"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-grit-500/30 py-4">
            <div className="flex flex-col space-y-4">
              <Link
                href="/events"
                className="text-sm font-medium text-bone-100 hover:text-acid-400 transition-colors px-2 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Events
              </Link>
              <Link
                href="/venues"
                className="text-sm font-medium text-bone-100 hover:text-acid-400 transition-colors px-2 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Venues
              </Link>
              {canAccessVenueDashboard && (
                <>
                  <Link
                    href="/dashboard/venue"
                    className="text-sm font-medium text-bone-100 hover:text-acid-400 transition-colors px-2 py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Venue Dashboard
                  </Link>
                  <Link
                    href="/events/new"
                    className="text-sm font-medium text-bone-100 hover:text-acid-400 transition-colors px-2 py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Create Event
                  </Link>
                  <Link
                    href="/staff/scanner"
                    className="text-sm font-medium text-bone-100 hover:text-acid-400 transition-colors px-2 py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Staff Scanner
                  </Link>
                </>
              )}
              <Link
                href="/artists"
                className="text-sm font-medium text-bone-100 hover:text-acid-400 transition-colors px-2 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Artists
              </Link>
              <Link
                href="/my-tickets"
                className="text-sm font-medium text-bone-100 hover:text-acid-400 transition-colors px-2 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                My Tickets
              </Link>
              {isAuthenticated && (
                <Link
                  href="/profile"
                  className="text-sm font-medium text-bone-100 hover:text-acid-400 transition-colors px-2 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile
                </Link>
              )}

              {/* Mobile Wallet Connect */}
              <div className="pt-4 border-t border-grit-500/30">
                <WalletControls className="w-full" />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
