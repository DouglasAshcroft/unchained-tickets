'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

export interface Venue {
  id: number;
  name: string;
  slug: string;
  city?: string | null;
  state?: string | null;
}

export interface VenueSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (venue: Venue) => void;
  venues: Venue[];
  label?: string;
  error?: string;
  placeholder?: string;
}

/**
 * Venue search input with dropdown suggestions
 *
 * Features:
 * - Autocomplete dropdown with fuzzy search (name and city)
 * - Keyboard navigation (Arrow keys, Enter, Escape)
 * - Click outside to close
 * - Accessibility support (ARIA attributes)
 */
export function VenueSearchInput({
  value,
  onChange,
  onSelect,
  venues = [],
  label,
  error,
  placeholder = 'Search by venue name or city...',
}: VenueSearchInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter venues based on search value (match name or city)
  const filteredVenues = venues.filter((venue) => {
    const searchLower = value.toLowerCase();
    const nameMatch = venue.name.toLowerCase().includes(searchLower);
    const cityMatch = venue.city?.toLowerCase().includes(searchLower) || false;
    return nameMatch || cityMatch;
  });

  // Handle input focus
  const handleFocus = useCallback(() => {
    setIsOpen(true);
    setHighlightedIndex(-1);
  }, []);

  // Handle input blur
  const handleBlur = useCallback(() => {
    // Delay to allow click events on dropdown items
    setTimeout(() => {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }, 200);
  }, []);

  // Handle input change
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
      setIsOpen(true);
      setHighlightedIndex(-1);
    },
    [onChange]
  );

  // Handle venue selection
  const handleSelect = useCallback(
    (venue: Venue) => {
      onSelect(venue);
      setIsOpen(false);
      setHighlightedIndex(-1);
    },
    [onSelect]
  );

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isOpen) {
        if (e.key === 'ArrowDown') {
          setIsOpen(true);
        }
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev < filteredVenues.length - 1 ? prev + 1 : 0
          );
          break;

        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredVenues.length - 1
          );
          break;

        case 'Enter':
          e.preventDefault();
          if (highlightedIndex >= 0 && filteredVenues[highlightedIndex]) {
            handleSelect(filteredVenues[highlightedIndex]);
          }
          break;

        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          setHighlightedIndex(-1);
          break;
      }
    },
    [isOpen, highlightedIndex, filteredVenues, handleSelect]
  );

  // Handle mousedown to prevent blur when clicking dropdown
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Prevent blur if clicking inside dropdown
    if (dropdownRef.current?.contains(e.target as Node)) {
      e.preventDefault();
    }
  }, []);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && dropdownRef.current) {
      const highlightedElement = dropdownRef.current.children[
        highlightedIndex
      ] as HTMLElement;
      if (highlightedElement && highlightedElement.scrollIntoView) {
        highlightedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth',
        });
      }
    }
  }, [highlightedIndex]);

  // Format location string
  const formatLocation = (venue: Venue): string | null => {
    if (!venue.city && !venue.state) return null;
    if (venue.city && venue.state) return `${venue.city}, ${venue.state}`;
    return venue.city || venue.state || null;
  };

  return (
    <div className="group relative w-full">
      {label && (
        <label className="mb-2 block text-sm font-medium uppercase tracking-wide text-grit-300 dark:text-grit-300 light:text-grit-500">
          {label}
        </label>
      )}

      <input
        ref={inputRef}
        type="text"
        role="combobox"
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        aria-label="Search for venue"
        aria-expanded={isOpen}
        aria-autocomplete="list"
        aria-controls="venue-dropdown"
        className={`w-full rounded-lg border bg-ink-900/50 px-4 py-3.5 font-mono text-bone-100 placeholder-grit-400 backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-ink-900 dark:bg-ink-900/50 dark:text-bone-100 light:bg-white/50 light:text-ink-900 light:ring-offset-bone-100 ${
          error
            ? 'border-resistance-500/50 focus:border-resistance-500 focus:ring-resistance-500/50'
            : 'border-grit-500/30 hover:border-acid-400/50 focus:border-acid-400 focus:ring-acid-400/50'
        }`}
      />

      {error && (
        <div className="mt-2 flex items-start gap-2">
          <span className="text-resistance-500">⚠</span>
          <p className="text-sm text-resistance-400">{error}</p>
        </div>
      )}

      {isOpen && (
        <div
          ref={dropdownRef}
          id="venue-dropdown"
          role="listbox"
          onMouseDown={handleMouseDown}
          className="absolute z-10 mt-2 max-h-60 w-full overflow-auto rounded-lg border border-grit-500/30 bg-ink-800/95 shadow-2xl shadow-acid-400/10 backdrop-blur-sm dark:border-grit-500/30 dark:bg-ink-800/95 light:border-grit-400/30 light:bg-bone-100/95"
        >
          {filteredVenues.length === 0 ? (
            <div className="px-4 py-3 font-mono text-sm text-grit-400">
              No venues found
            </div>
          ) : (
            filteredVenues.map((venue, index) => {
              const location = formatLocation(venue);

              return (
                <div
                  key={venue.id}
                  role="option"
                  aria-selected={index === highlightedIndex}
                  onMouseDown={() => handleSelect(venue)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`cursor-pointer border-b border-grit-500/10 px-4 py-3 transition-colors last:border-b-0 ${
                    index === highlightedIndex
                      ? 'bg-acid-400/10 text-acid-400 dark:bg-acid-400/10 dark:text-acid-400 light:bg-cobalt-500/10 light:text-cobalt-500'
                      : 'text-bone-100 hover:bg-acid-400/5 dark:text-bone-100 light:text-ink-900'
                  }`}
                >
                  <div className="font-mono font-medium">
                    {venue.name}
                  </div>
                  {location && (
                    <div className="mt-1 font-mono text-xs text-grit-400">
                      {location}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
