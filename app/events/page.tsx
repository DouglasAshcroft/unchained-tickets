'use client';

import { useQuery } from '@tanstack/react-query';
import { useState, useMemo, useRef, useEffect } from 'react';
import { useDebounce } from 'use-debounce';
import { isToday, isThisWeek, isThisMonth } from 'date-fns';
import EventCard from '@/components/EventCard';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import api from '@/lib/api/client';

export default function EventsPage() {
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('all'); // all, today, week, month
  const [sortBy, setSortBy] = useState('date'); // date, price, name
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Debounce search to prevent API spam (DoS protection)
  const [debouncedSearch] = useDebounce(search, 500);

  const { data: events = [], isLoading, error } = useQuery({
    queryKey: ['events', debouncedSearch],
    queryFn: () => api.getEvents(debouncedSearch),
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes to reduce refetches
    enabled: debouncedSearch.length === 0 || debouncedSearch.length >= 2, // Only search if empty or 2+ chars
  });

  // Show loading indicator during debounce
  const isSearching = search !== debouncedSearch;

  // Generate autocomplete suggestions from available events
  const suggestions = useMemo(() => {
    if (!search || search.length < 2 || !events.length) return [];

    const uniqueSuggestions = new Set<string>();

    events.forEach((event: any) => {
      // Add event title
      if (event.title?.toLowerCase().includes(search.toLowerCase())) {
        uniqueSuggestions.add(event.title);
      }
      // Add venue name
      if (event.venue?.name?.toLowerCase().includes(search.toLowerCase())) {
        uniqueSuggestions.add(event.venue.name);
      }
      // Add artist names
      event.artists?.forEach((artistLink: any) => {
        const artistName = artistLink?.artist?.name;
        if (artistName?.toLowerCase().includes(search.toLowerCase())) {
          uniqueSuggestions.add(artistName);
        }
      });
    });

    return Array.from(uniqueSuggestions).slice(0, 5); // Limit to 5 suggestions
  }, [search, events]);

  // Close dropdown when clicking outside
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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearch(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // Filter and sort events
  const filteredAndSortedEvents = useMemo(() => {
    let filtered = [...events];

    // Apply date filter
    if (dateFilter !== 'all') {
      filtered = filtered.filter((event: any) => {
        const eventDate = new Date(event.startsAt);
        if (dateFilter === 'today') return isToday(eventDate);
        if (dateFilter === 'week') return isThisWeek(eventDate);
        if (dateFilter === 'month') return isThisMonth(eventDate);
        return true;
      });
    }

    // Apply sorting
    filtered.sort((a: any, b: any) => {
      if (sortBy === 'date') {
        return new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime();
      }
      if (sortBy === 'name') {
        return (a.title || '').localeCompare(b.title || '');
      }
      // Default: date ascending
      return new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime();
    });

    return filtered;
  }, [events, dateFilter, sortBy]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <header className="mb-8 space-y-4">
          <h1 className="brand-heading text-4xl font-bold bg-gradient-to-r from-resistance-500 via-hack-green to-acid-400 bg-clip-text text-transparent">
            Upcoming Events
          </h1>

          <div className="max-w-md relative">
            <input
              ref={inputRef}
              type="text"
              placeholder="Search events, artists, or venues..."
              value={search}
              onChange={handleSearchChange}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={handleKeyDown}
              className="w-full px-4 py-3 pr-10 rounded-lg bg-ink-800 border border-grit-500/30 text-bone-100 placeholder-grit-400 focus:outline-none focus:ring-2 focus:ring-acid-400/50 focus:border-acid-400/50"
              autoComplete="off"
            />
            {/* Loading spinner during debounce */}
            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-5 h-5 border-2 border-acid-400 border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {/* Autocomplete Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div
                ref={suggestionsRef}
                className="absolute z-50 mt-2 w-full rounded-lg bg-ink-800 border border-grit-500/30 shadow-xl overflow-hidden"
              >
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full px-4 py-2.5 text-left text-bone-100 hover:bg-acid-400/10 transition-colors border-b border-grit-500/20 last:border-b-0 focus:outline-none focus:bg-acid-400/10"
                  >
                    <span className="text-sm">{suggestion}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 relative">
              <label htmlFor="events-date-filter" className="text-sm text-grit-300 shrink-0">Date:</label>
              <select
                id="events-date-filter"
                name="dateFilter"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
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
              <label htmlFor="events-sort-by" className="text-sm text-grit-300 shrink-0">Sort:</label>
              <select
                id="events-sort-by"
                name="sortBy"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort events by"
                className="px-3 py-2 rounded-lg bg-ink-800 border border-grit-500/30 text-bone-100 focus:outline-none focus:ring-2 focus:ring-acid-400/50 min-w-[120px]"
              >
                <option value="date">Date</option>
                <option value="name">Name</option>
              </select>
            </div>

            <div className="flex items-center gap-2 text-sm text-grit-400">
              <span>{filteredAndSortedEvents.length} event{filteredAndSortedEvents.length !== 1 ? 's' : ''} found</span>
            </div>
          </div>
        </header>

        {isLoading && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-pulse text-lg text-grit-300">Loading events...</div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-signal-500">Error loading events. Please try again.</div>
          </div>
        )}

        {!isLoading && !error && filteredAndSortedEvents.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-xl text-grit-300">No events found.</p>
            {(search || dateFilter !== 'all') && (
              <p className="text-sm text-grit-400 mt-2">Try adjusting your search or filters</p>
            )}
          </div>
        )}

        {!isLoading && !error && filteredAndSortedEvents.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
            {filteredAndSortedEvents.map((event: any) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
