'use client';

import { useQuery } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import { useDebounce } from 'use-debounce';
import ArtistCard from '@/components/ArtistCard';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function ArtistsPage() {
  const [search, setSearch] = useState('');
  const [genreFilter, setGenreFilter] = useState('');
  const [sortBy, setSortBy] = useState('name'); // name, genre, events

  // Debounce search to prevent API spam (DoS protection)
  const [debouncedSearch] = useDebounce(search, 500);

  const { data: artists = [], isLoading, error } = useQuery({
    queryKey: ['artists'],
    queryFn: async () => {
      const response = await fetch('/api/artists');
      if (!response.ok) throw new Error('Failed to fetch artists');
      return response.json();
    },
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
  });

  // Show loading indicator during debounce
  const isSearching = search !== debouncedSearch;

  // Extract unique genres for filter dropdown
  const uniqueGenres = useMemo(() => {
    const genres = new Set<string>();
    artists.forEach((artist: any) => {
      if (artist.genre) genres.add(artist.genre);
    });
    return Array.from(genres).sort();
  }, [artists]);

  // Filter and sort artists
  const filteredAndSortedArtists = useMemo(() => {
    let filtered = [...artists];

    // Apply search filter
    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase();
      filtered = filtered.filter((artist: any) =>
        artist.name?.toLowerCase().includes(searchLower) ||
        artist.genre?.toLowerCase().includes(searchLower)
      );
    }

    // Apply genre filter
    if (genreFilter) {
      filtered = filtered.filter((artist: any) => artist.genre === genreFilter);
    }

    // Apply sorting
    filtered.sort((a: any, b: any) => {
      if (sortBy === 'name') {
        return (a.name || '').localeCompare(b.name || '');
      }
      if (sortBy === 'genre') {
        return (a.genre || '').localeCompare(b.genre || '');
      }
      if (sortBy === 'events') {
        return (b.eventCount || 0) - (a.eventCount || 0);
      }
      return 0;
    });

    return filtered;
  }, [artists, debouncedSearch, genreFilter, sortBy]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <header className="mb-8 space-y-4">
          <h1 className="brand-heading text-4xl font-bold bg-gradient-to-r from-resistance-500 via-hack-green to-acid-400 bg-clip-text text-transparent">
            All Artists
          </h1>

          <div className="max-w-md relative">
            <input
              type="text"
              placeholder="Search artists by name or genre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-3 pr-10 rounded-lg bg-ink-800 border border-grit-500/30 text-bone-100 placeholder-grit-400 focus:outline-none focus:ring-2 focus:ring-acid-400/50 focus:border-acid-400/50"
              autoComplete="off"
            />
            {/* Loading spinner during debounce */}
            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-5 h-5 border-2 border-acid-400 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-grit-300">Genre:</label>
              <select
                value={genreFilter}
                onChange={(e) => setGenreFilter(e.target.value)}
                className="px-3 py-2 rounded-lg bg-ink-800 border border-grit-500/30 text-bone-100 focus:outline-none focus:ring-2 focus:ring-acid-400/50"
              >
                <option value="">All Genres</option>
                {uniqueGenres.map((genre) => (
                  <option key={genre} value={genre}>
                    {genre}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-grit-300">Sort:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 rounded-lg bg-ink-800 border border-grit-500/30 text-bone-100 focus:outline-none focus:ring-2 focus:ring-acid-400/50"
              >
                <option value="name">Name</option>
                <option value="genre">Genre</option>
                <option value="events">Upcoming Shows</option>
              </select>
            </div>

            <div className="flex items-center gap-2 text-sm text-grit-400">
              <span>{filteredAndSortedArtists.length} artist{filteredAndSortedArtists.length !== 1 ? 's' : ''} found</span>
            </div>
          </div>
        </header>

        {isLoading && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-pulse text-lg text-grit-300">Loading artists...</div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-signal-500">Error loading artists. Please try again.</div>
          </div>
        )}

        {!isLoading && !error && filteredAndSortedArtists.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-xl text-grit-300">No artists found.</p>
            {(search || genreFilter) && (
              <p className="text-sm text-grit-400 mt-2">Try adjusting your search or filters</p>
            )}
          </div>
        )}

        {!isLoading && !error && filteredAndSortedArtists.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
            {filteredAndSortedArtists.map((artist: any) => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
