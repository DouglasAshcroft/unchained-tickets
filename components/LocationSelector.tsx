'use client';

import { useEffect, useState } from 'react';
import clsx from 'clsx';

export type LocationOption = {
  city: string;
  state: string;
  slug: string;
  latitude: number | null;
  longitude: number | null;
  count: number;
};

export type SelectedLocation = {
  city: string;
  state: string;
} | null;

type LocationSelectorProps = {
  cities: LocationOption[];
  selectedLocation: SelectedLocation;
  onLocationChange: (location: SelectedLocation) => void;
  className?: string;
};

export function LocationSelector({
  cities,
  selectedLocation,
  onLocationChange,
  className,
}: LocationSelectorProps) {
  const [isDetecting, setIsDetecting] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const handleLocationSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;

    if (value === 'all') {
      onLocationChange(null);
      return;
    }

    const city = cities.find((c) => c.slug === value);
    if (city) {
      onLocationChange({ city: city.city, state: city.state });
    }
  };

  const handleUseMyLocation = () => {
    if (typeof window === 'undefined') {
      setGeoError('Not available on server');
      return;
    }

    if (!navigator.geolocation) {
      setGeoError('Geolocation not supported by your browser');
      return;
    }

    // Check if running on HTTP (geolocation requires HTTPS in production)
    if (window.location.protocol === 'http:' && window.location.hostname !== 'localhost') {
      setGeoError('Geolocation requires HTTPS');
      return;
    }

    setIsDetecting(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        // Find nearest city
        let nearestCity: LocationOption | null = null;
        let minDistance = Infinity;

        for (const city of cities) {
          if (city.latitude && city.longitude) {
            const distance = haversineDistance(
              latitude,
              longitude,
              city.latitude,
              city.longitude
            );

            if (distance < minDistance) {
              minDistance = distance;
              nearestCity = city;
            }
          }
        }

        setIsDetecting(false);

        if (nearestCity) {
          onLocationChange({ city: nearestCity.city, state: nearestCity.state });
          // Store in localStorage for future visits
          localStorage.setItem(
            'user_location',
            JSON.stringify({ city: nearestCity.city, state: nearestCity.state })
          );
        } else {
          setGeoError('No cities found nearby');
        }
      },
      (geoError) => {
        setIsDetecting(false);
        console.error('Geolocation error:', geoError);

        switch (geoError.code) {
          case geoError.PERMISSION_DENIED:
            setGeoError('Location permission denied');
            break;
          case geoError.POSITION_UNAVAILABLE:
            setGeoError('Location unavailable');
            break;
          case geoError.TIMEOUT:
            setGeoError('Location request timed out');
            break;
          default:
            setGeoError('Failed to get location');
        }
      }
    );
  };

  // Try to load saved location on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && !selectedLocation) {
      const saved = localStorage.getItem('user_location');
      if (saved) {
        try {
          const location = JSON.parse(saved);
          onLocationChange(location);
        } catch {
          // Invalid JSON, ignore
        }
      }
    }
    // Only run on mount, not when dependencies change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedSlug =
    selectedLocation
      ? `${selectedLocation.city.toLowerCase().replace(/\s+/g, '-')}-${selectedLocation.state.toLowerCase()}`
      : 'all';

  return (
    <div className={clsx('flex flex-col sm:flex-row gap-3 items-start sm:items-center', className)}>
      <label htmlFor="location-select" className="text-sm font-medium text-grit-300 shrink-0">
        📍 Location:
      </label>

      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
        <select
          id="location-select"
          value={selectedSlug}
          onChange={handleLocationSelect}
          className="px-4 py-2 rounded-lg bg-ink-800 border border-grit-500/30 text-bone-100 focus:outline-none focus:ring-2 focus:ring-acid-400/50 min-w-[240px]"
        >
          <option value="all">All Locations ({cities.reduce((sum, c) => sum + c.count, 0)} events)</option>
          {cities.map((city) => (
            <option key={city.slug} value={city.slug}>
              {city.city}, {city.state} ({city.count} event{city.count === 1 ? '' : 's'})
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={handleUseMyLocation}
          disabled={isDetecting}
          className={clsx(
            'px-4 py-2 rounded-lg border transition-colors text-sm font-medium',
            isDetecting
              ? 'border-grit-500/30 bg-ink-800 text-grit-400 cursor-wait'
              : 'border-acid-400/50 bg-acid-400/10 text-acid-400 hover:bg-acid-400/20'
          )}
        >
          {isDetecting ? 'Detecting...' : 'Use My Location'}
        </button>
      </div>

      {geoError && (
        <p className="text-xs text-signal-500 mt-1">{geoError}</p>
      )}

      {selectedLocation && (
        <p className="text-xs text-grit-400">
          Showing events in {selectedLocation.city}, {selectedLocation.state}
        </p>
      )}
    </div>
  );
}

// Haversine distance formula (in miles)
function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default LocationSelector;
