'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api/client';

interface MusicPreferencesSectionProps {
  profile: {
    favoriteGenres: string[];
    favoriteArtists: Array<{
      artist: {
        id: number;
        name: string;
        slug: string;
        imageUrl: string | null;
      };
    }>;
  };
  onUpdate: (updates: any) => Promise<boolean>;
  onRefresh: () => Promise<void>;
}

const AVAILABLE_GENRES = [
  'Rock',
  'Pop',
  'Hip Hop',
  'Electronic',
  'Jazz',
  'Blues',
  'Country',
  'Classical',
  'R&B',
  'Metal',
  'Indie',
  'Folk',
  'Reggae',
  'Latin',
  'K-Pop',
  'Punk',
  'Soul',
  'Disco',
];

export function MusicPreferencesSection({
  profile,
  onUpdate,
  onRefresh,
}: MusicPreferencesSectionProps) {
  const [editing, setEditing] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<string[]>(profile.favoriteGenres);
  const [saving, setSaving] = useState(false);
  const [removingArtist, setRemovingArtist] = useState<number | null>(null);

  const toggleGenre = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter((g) => g !== genre));
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const success = await onUpdate({ favoriteGenres: selectedGenres });
    setSaving(false);
    if (success) {
      setEditing(false);
    }
  };

  const handleCancel = () => {
    setSelectedGenres(profile.favoriteGenres);
    setEditing(false);
  };

  const handleRemoveFavoriteArtist = async (artistId: number) => {
    setRemovingArtist(artistId);
    try {
      await api.toggleFavoriteArtist(artistId);
      await onRefresh();
    } catch (error) {
      console.error('Error removing favorite artist:', error);
    } finally {
      setRemovingArtist(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Favorite Genres */}
      <div className="bg-ink-800/50 border border-grit-500/30 rounded-lg p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-semibold mb-1 text-bone-100">Favorite Genres</h2>
            <p className="text-sm text-grit-300">
              Select your favorite music genres to get personalized recommendations
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

        <div className="flex flex-wrap gap-2">
          {editing
            ? AVAILABLE_GENRES.map((genre) => (
                <button
                  key={genre}
                  onClick={() => toggleGenre(genre)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedGenres.includes(genre)
                      ? 'bg-resistance-500 text-bone-100'
                      : 'bg-ink-700 text-grit-300 hover:bg-grit-500 border border-grit-500/30'
                  }`}
                >
                  {genre}
                </button>
              ))
            : profile.favoriteGenres.length > 0
            ? profile.favoriteGenres.map((genre) => (
                <span
                  key={genre}
                  className="px-4 py-2 rounded-full text-sm font-medium bg-resistance-500 text-bone-100"
                >
                  {genre}
                </span>
              ))
            : <p className="text-grit-400">No genres selected</p>}
        </div>

        {editing && (
          <div className="flex space-x-3 pt-6 mt-6 border-t border-grit-500/30">
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

      {/* Favorite Artists */}
      <div className="bg-ink-800/50 border border-grit-500/30 rounded-lg p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-semibold mb-1 text-bone-100">Favorite Artists</h2>
            <p className="text-sm text-grit-300">
              Artists you follow - we&apos;ll notify you when they have events
            </p>
          </div>
          <Link
            href="/artists"
            className="px-4 py-2 bg-resistance-500 hover:brightness-110 rounded-lg text-sm font-medium transition-all text-bone-100"
          >
            Browse Artists
          </Link>
        </div>

        {profile.favoriteArtists.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {profile.favoriteArtists.map(({ artist }) => (
              <div
                key={artist.id}
                className="flex items-center space-x-3 bg-ink-700 border border-grit-500/30 rounded-lg p-3"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-resistance-500 to-acid-400 flex items-center justify-center text-lg font-bold flex-shrink-0 text-bone-100">
                  {artist.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={artist.imageUrl}
                      alt={artist.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    artist.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/artists/${artist.slug}`}
                    className="font-medium hover:text-acid-400 transition-colors truncate block text-bone-100"
                  >
                    {artist.name}
                  </Link>
                </div>
                <button
                  onClick={() => handleRemoveFavoriteArtist(artist.id)}
                  disabled={removingArtist === artist.id}
                  className="text-grit-400 hover:text-resistance-500 transition-colors disabled:opacity-50"
                  title="Remove from favorites"
                >
                  {removingArtist === artist.id ? '...' : '×'}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-grit-400 mb-4">You haven&apos;t favorited any artists yet</p>
            <Link
              href="/artists"
              className="inline-block px-6 py-2 bg-resistance-500 hover:brightness-110 rounded-lg font-medium transition-all text-bone-100"
            >
              Discover Artists
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
