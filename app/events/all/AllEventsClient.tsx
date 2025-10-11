'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import EventCard from '@/components/EventCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import clsx from 'clsx';

type EventListItem = {
  id: number;
  title: string;
  startsAt: string;
  createdAt: string;
  posterImageUrl?: string | null;
  externalLink?: string | null;
  mapsLink?: string | null;
  featured?: boolean;
  venue?: {
    id: number;
    name: string;
    slug: string;
    city?: string | null;
    state?: string | null;
  } | null;
};

export default function AllEventsClient() {
  const searchParams = useSearchParams();
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const genre = searchParams.get('genre');
  const featured = searchParams.get('featured');
  const city = searchParams.get('city');
  const state = searchParams.get('state');

  const fetchEvents = useCallback(
    async (pageNum: number) => {
      try {
        const params = new URLSearchParams();
        if (genre) params.set('genre', genre);
        if (featured) params.set('featured', featured);
        if (city) params.set('city', city);
        if (state) params.set('state', state);
        params.set('page', pageNum.toString());
        params.set('limit', '20');

        const response = await fetch(`/api/events/all?${params.toString()}`);

        if (!response.ok) {
          throw new Error('Failed to load events');
        }

        const data = await response.json();

        if (pageNum === 1) {
          setEvents(data.events);
        } else {
          setEvents((prev) => [...prev, ...data.events]);
        }

        setHasMore(data.hasMore);
        setIsLoading(false);
        setIsLoadingMore(false);
      } catch (err) {
        console.error(err);
        setError('Failed to load events. Please try again.');
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [genre, featured, city, state]
  );

  useEffect(() => {
    setIsLoading(true);
    setPage(1);
    fetchEvents(1);
  }, [fetchEvents]);

  const loadMore = () => {
    if (!isLoadingMore && hasMore) {
      setIsLoadingMore(true);
      const nextPage = page + 1;
      setPage(nextPage);
      fetchEvents(nextPage);
    }
  };

  const pageTitle = () => {
    if (featured) return '🔥 Featured Events';
    if (genre === 'all-events') return '🎉 All Events';
    if (genre) return `Events: ${genre.replace(/-/g, ' ')}`;
    return 'All Events';
  };

  const locationString = city && state ? `${city}, ${state}` : null;

  return (
    <>
      <header className="mb-8">
        <h1 className="brand-heading text-4xl font-bold bg-gradient-to-r from-resistance-500 via-hack-green to-acid-400 bg-clip-text text-transparent mb-2">
          {pageTitle()}
        </h1>
        {locationString && (
          <p className="text-grit-300 text-lg">
            in {locationString}
          </p>
        )}
      </header>

      {isLoading && (
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" text="Loading events..." />
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-xl text-signal-500 mb-2">{error}</p>
            <button
              onClick={() => {
                setError(null);
                setIsLoading(true);
                fetchEvents(1);
              }}
              className="px-4 py-2 rounded-lg bg-acid-400 text-ink-900 font-medium hover:bg-hack-green transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {!isLoading && !error && events.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-xl text-grit-300">No events found.</p>
          <p className="text-sm text-grit-400 mt-2">Try adjusting your filters.</p>
        </div>
      )}

      {!isLoading && !error && events.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
            {events.map((event, index) => (
              <EventCard key={event.id} event={event} priority={index < 6} />
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center mt-12">
              <button
                onClick={loadMore}
                disabled={isLoadingMore}
                className={clsx(
                  'px-6 py-3 rounded-lg font-medium transition-all',
                  isLoadingMore
                    ? 'bg-grit-500 text-grit-300 cursor-not-allowed'
                    : 'bg-acid-400 text-ink-900 hover:bg-hack-green'
                )}
              >
                {isLoadingMore ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}

          {!hasMore && events.length > 0 && (
            <div className="text-center mt-12 text-grit-400">
              <p>No more events to load</p>
            </div>
          )}
        </>
      )}
    </>
  );
}
