'use client';

import { useMemo, useState } from 'react';
import ArtistCard from '@/components/ArtistCard';

export type ArtistListItem = {
  id: number;
  name: string;
  slug: string;
  genre?: string | null;
  eventCount?: number;
};

type ArtistsBrowserProps = {
  initialArtists: ArtistListItem[];
  initialError?: string | null;
  initialSearch?: string;
  initialGenre?: string;
};

export function ArtistsBrowser({
  initialArtists,
  initialError = null,
  initialSearch = '',
  initialGenre = '',
}: ArtistsBrowserProps) {
  const [search, setSearch] = useState(initialSearch);
  const [genreFilter, setGenreFilter] = useState(initialGenre);
  const [sortBy, setSortBy] = useState<'name' | 'genre' | 'events'>('name');

  const uniqueGenres = useMemo(() => {
    const genres = new Set<string>();
    initialArtists.forEach((artist) => {
      if (artist.genre) {
        genres.add(artist.genre);
      }
    });
    return Array.from(genres).sort((a, b) => a.localeCompare(b));
  }, [initialArtists]);

  const filteredArtists = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    const filtered = initialArtists.filter((artist) => {
      const matchesSearch = !searchTerm
        || artist.name.toLowerCase().includes(searchTerm)
        || (artist.genre?.toLowerCase().includes(searchTerm) ?? false);

      if (!matchesSearch) {
        return false;
      }

      if (!genreFilter) {
        return true;
      }

      return artist.genre === genreFilter;
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'genre') {
        return (a.genre ?? '').localeCompare(b.genre ?? '');
      }
      if (sortBy === 'events') {
        return (b.eventCount ?? 0) - (a.eventCount ?? 0);
      }
      return 0;
    });
  }, [initialArtists, search, genreFilter, sortBy]);

  return (
    <>
      <header className="mb-8 space-y-4">
        <h1 className="brand-heading text-4xl font-bold bg-gradient-to-r from-resistance-500 via-hack-green to-acid-400 bg-clip-text text-transparent">
          All Artists
        </h1>

        <div className="max-w-md">
          <input
            type="text"
            placeholder="Search artists by name or genre..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full px-4 py-3 pr-10 rounded-lg bg-ink-800 border border-grit-500/30 text-bone-100 placeholder-grit-400 focus:outline-none focus:ring-2 focus:ring-acid-400/50 focus:border-acid-400/50"
            autoComplete="off"
          />
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-grit-300">Genre:</label>
            <select
              value={genreFilter}
              onChange={(event) => setGenreFilter(event.target.value)}
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
              onChange={(event) => setSortBy(event.target.value as typeof sortBy)}
              className="px-3 py-2 rounded-lg bg-ink-800 border border-grit-500/30 text-bone-100 focus:outline-none focus:ring-2 focus:ring-acid-400/50"
            >
              <option value="name">Name</option>
              <option value="genre">Genre</option>
              <option value="events">Upcoming Shows</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-sm text-grit-400">
            <span>{filteredArtists.length} artist{filteredArtists.length === 1 ? '' : 's'} found</span>
          </div>
        </div>

        {initialError && (
          <p className="text-sm text-signal-500">{initialError}</p>
        )}
      </header>

      {!initialError && filteredArtists.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-xl text-grit-300">No artists found.</p>
          {(search || genreFilter) && (
            <p className="text-sm text-grit-400 mt-2">Try adjusting your search or filters.</p>
          )}
        </div>
      )}

      {!initialError && filteredArtists.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
          {filteredArtists.map((artist) => (
            <ArtistCard key={artist.id} artist={artist} />
          ))}
        </div>
      )}
    </>
  );
}

export default ArtistsBrowser;
