import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyAuth } from '@/lib/utils/auth';

/**
 * POST /api/posters/upload
 * Upload a custom poster image for a ticket tier
 *
 * Required: Venue staff authentication
 *
 * Body: FormData
 * - eventId: string
 * - venueId: string
 * - ticketTypeId: string (optional - null for default)
 * - variantName: string
 * - imageFile: File (or base64 data URI)
 * - rarityMultiplier: string (optional, default based on tier)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authUser = await verifyAuth(request);

    const body = await request.json();
    const {
      eventId,
      venueId,
      ticketTypeId,
      variantName,
      imageDataUri,
      rarityMultiplier,
    } = body;

    // Validate required fields
    if (!eventId || !venueId || !variantName || !imageDataUri) {
      return NextResponse.json(
        { error: 'Missing required fields: eventId, venueId, variantName, imageDataUri' },
        { status: 400 }
      );
    }

    // Validate data URI format
    if (!imageDataUri.startsWith('data:image/')) {
      return NextResponse.json(
        { error: 'Invalid image format. Must be a data URI (data:image/...)' },
        { status: 400 }
      );
    }

    // Parse eventId and ticketTypeId
    const eventIdNum = parseInt(eventId);
    const ticketTypeIdNum = ticketTypeId ? parseInt(ticketTypeId) : null;

    // Verify event exists
    const event = await prisma.event.findUnique({
      where: { id: eventIdNum },
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // TODO: Verify user has venue staff access

    // Determine rarity multiplier
    let finalRarityMultiplier = parseFloat(rarityMultiplier) || 1.0;

    if (ticketTypeIdNum) {
      const ticketType = await prisma.eventTicketType.findUnique({
        where: { id: ticketTypeIdNum },
      });

      if (!ticketType) {
        return NextResponse.json(
          { error: 'Ticket type not found' },
          { status: 404 }
        );
      }

      // Auto-assign rarity based on tier name if not provided
      if (!rarityMultiplier) {
        if (ticketType.name.toLowerCase().includes('vip')) {
          finalRarityMultiplier = 2.0;
        } else if (ticketType.name.toLowerCase().includes('premium')) {
          finalRarityMultiplier = 1.5;
        }
      }
    }

    // Create poster variant
    const variant = await prisma.eventPosterVariant.create({
      data: {
        eventId: eventIdNum,
        ticketTypeId: ticketTypeIdNum,
        variantName,
        imageUrl: imageDataUri,
        rarityMultiplier: finalRarityMultiplier,
        generationPrompt: 'Manually uploaded by venue staff',
        isApproved: false, // Venues still need to approve manually uploaded images
      },
    });

    return NextResponse.json({
      success: true,
      variant: {
        id: variant.id,
        variantName: variant.variantName,
        imageUrl: variant.imageUrl,
        rarityMultiplier: variant.rarityMultiplier,
        isApproved: variant.isApproved,
      },
    });
  } catch (error: any) {
    if (error.message === 'No token provided' || error.message === 'Invalid token') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.error('[POST /api/posters/upload] Error:', error);
    return NextResponse.json(
      { error: 'Failed to upload poster' },
      { status: 500 }
    );
  }
}
