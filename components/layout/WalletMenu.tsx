'use client';

import { useState, useEffect, useRef } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { Avatar, Name } from '@coinbase/onchainkit/identity';
import { useIdleTimer } from '@/lib/hooks/useIdleTimer';
import Link from 'next/link';
import {
  SHARE_TEMPLATES,
  getShareUrl,
  generateProfileUrl,
  trackSocialShare,
  openShareDialog,
  type SocialPlatform,
} from '@/lib/utils/socialSharing';

export function WalletMenu() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [isOpen, setIsOpen] = useState(false);
  const [showSocials, setShowSocials] = useState(false);
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
        setShowSocials(false);
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
      setShowSocials(false);
    }
  }, [isConnected]);

  const handleDisconnect = () => {
    disconnect();
    setIsOpen(false);
    setShowSocials(false);
    // Clear any localStorage auth tokens
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  };

  const handleShare = (platform: SocialPlatform) => {
    const profileUrl = generateProfileUrl(address);
    const content: import('@/lib/utils/socialSharing').ShareContent = {
      message: SHARE_TEMPLATES.advocate.message,
      url: profileUrl,
      hashtags: [...SHARE_TEMPLATES.advocate.hashtags],
    };

    const shareUrl = getShareUrl(platform, content);
    trackSocialShare(platform, 'wallet-menu-advocate');
    openShareDialog(shareUrl, platform);
    setShowSocials(false);
  };

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      // You could add a toast notification here
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
        <Avatar address={address} className="w-8 h-8" />
        <div className="hidden sm:block text-left">
          <Name address={address} className="text-sm font-medium text-bone-100" />
          <div className="text-xs text-grit-400 font-mono">{formatAddress(address)}</div>
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
        <div className="absolute right-0 mt-2 w-72 bg-ink-800 border border-grit-500/30 rounded-lg shadow-xl overflow-hidden z-50">
          {/* Identity Card Header */}
          <div className="px-4 py-3 border-b border-grit-500/30 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-acid-400/10">
            <div className="flex items-start gap-3 mb-3">
              <Avatar address={address} className="w-12 h-12" />
              <div className="flex-1 min-w-0">
                <Name address={address} className="text-sm font-medium text-bone-100 truncate block" />
                <button
                  onClick={copyAddress}
                  className="text-xs text-grit-400 font-mono hover:text-acid-400 transition-colors mt-1 flex items-center gap-1"
                  title="Click to copy address"
                >
                  {formatAddress(address)}
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </button>
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
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                />
              </svg>
              <span>My Tickets</span>
            </Link>

            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-bone-100 hover:bg-ink-700/50 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span>Profile</span>
            </Link>

            <div className="border-t border-grit-500/30 my-1" />

            {/* Social Sharing Section */}
            <button
              onClick={() => setShowSocials(!showSocials)}
              className="w-full flex items-center justify-between gap-3 px-4 py-2.5 text-sm text-bone-100 hover:bg-ink-700/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
                <span>Share Unchained</span>
              </div>
              <svg
                className={`w-4 h-4 text-grit-400 transition-transform ${showSocials ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Social Platforms */}
            {showSocials && (
              <div className="bg-ink-900/50 px-4 py-2 space-y-1">
                <p className="text-xs text-grit-400 mb-2">Help bring the world onchain</p>

                <button
                  onClick={() => handleShare('twitter')}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-bone-100 hover:bg-ink-700/50 rounded transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  <span>Share on 𝕏</span>
                </button>

                <button
                  onClick={() => handleShare('farcaster')}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-bone-100 hover:bg-ink-700/50 rounded transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.8 4.8v14.4h-3.6V9.6l-5.2 6.4-5.2-6.4v9.6H3.2V4.8h3.6l5.2 6.4 5.2-6.4z" />
                  </svg>
                  <span>Cast on Farcaster</span>
                </button>

                <button
                  onClick={() => handleShare('lens')}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-bone-100 hover:bg-ink-700/50 rounded transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                  </svg>
                  <span>Post on Lens</span>
                </button>
              </div>
            )}

            <div className="border-t border-grit-500/30 my-1" />

            <button
              onClick={handleDisconnect}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-resistance-400 hover:bg-ink-700/50 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span>Sign Out</span>
            </button>
          </div>

          {/* Footer Info */}
          <div className="px-4 py-2 border-t border-grit-500/30 bg-ink-900/30">
            <p className="text-xs text-grit-500">Auto-disconnect after 30 min idle</p>
          </div>
        </div>
      )}
    </div>
  );
}
