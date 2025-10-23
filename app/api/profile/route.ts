import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/utils/auth';
import { profileService } from '@/lib/services/ProfileService';
import { prisma } from '@/lib/db/prisma';

/**
 * GET /api/profile
 * Get current user's profile
 */
export async function GET(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request);
    const profile = await profileService.getUserProfile(authUser.id);

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/profile
 * Update current user's profile
 */
export async function PATCH(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request);
    const body = await request.json();
    const userId = authUser.id;

    // Validate and sanitize input
    const updateData: any = {};

    // Handle email update (only for placeholder emails)
    if (body.email !== undefined && body.email !== authUser.email) {
      const currentUser = await profileService.getUserProfile(userId);
      if (currentUser) {
        const isPlaceholderEmail = currentUser.email.endsWith('@wallet.unchained') ||
                                   currentUser.email.endsWith('@unchained.local');

        if (isPlaceholderEmail) {
          // Validate email format
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(body.email)) {
            return NextResponse.json(
              { error: 'Invalid email format' },
              { status: 400 }
            );
          }

          // Check if email is already taken
          const existingUser = await prisma.user.findUnique({
            where: { email: body.email },
          });

          if (existingUser && existingUser.id !== userId) {
            return NextResponse.json(
              { error: 'Email already in use' },
              { status: 400 }
            );
          }

          updateData.email = body.email;
        } else {
          return NextResponse.json(
            { error: 'Cannot update email for non-wallet accounts' },
            { status: 400 }
          );
        }
      }
    }

    if (body.name !== undefined) updateData.name = body.name;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.avatarUrl !== undefined) updateData.avatarUrl = body.avatarUrl;
    if (body.bio !== undefined) updateData.bio = body.bio;
    if (body.location !== undefined) updateData.location = body.location;
    if (body.favoriteGenres !== undefined) {
      if (!Array.isArray(body.favoriteGenres)) {
        return NextResponse.json(
          { error: 'favoriteGenres must be an array' },
          { status: 400 }
        );
      }
      updateData.favoriteGenres = body.favoriteGenres;
    }
    if (body.locationEnabled !== undefined) {
      updateData.locationEnabled = Boolean(body.locationEnabled);
    }
    if (body.latitude !== undefined) {
      updateData.latitude = parseFloat(body.latitude);
    }
    if (body.longitude !== undefined) {
      updateData.longitude = parseFloat(body.longitude);
    }

    const updatedUser = await profileService.updateProfile(userId, updateData);

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
