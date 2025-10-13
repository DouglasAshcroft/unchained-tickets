'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface SupportModeBannerProps {
  venueName: string;
  userId: number;
  startedAt: Date;
}

export function SupportModeBanner({
  venueName,
  userId,
  startedAt,
}: SupportModeBannerProps) {
  const router = useRouter();
  const [duration, setDuration] = useState('');
  const [ending, setEnding] = useState(false);

  // Update duration every minute
  useEffect(() => {
    const updateDuration = () => {
      const start = new Date(startedAt);
      const now = new Date();
      const diff = now.getTime() - start.getTime();
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(minutes / 60);

      if (hours > 0) {
        setDuration(`${hours}h ${minutes % 60}m`);
      } else if (minutes > 0) {
        setDuration(`${minutes}m`);
      } else {
        setDuration('< 1m');
      }
    };

    updateDuration();
    const interval = setInterval(updateDuration, 60000);

    return () => clearInterval(interval);
  }, [startedAt]);

  const handleEndSession = async () => {
    setEnding(true);

    try {
      const response = await fetch('/api/admin/support/venue/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to end support session');
      }

      toast.success('Support session ended');
      router.push('/dashboard/venue/select');
      router.refresh();
    } catch (error: any) {
      console.error('Error ending support session:', error);
      toast.error(error.message || 'Failed to end support session');
      setEnding(false);
    }
  };

  const handleSwitchVenue = () => {
    router.push('/dashboard/venue/select');
  };

  return (
    <div className="relative overflow-hidden rounded-lg border border-blue-500/30 bg-gradient-to-r from-blue-900/20 via-blue-800/10 to-blue-900/20 px-6 py-3">
      {/* Subtle animated background */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent opacity-50" />

      <div className="relative flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/20">
            <svg
              className="h-4 w-4 text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>

          {/* Text */}
          <div>
            <p className="text-sm font-medium text-blue-100">
              Support Mode: <span className="font-semibold">{venueName}</span>
            </p>
            <p className="text-xs text-blue-300/70">Session duration: {duration}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSwitchVenue}
            disabled={ending}
            className="rounded-lg border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-100 transition-colors hover:bg-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Switch Venue
          </button>
          <button
            onClick={handleEndSession}
            disabled={ending}
            className="rounded-lg border border-grit-500/30 bg-ink-800/50 px-4 py-2 text-sm font-medium text-grit-300 transition-colors hover:bg-ink-700/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {ending ? 'Ending...' : 'End Session'}
          </button>
        </div>
      </div>
    </div>
  );
}
