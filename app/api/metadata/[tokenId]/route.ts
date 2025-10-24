import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { sanitizePosterImageUrl } from '@/lib/utils/posterImage';
import { getTicketState } from '@/lib/services/NFTMintingService';
import { getApprovedPosterForTicketType } from '@/lib/services/PosterGenerationService';

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
        ticketTypes: true,
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

    // Determine which ticket type this token belongs to
    // We need to look up the Charge or Ticket record that has this tokenId
    let ticketTypeId: number | null = null;
    let tierName = 'General Admission';
    let rarityMultiplier = 1.0;
    let isGenesisTicket = false;

    try {
      // Try to find ticket type from Charge record (most reliable)
      const charge = await prisma.charge.findFirst({
        where: {
          mintedTokenId: tokenId,
        },
        include: {
          ticket: {
            include: {
              ticketType: true,
            },
          },
        },
      });

      if (charge?.ticket?.ticketType) {
        ticketTypeId = charge.ticket.ticketType.id;
        tierName = charge.ticket.ticketType.name;
        isGenesisTicket = charge.ticket.isGenesisTicket || false;

        // Genesis tickets get 10x rarity multiplier
        if (isGenesisTicket) {
          rarityMultiplier = 10.0;
          tierName = 'Genesis Archive';
        }
      }
    } catch (error) {
      console.warn('[Metadata API] Could not determine ticket type, using default:', error);
    }

    // Get collectible poster for this tier (if ticket is USED or SOUVENIR)
    let posterImageUrl = sanitizePosterImageUrl(event.posterImageUrl);
    let isRevealed = false;

    // Genesis tickets are always revealed
    if (isGenesisTicket || ticketState >= 1) { // Genesis or USED or SOUVENIR state
      const collectiblePoster = await getApprovedPosterForTicketType(eventId, ticketTypeId);

      if (collectiblePoster) {
        posterImageUrl = collectiblePoster;
        isRevealed = true;

        // Get rarity multiplier from the variant (unless it's a Genesis ticket)
        if (!isGenesisTicket) {
          const variant = await prisma.eventPosterVariant.findFirst({
            where: {
              eventId,
              ticketTypeId,
              isApproved: true,
            },
          });

          if (variant) {
            rarityMultiplier = variant.rarityMultiplier;
          }
        }
        // Genesis tickets already have 10x multiplier set above
      }
    } else {
      // ACTIVE state - show mystery/unrevealed poster
      posterImageUrl = '/assets/posters/unrevealed-ticket.svg';
    }

    // Build metadata with proof-of-attendance gating
    const metadata = {
      name: isGenesisTicket
        ? `${event.title} - Genesis Archive Ticket #1`
        : isRevealed
          ? `${event.title} - Collectible ${tierName} Poster`
          : isSouvenir
            ? `${event.title} - Collectible Ticket`
            : `${event.title} - Ticket`,
      description: isGenesisTicket
        ? `Genesis Archive Ticket #1 for ${event.title} on ${new Date(event.startsAt).toLocaleDateString()}. The first NFT ticket minted for this event, preserved in Unchained's company history as a soulbound collectible. This ultra-rare artifact commemorates the beginning of this event's journey. Rarity: ${rarityMultiplier}x`
        : ticketState === 0
          ? `NFT ticket for ${event.title} at ${event.venue?.name || 'TBA'}. Admit one to the event on ${new Date(event.startsAt).toLocaleDateString()}. Attend the event to reveal your exclusive collectible poster!`
          : isRevealed
            ? `Collectible ${tierName} poster for ${event.title} on ${new Date(event.startsAt).toLocaleDateString()}. This exclusive artwork commemorates your attendance at this event. Rarity multiplier: ${rarityMultiplier}x`
            : `Commemorative NFT ticket for ${event.title}. This event has concluded and this ticket is now a collectible souvenir.`,
      image: posterImageUrl,
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
          trait_type: 'Ticket Tier',
          value: tierName,
        },
        {
          trait_type: 'Ticket Type',
          value: isSouvenir ? 'Souvenir' : ticketState === 1 ? 'Used' : 'Active',
        },
        {
          trait_type: 'On-Chain State',
          value: ticketState === 0 ? 'Active' : ticketState === 1 ? 'Used' : 'Souvenir',
        },
        {
          trait_type: 'Revealed',
          value: isRevealed ? 'Yes' : 'No',
        },
        {
          trait_type: 'Genesis Archive',
          value: isGenesisTicket ? 'Yes' : 'No',
        },
        {
          trait_type: 'Rarity Multiplier',
          value: rarityMultiplier,
          display_type: 'number',
        },
        {
          trait_type: 'Proof of Attendance',
          value: ticketState >= 1 ? 'Verified' : 'Pending',
        },
      ],
      properties: {
        event_id: eventId,
        token_id: tokenId,
        venue: event.venue?.name,
        date: event.startsAt,
        category: isGenesisTicket ? 'Genesis Archive' : isRevealed ? 'Collectible Poster' : 'Event Ticket',
        tier: tierName,
        rarity_multiplier: rarityMultiplier,
        revealed: isRevealed,
        genesis_archive: isGenesisTicket,
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
