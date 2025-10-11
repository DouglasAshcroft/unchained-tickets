'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

type SearchResult = {
  type: 'event' | 'venue' | 'artist';
  id: number;
  title?: string;
  name?: string;
  slug?: string;
  venue?: string;
  genre?: string;
  city?: string;
  state?: string;
};

type SearchBarProps = {
  className?: string;
  placeholder?: string;
};

export function SearchBar({
  className = '',
  placeholder = 'Search events, venues, artists...',
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < 2) {
      setResults([]);
      setIsSearching(false);
      setError(null);
      abortControllerRef.current?.abort();
      return;
    }

    const controller = new AbortController();
    abortControllerRef.current?.abort();
    abortControllerRef.current = controller;

    setIsSearching(true);
    setError(null);

    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error('Failed to search');
        }

        const data = await response.json();
        setResults(data.results ?? []);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Search error', err);
          setError('Unable to search right now.');
        }
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

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

  const handleSelect = (item: SearchResult) => {
    setQuery('');
    setIsOpen(false);
    setResults([]);

    if (item.type === 'event') {
      router.push(`/events/${item.id}`);
      return;
    }

    if (item.type === 'venue' && item.slug) {
      router.push(`/venues/${item.slug}`);
      return;
    }

    if (item.type === 'artist' && item.slug) {
      router.push(`/artists/${item.slug}`);
    }
  };

  const highlightMatch = useMemo(() => {
    return (text: string) => {
      const trimmed = query.trim();
      if (!trimmed) return text;

      const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${escaped})`, 'gi');
      const parts = text.split(regex);

      return parts.map((part, index) =>
        index % 2 === 1 ? (
          <mark key={index} className="bg-acid-400/30 text-acid-400">
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        )
      );
    };
  }, [query]);

  const hasResults = results.length > 0;

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
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (query.length >= 2) {
              setIsOpen(true);
            }
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              setIsOpen(false);
              inputRef.current?.blur();
            }
          }}
          placeholder={placeholder}
          aria-label="Search events, artists, and venues"
          aria-autocomplete="list"
          aria-controls={isOpen && hasResults ? 'search-results' : undefined}
          className="w-72 max-w-[56vw] rounded-md bg-ink-800 border border-grit-500/30 px-3 py-2 pr-8 text-bone-100 placeholder-grit-400 focus:outline-none focus:ring-2 focus:ring-acid-400/50 focus:border-acid-400/50 transition-colors"
        />

        {isSearching ? (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-acid-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-grit-400">
            🔍
          </div>
        )}
      </div>

      {isOpen && (hasResults || error) && (
        <div
          ref={resultsRef}
          id="search-results"
          role="listbox"
          className="absolute z-50 mt-2 w-full rounded-lg bg-ink-900 border border-grit-500/30 shadow-xl overflow-hidden"
        >
          {error && (
            <div className="px-4 py-3 text-sm text-signal-500 border-b border-grit-500/20">
              {error}
            </div>
          )}

          {results.map((item, index) => {
            const label = item.title ?? item.name ?? 'Unnamed';
            const subtitle = item.venue
              || [item.city, item.state].filter(Boolean).join(', ')
              || item.genre
              || '';

            return (
              <button
                key={`${item.type}-${item.id}-${index}`}
                onClick={() => handleSelect(item)}
                className="w-full px-4 py-3 text-left text-bone-100 hover:bg-acid-400/10 transition-colors border-b border-grit-500/20 last:border-b-0 focus:outline-none focus:bg-acid-400/10"
                role="option"
                aria-selected="false"
              >
                <div className="text-sm font-medium">
                  {highlightMatch(label)}
                </div>
                {subtitle && (
                  <div className="text-xs text-grit-400 mt-1">{subtitle}</div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default SearchBar;
