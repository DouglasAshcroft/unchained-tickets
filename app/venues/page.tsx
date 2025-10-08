'use client';

import { useQuery } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import { useDebounce } from 'use-debounce';
import VenueCard from '@/components/VenueCard';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function VenuesPage() {
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [sortBy, setSortBy] = useState('name'); // name, capacity, events

  // Debounce search to prevent API spam (DoS protection)
  const [debouncedSearch] = useDebounce(search, 500);

  const { data: venues = [], isLoading, error } = useQuery({
    queryKey: ['venues'],
    queryFn: async () => {
      const response = await fetch('/api/venues');
      if (!response.ok) throw new Error('Failed to fetch venues');
      return response.json();
    },
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
  });

  // Show loading indicator during debounce
  const isSearching = search !== debouncedSearch;

  // Filter and sort venues
  const filteredAndSortedVenues = useMemo(() => {
    let filtered = [...venues];

    // Apply search filter
    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase();
      filtered = filtered.filter((venue: any) => {
        const addressLine1 = venue.addressLine1?.toLowerCase() ?? '';
        return (
          venue.name?.toLowerCase().includes(searchLower) ||
          venue.city?.toLowerCase().includes(searchLower) ||
          venue.state?.toLowerCase().includes(searchLower) ||
          addressLine1.includes(searchLower)
        );
      });
    }

    // Apply location filter
    if (locationFilter) {
      const locationLower = locationFilter.toLowerCase();
      filtered = filtered.filter((venue: any) => {
        const addressLine1 = venue.addressLine1?.toLowerCase() ?? '';
        return (
          venue.city?.toLowerCase().includes(locationLower) ||
          venue.state?.toLowerCase().includes(locationLower) ||
          addressLine1.includes(locationLower)
        );
      });
    }

    // Apply sorting
    filtered.sort((a: any, b: any) => {
      if (sortBy === 'name') {
        return (a.name || '').localeCompare(b.name || '');
      }
      if (sortBy === 'capacity') {
        return (b.capacity || 0) - (a.capacity || 0);
      }
      if (sortBy === 'events') {
        return (b.eventCount || 0) - (a.eventCount || 0);
      }
      return 0;
    });

    return filtered;
  }, [venues, debouncedSearch, locationFilter, sortBy]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <header className="mb-8 space-y-4">
          <h1 className="brand-heading text-4xl font-bold bg-gradient-to-r from-resistance-500 via-hack-green to-acid-400 bg-clip-text text-transparent">
            All Venues
          </h1>

          <div className="max-w-md relative">
            <input
              type="text"
              placeholder="Search venues by name or location..."
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
              <label className="text-sm text-grit-300">Location:</label>
              <input
                type="text"
                placeholder="Filter by location..."
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="px-3 py-2 rounded-lg bg-ink-800 border border-grit-500/30 text-bone-100 placeholder-grit-400 focus:outline-none focus:ring-2 focus:ring-acid-400/50"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-grit-300">Sort:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 rounded-lg bg-ink-800 border border-grit-500/30 text-bone-100 focus:outline-none focus:ring-2 focus:ring-acid-400/50"
              >
                <option value="name">Name</option>
                <option value="capacity">Capacity</option>
                <option value="events">Upcoming Events</option>
              </select>
            </div>

            <div className="flex items-center gap-2 text-sm text-grit-400">
              <span>{filteredAndSortedVenues.length} venue{filteredAndSortedVenues.length !== 1 ? 's' : ''} found</span>
            </div>
          </div>
        </header>

        {isLoading && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-pulse text-lg text-grit-300">Loading venues...</div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-signal-500">Error loading venues. Please try again.</div>
          </div>
        )}

        {!isLoading && !error && filteredAndSortedVenues.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-xl text-grit-300">No venues found.</p>
            {(search || locationFilter) && (
              <p className="text-sm text-grit-400 mt-2">Try adjusting your search or filters</p>
            )}
          </div>
        )}

        {!isLoading && !error && filteredAndSortedVenues.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
            {filteredAndSortedVenues.map((venue: any) => (
              <VenueCard key={venue.id} venue={venue} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
