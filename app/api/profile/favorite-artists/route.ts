import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/utils/auth';
import { profileService } from '@/lib/services/ProfileService';

/**
 * POST /api/profile/favorite-artists
 * Toggle favorite artist
 */
export async function POST(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request);
    const body = await request.json();
    const userId = authUser.id;

    if (!body.artistId || typeof body.artistId !== 'number') {
      return NextResponse.json(
        { error: 'artistId is required and must be a number' },
        { status: 400 }
      );
    }

    const result = await profileService.toggleFavoriteArtist(userId, body.artistId);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error toggling favorite artist:', error);
    return NextResponse.json(
      { error: 'Failed to toggle favorite artist' },
      { status: 500 }
    );
  }
}
