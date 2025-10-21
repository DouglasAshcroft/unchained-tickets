"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/hooks/useAuth";
import { api } from "@/lib/api/client";
import LocationSelector, {
  type LocationOption,
  type SelectedLocation,
} from "@/components/LocationSelector";
import GenreCarousel, { type EventListItem } from "@/components/GenreCarousel";
import GenrePicker from "@/components/GenrePicker";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

type EventsPageClientProps = {
  cities: LocationOption[];
};

type GenreData = {
  location: { city: string; state: string } | null;
  genres: Record<string, EventListItem[]>;
  availableGenres: Array<{ name: string; slug: string; count: number }>;
  totalGenres: number;
};

export default function EventsPageClient({ cities }: EventsPageClientProps) {
  const { user, isAuthenticated } = useAuth();
  const [selectedLocation, setSelectedLocation] =
    useState<SelectedLocation>(null);
  const [locationSource, setLocationSource] = useState<
    "profile" | "manual" | null
  >(null);

  // Load profile location as default on mount
  useEffect(() => {
    if (isAuthenticated && user) {
      api
        .getProfile()
        .then((profile) => {
          if (profile.location && !selectedLocation) {
            // Parse location string format "City, State"
            const parts = profile.location.split(",").map((s: string) => s.trim());
            if (parts.length === 2) {
              const [city, state] = parts;
              setSelectedLocation({ city, state });
              setLocationSource("profile");
            }
          }
        })
        .catch((error) => {
          console.error("Error fetching profile location:", error);
        });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user]); // Don't include selectedLocation in deps to avoid infinite loop

  const { data, isLoading, error } = useQuery<GenreData>({
    queryKey: ["events-by-genre", selectedLocation],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (selectedLocation) {
        params.set("city", selectedLocation.city);
        params.set("state", selectedLocation.state);
      }

      const response = await fetch(`/api/events/by-genre?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch events");
      }

      return response.json();
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const genreLabels: Record<string, string> = {
    featured: "🔥 Featured Venues and Artist",
    "all-events": "🎉 All Events",
    rock: "🎸 Rock",
    pop: "🎤 Pop",
    "hip-hop": "🎤 Hip-Hop",
    electronic: "🎧 Electronic",
    country: "🤠 Country",
    rnb: "🎵 R&B",
    "r&b": "🎵 R&B",
    jazz: "🎺 Jazz",
    "jazz-fusion": "🎺 Jazz Fusion",
    "indie-rock": "🎸 Indie Rock",
    metal: "🤘 Metal",
    alternative: "🎵 Alternative",
    punk: "💥 Punk",
    reggae: "🌴 Reggae",
    folk: "🎻 Folk",
    soul: "✨ Soul",
    funk: "🎷 Funk",
    blues: "🎸 Blues",
    classical: "🎻 Classical",
    disco: "🕺 Disco",
    synthwave: "🎹 Synthwave",
    "dream-pop": "💭 Dream Pop",
    "psychedelic-rock": "🎸 Psychedelic Rock",
    "indie-pop": "🎧 Indie Pop",
  };

  // Genre popularity order (music industry standard)
  const genrePopularityOrder = [
    "rock",
    "pop",
    "hip-hop",
    "electronic",
    "country",
    "rnb",
    "r&b",
    "jazz",
    "jazz-fusion",
    "indie-rock",
    "metal",
    "alternative",
    "punk",
    "reggae",
    "folk",
    "soul",
    "funk",
    "blues",
    "classical",
    "disco",
    "synthwave",
    "dream-pop",
    "psychedelic-rock",
    "indie-pop",
    "all-events",
  ];

  // Sort genres by popularity
  const sortedGenres =
    data?.availableGenres
      .filter((g) => g.slug !== "featured")
      .sort((a, b) => {
        const aIndex = genrePopularityOrder.indexOf(a.slug);
        const bIndex = genrePopularityOrder.indexOf(b.slug);
        const aOrder = aIndex === -1 ? 999 : aIndex;
        const bOrder = bIndex === -1 ? 999 : bIndex;
        return aOrder - bOrder;
      }) || [];

  return (
    <>
      <header className="mb-8">
        <h1 className="brand-heading text-4xl font-bold bg-gradient-to-r from-resistance-500 via-hack-green to-acid-400 bg-clip-text text-transparent">
          Discover Events
        </h1>
      </header>

      {isLoading && (
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" text="Loading events..." />
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-xl text-signal-500 mb-2">
              Failed to load events
            </p>
            <p className="text-sm text-grit-400">Please try again later</p>
          </div>
        </div>
      )}

      {data && !isLoading && (
        <>
          {Object.keys(data.genres).length === 0 && (
            <div className="py-16 text-center">
              <p className="text-xl text-grit-300">No events found.</p>
              {selectedLocation && (
                <p className="text-sm text-grit-400 mt-2">
                  Try selecting a different location or browse all events.
                </p>
              )}
            </div>
          )}

          {/* Featured Resistance Section */}
          {data.genres.featured && data.genres.featured.length > 0 && (
            <div className="mb-12 relative">
              {/* Resistance Theme Container */}
              <div className="border-2 border-resistance-500/30 bg-gradient-to-br from-resistance-500/5 via-hack-green/5 to-acid-400/5 rounded-2xl p-6 md:p-8 shadow-[0_0_30px_rgba(255,0,102,0.15)]">
                <div className="mb-6 text-center space-y-3">
                  <div className="inline-block px-4 py-2 bg-resistance-500/20 border border-resistance-500/50 rounded-full">
                    <span className="text-sm font-bold uppercase tracking-wider text-resistance-400">
                      ⚡ Join The Resistance ⚡
                    </span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-resistance-500 via-hack-green to-acid-400 bg-clip-text text-transparent">
                    Featured Venues & Artists
                  </h2>
                  <p className="text-grit-300 max-w-2xl mx-auto text-sm md:text-base">
                    These venues and artists have onboarded to{" "}
                    <span className="text-acid-400 font-semibold">
                      Unchained
                    </span>{" "}
                    - fighting the monopoly with{" "}
                    <span className="text-resistance-500 font-semibold">
                      decentralized ticketing
                    </span>
                    . Support the revolution! 🎸
                  </p>
                </div>

                <GenreCarousel
                  title=""
                  events={data.genres.featured}
                  seeAllHref={`/events/all?featured=true${
                    selectedLocation
                      ? `&city=${selectedLocation.city}&state=${selectedLocation.state}`
                      : ""
                  }`}
                  className="featured-carousel"
                />
              </div>
            </div>
          )}

          {/* Filter Controls */}
          <div className="mb-8 space-y-6">
            <p className="text-grit-300 max-w-2xl">
              Browse events by location and genre. Select your city to see
              what&apos;s happening near you.
            </p>

            {/* Profile Location Indicator */}
            {locationSource === "profile" && selectedLocation && (
              <div className="flex items-center justify-between bg-resistance-500/10 border border-resistance-500/30 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-grit-300">
                    📍 Showing events near{" "}
                    <span className="text-bone-100 font-medium">
                      {selectedLocation.city}, {selectedLocation.state}
                    </span>{" "}
                    (from your profile)
                  </span>
                </div>
                <button
                  onClick={() => {
                    setSelectedLocation(null);
                    setLocationSource("manual");
                  }}
                  className="text-sm text-acid-400 hover:brightness-110 transition-all px-3 py-1 rounded border border-acid-400/30"
                >
                  Change
                </button>
              </div>
            )}

            <LocationSelector
              cities={cities}
              selectedLocation={selectedLocation}
              onLocationChange={(location) => {
                setSelectedLocation(location);
                setLocationSource(location ? "manual" : null);
              }}
            />
          </div>

          {/* Genre Picker Navigation */}
          {sortedGenres.length > 0 && (
            <GenrePicker
              genres={sortedGenres.map((genre) => ({
                name: genreLabels[genre.slug] || genre.name,
                slug: genre.slug,
                count: genre.count,
              }))}
            />
          )}

          {/* Render other genre carousels in popularity order */}
          {sortedGenres.map((genre) => {
            const events = data.genres[genre.slug];
            if (!events || events.length === 0) return null;

            const label = genreLabels[genre.slug] || genre.name;

            return (
              <div key={genre.slug} id={`genre-${genre.slug}`}>
                <GenreCarousel
                  title={`${label} (${genre.count})`}
                  events={events}
                  seeAllHref={`/events/all?genre=${genre.slug}${
                    selectedLocation
                      ? `&city=${selectedLocation.city}&state=${selectedLocation.state}`
                      : ""
                  }`}
                />
              </div>
            );
          })}
        </>
      )}
    </>
  );
}
