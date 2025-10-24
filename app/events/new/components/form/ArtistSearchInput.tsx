'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

export interface Artist {
  id: number;
  name: string;
  slug: string;
  genre: string | null;
}

export interface ArtistSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (artist: Artist) => void;
  artists: Artist[];
  label?: string;
  error?: string;
  placeholder?: string;
}

/**
 * Artist search input with dropdown suggestions
 *
 * Features:
 * - Autocomplete dropdown with fuzzy search
 * - Keyboard navigation (Arrow keys, Enter, Escape)
 * - Click outside to close
 * - Accessibility support (ARIA attributes)
 */
export function ArtistSearchInput({
  value,
  onChange,
  onSelect,
  artists = [],
  label,
  error,
  placeholder = 'Search by artist name...',
}: ArtistSearchInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter artists based on search value
  const filteredArtists = artists.filter((artist) =>
    artist.name.toLowerCase().includes(value.toLowerCase())
  );

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

  // Handle artist selection
  const handleSelect = useCallback(
    (artist: Artist) => {
      onSelect(artist);
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
            prev < filteredArtists.length - 1 ? prev + 1 : 0
          );
          break;

        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredArtists.length - 1
          );
          break;

        case 'Enter':
          e.preventDefault();
          if (highlightedIndex >= 0 && filteredArtists[highlightedIndex]) {
            handleSelect(filteredArtists[highlightedIndex]);
          }
          break;

        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          setHighlightedIndex(-1);
          break;
      }
    },
    [isOpen, highlightedIndex, filteredArtists, handleSelect]
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
        aria-label="Search for artist"
        aria-expanded={isOpen}
        aria-autocomplete="list"
        aria-controls="artist-dropdown"
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
          id="artist-dropdown"
          role="listbox"
          onMouseDown={handleMouseDown}
          className="absolute z-10 mt-2 max-h-60 w-full overflow-auto rounded-lg border border-grit-500/30 bg-ink-800/95 shadow-2xl shadow-acid-400/10 backdrop-blur-sm dark:border-grit-500/30 dark:bg-ink-800/95 light:border-grit-400/30 light:bg-bone-100/95"
        >
          {filteredArtists.length === 0 ? (
            <div className="px-4 py-3 font-mono text-sm text-grit-400">
              No artists found
            </div>
          ) : (
            filteredArtists.map((artist, index) => (
              <div
                key={artist.id}
                role="option"
                aria-selected={index === highlightedIndex}
                onMouseDown={() => handleSelect(artist)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`cursor-pointer border-b border-grit-500/10 px-4 py-3 transition-colors last:border-b-0 ${
                  index === highlightedIndex
                    ? 'bg-acid-400/10 text-acid-400 dark:bg-acid-400/10 dark:text-acid-400 light:bg-cobalt-500/10 light:text-cobalt-500'
                    : 'text-bone-100 hover:bg-acid-400/5 dark:text-bone-100 light:text-ink-900'
                }`}
              >
                <div className="font-mono font-medium">
                  {artist.name}
                </div>
                {artist.genre && (
                  <div className="mt-1 font-mono text-xs text-grit-400">
                    {artist.genre}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
