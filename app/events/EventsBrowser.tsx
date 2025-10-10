'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import EventCard from '@/components/EventCard';

export type EventListItem = {
  id: number;
  title: string;
  startsAt: string;
  createdAt: string;
  posterImageUrl?: string | null;
  externalLink?: string | null;
  mapsLink?: string | null;
  venue?: {
    id: number;
    name: string;
    slug: string;
    city?: string | null;
    state?: string | null;
  } | null;
};

type EventsBrowserProps = {
  initialEvents: EventListItem[];
  initialSearch?: string;
  initialError?: string | null;
};

function toDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function isToday(date: Date) {
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

function isWithinDays(date: Date, days: number) {
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  return diff >= 0 && diff <= days * 24 * 60 * 60 * 1000;
}

function isSameMonth(date: Date, reference: Date) {
  return (
    date.getFullYear() === reference.getFullYear() &&
    date.getMonth() === reference.getMonth()
  );
}

export function EventsBrowser({ initialEvents, initialSearch = '', initialError = null }: EventsBrowserProps) {
  const [search, setSearch] = useState(initialSearch);
  const [events, setEvents] = useState<EventListItem[]>(initialEvents);
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date');
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(initialError);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const initialErrorRef = useRef(initialError);

  useEffect(() => {
    const trimmed = search.trim();

    if (trimmed.length === 0) {
      setEvents(initialEvents);
      setError(initialErrorRef.current ?? null);
      setIsFetching(false);
      return;
    }

    if (trimmed.length < 2) {
      setIsFetching(false);
      return;
    }

    const controller = new AbortController();
    setIsFetching(true);

    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ search: trimmed });
        const response = await fetch(`/api/events?${params.toString()}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error('Failed to load events');
        }

        const data = (await response.json()) as EventListItem[];
        setEvents(data);
        setError(null);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error(err);
          setError('Error loading events. Please try again.');
        }
      } finally {
        setIsFetching(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [search, initialEvents]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const suggestions = useMemo(() => {
    const trimmed = search.trim().toLowerCase();
    if (trimmed.length < 2) return [];

    const unique = new Set<string>();

    events.forEach((event) => {
      if (event.title?.toLowerCase().includes(trimmed)) {
        unique.add(event.title);
      }
      const venueName = event.venue?.name;
      if (venueName && venueName.toLowerCase().includes(trimmed)) {
        unique.add(venueName);
      }
    });

    return Array.from(unique).slice(0, 5);
  }, [events, search]);

  const filteredEvents = useMemo(() => {
    const now = new Date();

    const filtered = events.filter((event) => {
      if (dateFilter === 'all') return true;

      const eventDate = toDate(event.startsAt);
      if (!eventDate) return false;

      if (dateFilter === 'today') {
        return isToday(eventDate);
      }

      if (dateFilter === 'week') {
        return isWithinDays(eventDate, 7);
      }

      if (dateFilter === 'month') {
        return isSameMonth(eventDate, now);
      }

      return true;
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'name') {
        return (a.title || '').localeCompare(b.title || '');
      }

      const dateA = toDate(a.startsAt)?.getTime() ?? 0;
      const dateB = toDate(b.startsAt)?.getTime() ?? 0;
      return dateA - dateB;
    });
  }, [events, dateFilter, sortBy]);

  const handleSuggestionClick = (value: string) => {
    setSearch(value);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <>
      <header className="mb-8 space-y-4">
        <h1 className="brand-heading text-4xl font-bold bg-gradient-to-r from-resistance-500 via-hack-green to-acid-400 bg-clip-text text-transparent">
          Upcoming Events
        </h1>

        <div className="max-w-md relative">
          <input
            ref={inputRef}
            type="text"
            placeholder="Search events or venues..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            className="w-full px-4 py-3 pr-10 rounded-lg bg-ink-800 border border-grit-500/30 text-bone-100 placeholder-grit-400 focus:outline-none focus:ring-2 focus:ring-acid-400/50 focus:border-acid-400/50"
            autoComplete="off"
          />

          {isFetching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-5 h-5 border-2 border-acid-400 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {showSuggestions && suggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              className="absolute z-50 mt-2 w-full rounded-lg bg-ink-800 border border-grit-500/30 shadow-xl overflow-hidden"
            >
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full px-4 py-2.5 text-left text-bone-100 hover:bg-acid-400/10 transition-colors border-b border-grit-500/20 last:border-b-0 focus:outline-none focus:bg-acid-400/10"
                >
                  <span className="text-sm">{suggestion}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2 relative">
            <label htmlFor="events-date-filter" className="text-sm text-grit-300 shrink-0">
              Date:
            </label>
            <select
              id="events-date-filter"
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value as typeof dateFilter)}
              aria-label="Filter events by date"
              className="px-3 py-2 rounded-lg bg-ink-800 border border-grit-500/30 text-bone-100 focus:outline-none focus:ring-2 focus:ring-acid-400/50 min-w-[140px]"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>

          <div className="flex items-center gap-2 relative">
            <label htmlFor="events-sort-by" className="text-sm text-grit-300 shrink-0">
              Sort:
            </label>
            <select
              id="events-sort-by"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as typeof sortBy)}
              aria-label="Sort events by"
              className="px-3 py-2 rounded-lg bg-ink-800 border border-grit-500/30 text-bone-100 focus:outline-none focus:ring-2 focus:ring-acid-400/50 min-w-[120px]"
            >
              <option value="date">Date</option>
              <option value="name">Name</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-sm text-grit-400">
            <span>
              {filteredEvents.length} event{filteredEvents.length === 1 ? '' : 's'} found
            </span>
          </div>
        </div>

        {search.trim().length === 1 && (
          <p className="text-xs text-grit-500">
            Type at least two characters to search.
          </p>
        )}
      </header>

      {error && (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-signal-500">{error}</div>
        </div>
      )}

      {!error && filteredEvents.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-xl text-grit-300">No events found.</p>
          {(search || dateFilter !== 'all') && (
            <p className="text-sm text-grit-400 mt-2">Try adjusting your search or filters.</p>
          )}
        </div>
      )}

      {!error && filteredEvents.length > 0 && (
        <div
          className={clsx(
            'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr',
            isFetching && 'opacity-90'
          )}
        >
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </>
  );
}

export default EventsBrowser;
