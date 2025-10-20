'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { api } from '@/lib/api/client';

interface FavoriteArtistButtonProps {
  artistId: number;
  artistName: string;
  initialIsFavorite?: boolean;
}

function FavoriteArtistButton({
  artistId,
  artistName,
  initialIsFavorite = false,
}: FavoriteArtistButtonProps) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    if (!isAuthenticated) {
      alert('Please connect your wallet to favorite artists');
      return;
    }

    setIsLoading(true);
    try {
      const data = await api.toggleFavoriteArtist(artistId);
      setIsFavorite(data.action === 'added');
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('Failed to update favorite status');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return null; // Don't show button to unauthenticated users
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`group flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 ${
        isFavorite
          ? 'bg-purple-600 hover:bg-purple-700 text-white'
          : 'bg-gray-700 hover:bg-gray-600 text-gray-300 border border-gray-600'
      }`}
      title={isFavorite ? `Remove ${artistName} from favorites` : `Add ${artistName} to favorites`}
    >
      <span className="text-xl transition-transform group-hover:scale-110">
        {isFavorite ? '❤️' : '🤍'}
      </span>
      <span className="text-sm">
        {isLoading ? 'Loading...' : isFavorite ? 'Favorited' : 'Favorite'}
      </span>
    </button>
  );
}

export default FavoriteArtistButton;
