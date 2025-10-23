'use client';

import { useState } from 'react';

//TODO The user location does not function properly. "Use my current location" doesn't work, and the Home field should auto-populate as user types to standardize the inputs to actual map locations. This will make it easier to geo-locate events near them.

interface LocationSectionProps {
  profile: {
    location: string | null;
    locationEnabled: boolean;
    latitude: number | null;
    longitude: number | null;
  };
  onUpdate: (updates: any) => Promise<boolean>;
}

export function LocationSection({ profile, onUpdate }: LocationSectionProps) {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    location: profile.location || '',
    locationEnabled: profile.locationEnabled,
  });
  const [saving, setSaving] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // Reverse geocode to get city name
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          const city =
            data.address.city || data.address.town || data.address.village || 'Unknown';
          const state = data.address.state || '';

          setFormData({
            ...formData,
            location: state ? `${city}, ${state}` : city,
            locationEnabled: true,
          });
        } catch (error) {
          console.error('Error reverse geocoding:', error);
          setFormData({
            ...formData,
            locationEnabled: true,
          });
        }

        setGettingLocation(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to retrieve your location');
        setGettingLocation(false);
      }
    );
  };

  const handleSave = async () => {
    setSaving(true);
    const success = await onUpdate(formData);
    setSaving(false);
    if (success) {
      setEditing(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      location: profile.location || '',
      locationEnabled: profile.locationEnabled,
    });
    setEditing(false);
  };

  return (
    <div className="bg-ink-800/50 border border-grit-500/30 rounded-lg p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-semibold mb-1 text-bone-100">Location</h2>
          <p className="text-sm text-grit-300">
            We use this to show you events near you
          </p>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="px-4 py-2 bg-resistance-500 hover:brightness-110 rounded-lg text-sm font-medium transition-all text-bone-100"
          >
            Edit
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Location Enabled Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-bone-100">Enable Location Services</p>
            <p className="text-sm text-grit-300">
              Get personalized event recommendations
            </p>
          </div>
          {editing ? (
            <button
              onClick={() =>
                setFormData({ ...formData, locationEnabled: !formData.locationEnabled })
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.locationEnabled ? 'bg-resistance-500' : 'bg-grit-500'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.locationEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          ) : (
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                profile.locationEnabled
                  ? 'bg-hack-green/20 text-hack-green'
                  : 'bg-ink-700 text-grit-400'
              }`}
            >
              {profile.locationEnabled ? 'Enabled' : 'Disabled'}
            </span>
          )}
        </div>

        {/* Home City */}
        <div>
          <label className="block text-sm font-medium text-bone-100 mb-2">
            Home City
          </label>
          {editing ? (
            <div className="space-y-2">
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2 bg-ink-700 border border-grit-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-resistance-500 text-bone-100"
                placeholder="e.g., San Francisco, CA"
              />
              <button
                onClick={handleGetCurrentLocation}
                disabled={gettingLocation}
                className="text-sm text-acid-400 hover:brightness-110 disabled:text-grit-500 transition-all"
              >
                {gettingLocation ? 'Getting location...' : '📍 Use my current location'}
              </button>
            </div>
          ) : (
            <p className="text-bone-100">{profile.location || 'Not set'}</p>
          )}
          {!editing && !profile.location && profile.locationEnabled && (
            <p className="text-sm text-acid-400 mt-2">
              ⚠️ Please set your home city for better event recommendations
            </p>
          )}
        </div>

        {/* Action Buttons */}
        {editing && (
          <div className="flex space-x-3 pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-resistance-500 hover:brightness-110 disabled:bg-grit-500 rounded-lg font-medium transition-all text-bone-100"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={handleCancel}
              disabled={saving}
              className="px-6 py-2 bg-ink-700 hover:bg-grit-500 border border-grit-500/30 rounded-lg font-medium transition-all text-bone-100"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
