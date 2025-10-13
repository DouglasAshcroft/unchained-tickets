import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { sanitizePosterImageUrl } from '@/lib/utils/posterImage';
import { getTicketState } from '@/lib/services/NFTMintingService';

/**
 * Metadata API for NFT tickets
 * Returns ERC-1155 compliant metadata
 * Format: https://docs.opensea.io/docs/metadata-standards
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tokenId: string }> }
) {
  try {
    const { tokenId } = await params;

    // Extract event ID from token ID
    // Token ID format: eventId * 1000000 + counter
    const eventId = Math.floor(parseInt(tokenId) / 1000000);

    // Fetch event from database
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        venue: true,
        artists: {
          include: {
            artist: true,
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Build artist names
    const artists = event.artists
      .map((link) => link.artist?.name)
      .filter((name): name is string => Boolean(name))
      .join(', ');

    // Check on-chain ticket state
    // TicketState: 0 = ACTIVE, 1 = USED, 2 = SOUVENIR
    let ticketState = 0;
    let isSouvenir = false;

    try {
      ticketState = await getTicketState(BigInt(tokenId));
      isSouvenir = ticketState === 2; // SOUVENIR state
    } catch (error) {
      console.warn('[Metadata API] Could not fetch on-chain state, falling back to time-based check:', error);
      // Fallback: time-based determination
      isSouvenir = new Date() > new Date(event.endsAt || event.startsAt);
    }

    // Build metadata
    const metadata = {
      name: isSouvenir
        ? `${event.title} - Collectible Ticket`
        : `${event.title} - Ticket`,
      description: isSouvenir
        ? `Commemorative NFT ticket for ${event.title} on ${new Date(event.startsAt).toLocaleDateString()}. This event has concluded and this ticket is now a collectible souvenir.`
        : `NFT ticket for ${event.title} at ${event.venue?.name || 'TBA'}. Admit one to the event on ${new Date(event.startsAt).toLocaleDateString()}.`,
      image: sanitizePosterImageUrl(event.posterImageUrl),
      external_url: event.externalLink || `${process.env.NEXT_PUBLIC_APP_URL}/events/${event.id}`,
      attributes: [
        {
          trait_type: 'Event',
          value: event.title,
        },
        {
          trait_type: 'Venue',
          value: event.venue?.name || 'TBA',
        },
        {
          trait_type: 'Location',
          value: event.venue?.city && event.venue?.state
            ? `${event.venue.city}, ${event.venue.state}`
            : 'TBA',
        },
        {
          trait_type: 'Artists',
          value: artists || 'TBA',
        },
        {
          trait_type: 'Date',
          display_type: 'date',
          value: Math.floor(new Date(event.startsAt).getTime() / 1000),
        },
        {
          trait_type: 'Status',
          value: event.status,
        },
        {
          trait_type: 'Ticket Type',
          value: isSouvenir ? 'Souvenir' : ticketState === 1 ? 'Used' : 'Active',
        },
        {
          trait_type: 'On-Chain State',
          value: ticketState === 0 ? 'Active' : ticketState === 1 ? 'Used' : 'Souvenir',
        },
      ],
      properties: {
        event_id: eventId,
        token_id: tokenId,
        venue: event.venue?.name,
        date: event.startsAt,
        category: 'Event Ticket',
      },
    };

    // Add CORS headers for NFT marketplaces
    return NextResponse.json(metadata, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Error generating metadata:', error);
    return NextResponse.json(
      { error: 'Failed to generate metadata' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
