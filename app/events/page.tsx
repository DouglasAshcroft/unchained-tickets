'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import EventCard from '@/components/EventCard';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import api from '@/lib/api/client';

export default function EventsPage() {
  const [search, setSearch] = useState('');

  const { data: events = [], isLoading, error } = useQuery({
    queryKey: ['events', search],
    queryFn: () => api.getEvents(search),
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Upcoming Events
          </h1>

          <div className="max-w-md">
            <input
              type="text"
              placeholder="Search events, artists, or venues..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-zinc-900 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </header>

        {isLoading && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-pulse text-lg text-gray-400">Loading events...</div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-red-400">Error loading events. Please try again.</div>
          </div>
        )}

        {!isLoading && !error && events.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-xl text-gray-400">No events found.</p>
            {search && (
              <p className="text-sm text-gray-500 mt-2">Try adjusting your search terms</p>
            )}
          </div>
        )}

        {!isLoading && !error && events.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
            {events.map((event: any) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
