import { prisma } from '@/lib/db/prisma';
import type { UserRole } from '@prisma/client';

interface VenueAccessResult {
  venueId: number | null;
  inSupportMode: boolean;
  userRole: UserRole;
}

/**
 * Get the effective venue ID for a user based on their role and support session.
 *
 * - Regular venue users: Returns their owned venue
 * - Admin/Dev with support session: Returns the supported venue
 * - Admin/Dev without session: Returns null (requires venue selection)
 * - Other roles: Returns null
 */
export async function getEffectiveVenueId(userId: number): Promise<number | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!user) {
    return null;
  }

  // Admin or Dev - check for support session
  if (user.role === 'admin' || user.role === 'dev') {
    const session = await prisma.venueSupportSession.findFirst({
      where: {
        userId,
        endedAt: null,
      },
      orderBy: {
        startedAt: 'desc',
      },
      select: {
        supportedVenueId: true,
      },
    });

    return session?.supportedVenueId ?? null;
  }

  // Venue user - return their owned venue
  if (user.role === 'venue') {
    const venue = await prisma.venue.findFirst({
      where: { ownerUserId: userId },
      select: { id: true },
    });

    return venue?.id ?? null;
  }

  // Fans, Artists, etc. don't have venue access
  return null;
}

/**
 * Get comprehensive venue access information for a user.
 * Includes venue ID, support mode status, and user role.
 */
export async function getVenueAccess(userId: number): Promise<VenueAccessResult> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const result: VenueAccessResult = {
    venueId: null,
    inSupportMode: false,
    userRole: user.role,
  };

  // Admin or Dev - check for support session
  if (user.role === 'admin' || user.role === 'dev') {
    const session = await prisma.venueSupportSession.findFirst({
      where: {
        userId,
        endedAt: null,
      },
      orderBy: {
        startedAt: 'desc',
      },
      select: {
        supportedVenueId: true,
      },
    });

    if (session) {
      result.venueId = session.supportedVenueId;
      result.inSupportMode = true;
    }

    return result;
  }

  // Venue user - return their owned venue
  if (user.role === 'venue') {
    const venue = await prisma.venue.findFirst({
      where: { ownerUserId: userId },
      select: { id: true },
    });

    result.venueId = venue?.id ?? null;
    result.inSupportMode = false;

    return result;
  }

  return result;
}

/**
 * Verify that a user has access to a specific venue.
 * Returns true if the user owns the venue or is in a support session for it.
 */
export async function verifyVenueAccess(userId: number, venueId: number): Promise<boolean> {
  const effectiveVenueId = await getEffectiveVenueId(userId);
  return effectiveVenueId === venueId;
}

/**
 * Require venue access or throw an error.
 * Useful for API route protection.
 */
export async function requireVenueAccess(userId: number, venueId: number): Promise<void> {
  const hasAccess = await verifyVenueAccess(userId, venueId);

  if (!hasAccess) {
    throw new Error('Unauthorized: You do not have access to this venue');
  }
}

/**
 * Get client IP address from headers (for audit logging).
 */
export function getClientIp(headers: Headers): string | undefined {
  return (
    headers.get('x-forwarded-for')?.split(',')[0] ||
    headers.get('x-real-ip') ||
    undefined
  );
}

/**
 * Get user agent from headers (for audit logging).
 */
export function getUserAgent(headers: Headers): string | undefined {
  return headers.get('user-agent') || undefined;
}
