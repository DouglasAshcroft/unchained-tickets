import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/utils/auth';
import { profileService } from '@/lib/services/ProfileService';

/**
 * GET /api/profile/venue-staff
 * Get user's venue staff memberships
 */
export async function GET(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request);
    const memberships = await profileService.getVenueStaffMemberships(authUser.id);

    return NextResponse.json(memberships);
  } catch (error) {
    console.error('Error fetching venue staff memberships:', error);
    return NextResponse.json(
      { error: 'Failed to fetch venue staff memberships' },
      { status: 500 }
    );
  }
}
