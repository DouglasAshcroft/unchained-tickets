import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/utils/auth';
import { prisma } from '@/lib/db/prisma';

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

/**
 * GET /api/venues/[slug]/staff
 * Get all staff members for a venue
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const authUser = await verifyAuth(request);
    const { slug } = await context.params;

    // Find venue by slug
    const venue = await prisma.venue.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!venue) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 });
    }

    const venueIdNum = venue.id;

    // Check if user has permission to view staff
    const userStaff = await prisma.venueStaff.findUnique({
      where: {
        venueId_userId: {
          venueId: venueIdNum,
          userId: authUser.id,
        },
      },
    });

    if (!userStaff || !userStaff.isActive) {
      return NextResponse.json(
        { error: 'You do not have access to this venue' },
        { status: 403 }
      );
    }

    // Get all staff members
    const staff = await prisma.venueStaff.findMany({
      where: {
        venueId: venueIdNum,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true,
          },
        },
        inviter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [{ isActive: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json(staff);
  } catch (error) {
    console.error('Error fetching venue staff:', error);
    return NextResponse.json(
      { error: 'Failed to fetch venue staff' },
      { status: 500 }
    );
  }
}
