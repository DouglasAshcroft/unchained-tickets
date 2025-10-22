import { prisma } from '@/lib/db/prisma';
import type { UserRole, VenueStaffRole } from '@prisma/client';

interface UpdateProfileData {
  name?: string;
  phone?: string;
  avatarUrl?: string;
  bio?: string;
  location?: string;
  favoriteGenres?: string[];
  locationEnabled?: boolean;
  latitude?: number;
  longitude?: number;
}

interface UpdateProfileSettingsData {
  notificationsEnabled?: boolean;
  emailMarketing?: boolean;
  theme?: string;
  language?: string;
  timezone?: string;
}

interface UserProfileData {
  id: number;
  email: string;
  name: string | null;
  role: UserRole;
  phone: string | null;
  avatarUrl: string | null;
  bio: string | null;
  location: string | null;
  favoriteGenres: string[];
  locationEnabled: boolean;
  latitude: number | null;
  longitude: number | null;
  stripeCustomerId: string | null;
  createdAt: Date;
  profile: {
    notificationsEnabled: boolean;
    emailMarketing: boolean;
    theme: string;
    language: string;
    timezone: string | null;
  } | null;
  wallets: Array<{
    wallet: {
      address: string;
      chain: string;
    };
    isPrimary: boolean;
  }>;
  favoriteArtists: Array<{
    artist: {
      id: number;
      name: string;
      slug: string;
      imageUrl: string | null;
    };
  }>;
  _count: {
    tickets: number;
  };
}

/**
 * Service for managing user profiles and preferences
 */
export class ProfileService {
  /**
   * Get complete user profile with all related data
   */
  async getUserProfile(userId: number): Promise<UserProfileData | null> {
    // Ensure UserProfile exists (create if first access)
    await prisma.userProfile.upsert({
      where: { userId },
      create: {
        userId,
        notificationsEnabled: true,
        emailMarketing: false,
        theme: 'dark',
        language: 'en',
        timezone: null,
      },
      update: {}, // No-op if exists
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        avatarUrl: true,
        bio: true,
        location: true,
        favoriteGenres: true,
        locationEnabled: true,
        latitude: true,
        longitude: true,
        stripeCustomerId: true,
        createdAt: true,
        profile: {
          select: {
            notificationsEnabled: true,
            emailMarketing: true,
            theme: true,
            language: true,
            timezone: true,
          },
        },
        wallets: {
          select: {
            wallet: {
              select: {
                address: true,
                chain: true,
              },
            },
            isPrimary: true,
          },
        },
        favoriteArtists: {
          select: {
            artist: {
              select: {
                id: true,
                name: true,
                slug: true,
                imageUrl: true,
              },
            },
          },
          take: 20,
        },
        _count: {
          select: {
            tickets: true,
          },
        },
      },
    });

    if (!user) {
      return null;
    }

    return {
      ...user,
      latitude: user.latitude ? Number(user.latitude) : null,
      longitude: user.longitude ? Number(user.longitude) : null,
    };
  }

  /**
   * Update user profile information
   */
  async updateProfile(userId: number, data: UpdateProfileData) {
    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.avatarUrl !== undefined) updateData.avatarUrl = data.avatarUrl;
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.favoriteGenres !== undefined) updateData.favoriteGenres = data.favoriteGenres;
    if (data.locationEnabled !== undefined) updateData.locationEnabled = data.locationEnabled;
    if (data.latitude !== undefined) updateData.latitude = data.latitude;
    if (data.longitude !== undefined) updateData.longitude = data.longitude;

    return prisma.user.update({
      where: { id: userId },
      data: updateData,
    });
  }

  /**
   * Update user profile settings
   */
  async updateProfileSettings(userId: number, data: UpdateProfileSettingsData) {
    // Ensure profile exists
    const profile = await prisma.userProfile.upsert({
      where: { userId },
      create: {
        userId,
        notificationsEnabled: data.notificationsEnabled ?? true,
        emailMarketing: data.emailMarketing ?? false,
        theme: data.theme ?? 'dark',
        language: data.language ?? 'en',
        timezone: data.timezone,
      },
      update: data,
    });

    return profile;
  }

  /**
   * Add or remove favorite artist
   */
  async toggleFavoriteArtist(userId: number, artistId: number) {
    const existing = await prisma.favoriteArtist.findUnique({
      where: {
        userId_artistId: {
          userId,
          artistId,
        },
      },
    });

    if (existing) {
      // Remove favorite
      await prisma.favoriteArtist.delete({
        where: {
          userId_artistId: {
            userId,
            artistId,
          },
        },
      });
      return { action: 'removed', artistId };
    } else {
      // Add favorite
      await prisma.favoriteArtist.create({
        data: {
          userId,
          artistId,
        },
      });
      return { action: 'added', artistId };
    }
  }

  /**
   * Get user's advocacy stats
   */
  async getAdvocacyStats(email: string) {
    const signup = await prisma.waitlistSignup.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        advocacyCount: true,
        totalVenuesReached: true,
        currentTier: true,
      },
    });

    return signup;
  }

  /**
   * Get venue staff memberships for a user
   */
  async getVenueStaffMemberships(userId: number) {
    return prisma.venueStaff.findMany({
      where: {
        userId,
        isActive: true,
      },
      include: {
        venue: {
          select: {
            id: true,
            name: true,
            slug: true,
            city: true,
            state: true,
            imageUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Add a staff member to a venue
   */
  async addVenueStaff(params: {
    venueId: number;
    userId: number;
    role: VenueStaffRole;
    invitedBy: number;
  }) {
    const { venueId, userId, role, invitedBy } = params;

    // Check if already exists
    const existing = await prisma.venueStaff.findUnique({
      where: {
        venueId_userId: {
          venueId,
          userId,
        },
      },
    });

    if (existing) {
      // Reactivate if inactive
      if (!existing.isActive) {
        return prisma.venueStaff.update({
          where: { id: existing.id },
          data: {
            isActive: true,
            role,
          },
        });
      }
      throw new Error('User is already a staff member');
    }

    return prisma.venueStaff.create({
      data: {
        venueId,
        userId,
        role,
        invitedBy,
      },
    });
  }

  /**
   * Remove or deactivate a staff member
   */
  async removeVenueStaff(venueId: number, userId: number) {
    return prisma.venueStaff.update({
      where: {
        venueId_userId: {
          venueId,
          userId,
        },
      },
      data: {
        isActive: false,
      },
    });
  }

  /**
   * Update staff member role
   */
  async updateStaffRole(venueId: number, userId: number, role: VenueStaffRole) {
    return prisma.venueStaff.update({
      where: {
        venueId_userId: {
          venueId,
          userId,
        },
      },
      data: {
        role,
      },
    });
  }
}

// Export singleton instance
export const profileService = new ProfileService();
