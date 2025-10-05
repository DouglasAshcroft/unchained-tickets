'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';
import Fuse from 'fuse.js';
import api from '@/lib/api/client';

interface SearchResult {
  type: 'event' | 'venue' | 'artist';
  id: number;
  name?: string;
  title?: string;
  slug?: string;
  venue?: string;
  genre?: string;
  city?: string;
  state?: string;
  score?: number; // For fuzzy match quality
}

interface SearchBarProps {
  className?: string;
  placeholder?: string;
}

export function SearchBar({
  className = '',
  placeholder = 'Search events, venues, artists...',
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Debounce the query for API calls (300ms delay)
  const [debouncedQuery] = useDebounce(query, 300);

  // Fetch all searchable data for client-side fuzzy search
  const { data: searchableData } = useQuery({
    queryKey: ['searchable-data'],
    queryFn: () => api.getAllSearchableData(),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Debounced server-side search (fallback for comprehensive results)
  const { data: serverResults, isLoading: isServerSearching } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => api.search(debouncedQuery),
    enabled: debouncedQuery.length > 2,
  });

  // Create Fuse.js instance for client-side fuzzy search
  const fuse = useMemo(() => {
    if (!searchableData) return null;

    const allData = [
      ...searchableData.events,
      ...searchableData.venues,
      ...searchableData.artists,
    ];

    return new Fuse(allData, {
      keys: [
        { name: 'title', weight: 2 }, // Events - higher weight
        { name: 'name', weight: 2 },  // Venues/Artists - higher weight
        { name: 'venue', weight: 1 }, // Event venue
        { name: 'genre', weight: 0.5 }, // Artist genre
        { name: 'city', weight: 0.5 },  // Venue city
      ],
      threshold: 0.3, // 0.0 = exact match, 1.0 = match anything
      includeScore: true,
      minMatchCharLength: 2,
      ignoreLocation: true, // Search across entire string
    });
  }, [searchableData]);

  // Get fuzzy search results (instant)
  const fuzzyResults = useMemo(() => {
    if (!fuse || query.length < 2) return [];

    const fuseResults = fuse.search(query);
    return fuseResults.slice(0, 10).map((result) => ({
      ...result.item,
      score: result.score,
    }));
  }, [fuse, query]);

  // Combine fuzzy results (instant) with server results (debounced)
  const combinedResults = useMemo(() => {
    // If server search is in progress or query is debouncing, show fuzzy results
    if (query !== debouncedQuery || isServerSearching) {
      return fuzzyResults;
    }

    // Otherwise, prefer server results for comprehensive search
    const serverRes = serverResults?.results || [];
    return serverRes.length > 0 ? serverRes : fuzzyResults;
  }, [query, debouncedQuery, fuzzyResults, serverResults, isServerSearching]);

  // Show loading indicator
  const showLoading = query.length > 2 && query !== debouncedQuery && !fuzzyResults.length;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setIsOpen(true);
  };

  const handleSelect = (item: SearchResult) => {
    setQuery('');
    setIsOpen(false);

    if (item.type === 'event') {
      router.push(`/events/${item.id}`);
    } else if (item.type === 'venue' && item.slug) {
      router.push(`/venues/${item.slug}`);
    } else if (item.type === 'artist' && item.slug) {
      router.push(`/artists/${item.slug}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  // Highlight matched text in results
  const highlightMatch = (text: string, searchTerm: string) => {
    if (!searchTerm) return text;

    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-acid-400/30 text-acid-400">
          {part}
        </mark>
      ) : (
        <span key={index}>{part}</span>
      )
    );
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <label htmlFor="global-search" className="sr-only">
          Search events, artists, and venues
        </label>
        <input
          ref={inputRef}
          id="global-search"
          name="search"
          type="search"
          value={query}
          onChange={handleChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label="Search events, artists, and venues"
          aria-autocomplete="list"
          aria-controls={isOpen && combinedResults.length > 0 ? "search-results" : undefined}
          className="w-72 max-w-[56vw] rounded-md bg-ink-800 border border-grit-500/30 px-3 py-2 pr-8 text-bone-100 placeholder-grit-400 focus:outline-none focus:ring-2 focus:ring-acid-400/50 focus:border-acid-400/50 transition-colors"
        />
        {/* Search Icon / Loading Spinner */}
        {showLoading ? (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-acid-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-grit-400">
            🔍
          </div>
        )}
      </div>

      {isOpen && combinedResults.length > 0 && (
        <div
          id="search-results"
          ref={resultsRef}
          role="listbox"
          aria-label="Search results"
          className="absolute mt-2 max-h-64 w-full min-w-[320px] overflow-auto rounded-md bg-ink-800 border border-grit-500/30 shadow-lg z-50 max-sm:fixed max-sm:left-4 max-sm:right-4 max-sm:w-auto"
        >
          {combinedResults.map((item: any, idx: number) => {
            const label =
              item.type === 'event'
                ? `${item.title}${item.venue ? ` @ ${item.venue}` : ''}`
                : item.name || item.title;

            return (
              <button
                key={`${item.type}-${item.id}-${idx}`}
                onClick={() => handleSelect(item)}
                className="w-full cursor-pointer px-3 py-2 text-sm text-left hover:bg-white/5 transition-colors border-b border-grit-500/20 last:border-b-0"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1">
                    {item.type === 'event' && (
                      <>
                        <strong className="text-acid-400">
                          {highlightMatch(item.title, query)}
                        </strong>
                        {item.venue && (
                          <span className="text-grit-300">
                            {' '}@ {highlightMatch(item.venue, query)}
                          </span>
                        )}
                      </>
                    )}
                    {item.type === 'venue' && (
                      <div>
                        <strong className="text-acid-400">
                          {highlightMatch(label, query)}
                        </strong>
                        {(item.city || item.state) && (
                          <div className="text-xs text-grit-400">
                            {item.city}, {item.state}
                          </div>
                        )}
                      </div>
                    )}
                    {item.type === 'artist' && (
                      <>
                        <strong className="text-acid-400">
                          {highlightMatch(label, query)}
                        </strong>
                        {item.genre && (
                          <span className="text-grit-400 ml-2 text-xs">
                            ({item.genre})
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  {/* Match quality indicator for fuzzy results */}
                  {item.score !== undefined && item.score > 0.2 && (
                    <span className="text-xs px-2 py-0.5 rounded bg-cobalt-500/20 text-cobalt-500">
                      Close match
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {isOpen && query.length > 2 && combinedResults.length === 0 && !showLoading && (
        <div
          ref={resultsRef}
          className="absolute mt-2 w-full rounded-md bg-ink-800 border border-grit-500/30 shadow-lg p-4 text-center text-sm text-grit-400"
        >
          No results found for &quot;{query}&quot;
        </div>
      )}
    </div>
  );
}
