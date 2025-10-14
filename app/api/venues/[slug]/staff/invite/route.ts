import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/utils/auth';
import { prisma } from '@/lib/db/prisma';
import { VenueStaffRole } from '@prisma/client';

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

/**
 * POST /api/venues/[slug]/staff/invite
 * Invite a staff member to a venue (by email)
 */
export async function POST(request: NextRequest, context: RouteContext) {
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

    const body = await request.json();
    const { email, role } = body;

    if (!email || !role) {
      return NextResponse.json(
        { error: 'Email and role are required' },
        { status: 400 }
      );
    }

    // Validate role
    if (!Object.values(VenueStaffRole).includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const inviterId = authUser.id;

    // Check if inviter has permission (must be owner or manager)
    const inviterStaff = await prisma.venueStaff.findUnique({
      where: {
        venueId_userId: {
          venueId: venueIdNum,
          userId: inviterId,
        },
      },
    });

    if (
      !inviterStaff ||
      (inviterStaff.role !== VenueStaffRole.OWNER &&
        inviterStaff.role !== VenueStaffRole.MANAGER)
    ) {
      return NextResponse.json(
        { error: 'You do not have permission to invite staff to this venue' },
        { status: 403 }
      );
    }

    // Find or create user by email
    let targetUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!targetUser) {
      // Create a placeholder user - they'll complete registration when they connect wallet
      targetUser = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          name: null,
          role: 'fan',
        },
      });
    }

    // Check if already a staff member
    const existingStaff = await prisma.venueStaff.findUnique({
      where: {
        venueId_userId: {
          venueId: venueIdNum,
          userId: targetUser.id,
        },
      },
    });

    if (existingStaff) {
      if (existingStaff.isActive) {
        return NextResponse.json(
          { error: 'User is already a staff member' },
          { status: 409 }
        );
      } else {
        // Reactivate
        const reactivated = await prisma.venueStaff.update({
          where: { id: existingStaff.id },
          data: {
            isActive: true,
            role,
          },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
            venue: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        });

        return NextResponse.json({
          message: 'Staff member reactivated',
          staff: reactivated,
        });
      }
    }

    // Create new staff member
    const newStaff = await prisma.venueStaff.create({
      data: {
        venueId: venueIdNum,
        userId: targetUser.id,
        role,
        invitedBy: inviterId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        venue: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: 'Staff member invited successfully',
      staff: newStaff,
    });
  } catch (error) {
    console.error('Error inviting staff member:', error);
    return NextResponse.json(
      { error: 'Failed to invite staff member' },
      { status: 500 }
    );
  }
}
