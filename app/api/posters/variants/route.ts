import { NextRequest, NextResponse } from 'next/server';
import {
  getEventPosterVariants,
  approvePosterVariant,
  checkPosterWorkflowComplete,
} from '@/lib/services/PosterGenerationService';
import { prisma } from '@/lib/db/prisma';
import { verifyAuth } from '@/lib/utils/auth';

/**
 * GET /api/posters/variants?eventId=123
 * List all poster variants for an event
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json(
        { error: 'Missing eventId parameter' },
        { status: 400 }
      );
    }

    const variants = await getEventPosterVariants(parseInt(eventId));

    return NextResponse.json({
      variants: variants.map(v => ({
        id: v.id,
        variantName: v.variantName,
        imageUrl: v.imageUrl,
        rarityMultiplier: v.rarityMultiplier,
        isApproved: v.isApproved,
        ticketType: v.ticketType ? {
          id: v.ticketType.id,
          name: v.ticketType.name,
        } : null,
        createdAt: v.createdAt,
      })),
    });
  } catch (error) {
    console.error('[GET /api/posters/variants] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch poster variants' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/posters/variants
 * Approve or reject a poster variant
 *
 * Body:
 * {
 *   variantId: number
 *   action: 'approve' | 'reject'
 *   eventId: number (for checklist completion check)
 * }
 */
export async function PUT(request: NextRequest) {
  try {
    // Verify authentication
    const authUser = await verifyAuth(request);

    const body = await request.json();
    const { variantId, action, eventId } = body;

    if (!variantId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: variantId, action' },
        { status: 400 }
      );
    }

    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json(
        { error: 'Invalid action. Must be "approve" or "reject"' },
        { status: 400 }
      );
    }

    // TODO: Verify user has venue staff access

    if (action === 'approve') {
      const success = await approvePosterVariant(variantId);
      if (!success) {
        return NextResponse.json(
          { error: 'Failed to approve variant' },
          { status: 500 }
        );
      }

      // Check if poster workflow is now complete
      if (eventId) {
        const isComplete = await checkPosterWorkflowComplete(parseInt(eventId));

        if (isComplete) {
          // Get event to find venueId
          const event = await prisma.event.findUnique({
            where: { id: parseInt(eventId) },
            select: { venueId: true },
          });

          if (event) {
            // Auto-complete the checklist task
            await prisma.venueChecklistStatus.upsert({
              where: {
                venueId_task: {
                  venueId: event.venueId,
                  task: 'poster_workflow',
                },
              },
              update: {
                completedAt: new Date(),
                completedBy: authUser.id,
              },
              create: {
                venueId: event.venueId,
                task: 'poster_workflow',
                completedAt: new Date(),
                completedBy: authUser.id,
              },
            });
          }
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Poster variant approved',
      });
    } else {
      // Reject = delete the variant
      await prisma.eventPosterVariant.delete({
        where: { id: variantId },
      });

      return NextResponse.json({
        success: true,
        message: 'Poster variant rejected and deleted',
      });
    }
  } catch (error: any) {
    if (error.message === 'No token provided' || error.message === 'Invalid token') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.error('[PUT /api/posters/variants] Error:', error);
    return NextResponse.json(
      { error: 'Failed to update poster variant' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/posters/variants?variantId=123
 * Delete a poster variant
 */
export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication
    const _authUser = await verifyAuth(request);

    const searchParams = request.nextUrl.searchParams;
    const variantId = searchParams.get('variantId');

    if (!variantId) {
      return NextResponse.json(
        { error: 'Missing variantId parameter' },
        { status: 400 }
      );
    }

    // TODO: Verify user has venue staff access

    await prisma.eventPosterVariant.delete({
      where: { id: parseInt(variantId) },
    });

    return NextResponse.json({
      success: true,
      message: 'Poster variant deleted',
    });
  } catch (error: any) {
    if (error.message === 'No token provided' || error.message === 'Invalid token') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.error('[DELETE /api/posters/variants] Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete poster variant' },
      { status: 500 }
    );
  }
}
