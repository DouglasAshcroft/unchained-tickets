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
    <div className="relative w-full">
      {label && (
        <label className="mb-2 block text-sm font-medium text-gray-700">
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
        className={`w-full rounded-md border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-gray-300'
        }`}
      />

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {isOpen && (
        <div
          ref={dropdownRef}
          id="artist-dropdown"
          role="listbox"
          onMouseDown={handleMouseDown}
          className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-300 bg-white shadow-lg"
        >
          {filteredArtists.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500">
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
                className={`cursor-pointer px-4 py-2 hover:bg-blue-50 ${
                  index === highlightedIndex
                    ? 'bg-blue-50'
                    : 'bg-white'
                }`}
              >
                <div className="font-medium text-gray-900">
                  {artist.name}
                </div>
                {artist.genre && (
                  <div className="text-sm text-gray-500">
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
