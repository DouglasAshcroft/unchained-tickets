'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { isDevWallet } from '@/lib/utils/roleAuth';

interface Venue {
  id: number;
  name: string;
  slug: string;
}

export function VenueSwitcher() {
  const { address } = useAccount();
  const router = useRouter();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDevMode, setIsDevMode] = useState(false);

  // Check if connected wallet is dev wallet
  useEffect(() => {
    if (address) {
      setIsDevMode(isDevWallet(address));
    } else {
      setIsDevMode(false);
    }
  }, [address]);

  // Fetch all venues when dev mode is active
  useEffect(() => {
    if (isDevMode) {
      setLoading(true);
      fetch('/api/venues')
        .then(res => res.json())
        .then(data => {
          setVenues(data.venues || data || []);
        })
        .catch(error => {
          console.error('Failed to fetch venues:', error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isDevMode]);

  // Don't render if not dev wallet
  if (!isDevMode) {
    return null;
  }

  const handleVenueChange = (slug: string) => {
    if (slug) {
      router.push(`/venues/${slug}/dashboard`);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-hack-green uppercase tracking-wider">
        🔧 DEV
      </span>
      <select
        onChange={(e) => handleVenueChange(e.target.value)}
        disabled={loading}
        className="text-sm bg-ink-800 border border-grit-500/30 rounded-lg px-3 py-1.5 text-bone-100 focus:border-acid-400 focus:outline-none focus:ring-2 focus:ring-acid-400/50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        defaultValue=""
      >
        <option value="" disabled>
          {loading ? 'Loading venues...' : 'Switch Venue'}
        </option>
        {venues.map(venue => (
          <option key={venue.id} value={venue.slug}>
            {venue.name}
          </option>
        ))}
      </select>
    </div>
  );
}
