'use client';

import { useMemo, useState } from 'react';
import VenueCard from '@/components/VenueCard';

export type VenueListItem = {
  id: number;
  name: string;
  slug: string;
  imageUrl?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  capacity?: number | null;
  eventCount?: number;
};

type VenuesBrowserProps = {
  initialVenues: VenueListItem[];
  initialError?: string | null;
  initialSearch?: string;
  initialLocation?: string;
};

function toLower(value?: string | null) {
  return value?.toLowerCase() ?? '';
}

export function VenuesBrowser({
  initialVenues,
  initialError = null,
  initialSearch = '',
  initialLocation = '',
}: VenuesBrowserProps) {
  const [search, setSearch] = useState(initialSearch);
  const [locationFilter, setLocationFilter] = useState(initialLocation);
  const [sortBy, setSortBy] = useState<'name' | 'capacity' | 'events'>('name');

  const filteredVenues = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();
    const locationTerm = locationFilter.trim().toLowerCase();

    const filtered = initialVenues.filter((venue) => {
      const matchesSearch = !searchTerm
        || toLower(venue.name).includes(searchTerm)
        || toLower(venue.city).includes(searchTerm)
        || toLower(venue.state).includes(searchTerm)
        || toLower(venue.addressLine1).includes(searchTerm)
        || toLower(venue.addressLine2).includes(searchTerm);

      if (!matchesSearch) {
        return false;
      }

      if (!locationTerm) {
        return true;
      }

      return (
        toLower(venue.city).includes(locationTerm)
        || toLower(venue.state).includes(locationTerm)
        || toLower(venue.addressLine1).includes(locationTerm)
        || toLower(venue.addressLine2).includes(locationTerm)
      );
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'name') {
        return (a.name || '').localeCompare(b.name || '');
      }
      if (sortBy === 'capacity') {
        return (b.capacity ?? 0) - (a.capacity ?? 0);
      }
      if (sortBy === 'events') {
        return (b.eventCount ?? 0) - (a.eventCount ?? 0);
      }
      return 0;
    });
  }, [initialVenues, search, locationFilter, sortBy]);

  return (
    <>
      <header className="mb-8 space-y-4">
        <h1 className="brand-heading text-4xl font-bold bg-gradient-to-r from-resistance-500 via-hack-green to-acid-400 bg-clip-text text-transparent">
          All Venues
        </h1>

        <div className="max-w-md">
          <input
            type="text"
            placeholder="Search venues by name or location..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full px-4 py-3 pr-10 rounded-lg bg-ink-800 border border-grit-500/30 text-bone-100 placeholder-grit-400 focus:outline-none focus:ring-2 focus:ring-acid-400/50 focus:border-acid-400/50"
            autoComplete="off"
          />
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-grit-300">Location:</label>
            <input
              type="text"
              placeholder="Filter by city or state..."
              value={locationFilter}
              onChange={(event) => setLocationFilter(event.target.value)}
              className="px-3 py-2 rounded-lg bg-ink-800 border border-grit-500/30 text-bone-100 placeholder-grit-400 focus:outline-none focus:ring-2 focus:ring-acid-400/50"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-grit-300">Sort:</label>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as typeof sortBy)}
              className="px-3 py-2 rounded-lg bg-ink-800 border border-grit-500/30 text-bone-100 focus:outline-none focus:ring-2 focus:ring-acid-400/50"
            >
              <option value="name">Name</option>
              <option value="capacity">Capacity</option>
              <option value="events">Upcoming Events</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-sm text-grit-400">
            <span>{filteredVenues.length} venue{filteredVenues.length === 1 ? '' : 's'} found</span>
          </div>
        </div>

        {initialError && (
          <p className="text-sm text-signal-500">{initialError}</p>
        )}
      </header>

      {!initialError && filteredVenues.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-xl text-grit-300">No venues found.</p>
          {(search || locationFilter) && (
            <p className="text-sm text-grit-400 mt-2">Try adjusting your search or filters.</p>
          )}
        </div>
      )}

      {!initialError && filteredVenues.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
          {filteredVenues.map((venue) => (
            <VenueCard key={venue.id} venue={venue} />
          ))}
        </div>
      )}
    </>
  );
}

export default VenuesBrowser;
