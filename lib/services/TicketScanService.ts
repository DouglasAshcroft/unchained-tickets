import { prisma } from '@/lib/db/prisma';
import { useTicket as markTicketUsed, ownsTicket } from './NFTMintingService';
import type { Address } from 'viem';

export type ScanTicketRequest = {
  ticketId: string;
  walletAddress: string;
  transformToSouvenir?: boolean;
};

export type ScanTicketResult = {
  success: boolean;
  ticket?: {
    id: string;
    eventId: number;
    eventName: string;
    venueName: string;
    seatSection?: string;
    seatRow?: string;
    seat?: string;
    status: string;
  };
  transactionHash?: string;
  souvenirMetadataUrl?: string;
  error?: string;
};

/**
 * Validates and scans a ticket at the venue
 * Transforms the ticket to a souvenir NFT if requested
 */
export async function scanTicket(
  request: ScanTicketRequest
): Promise<ScanTicketResult> {
  try {
    console.log('[TicketScanService] Scanning ticket:', request);

    // Find the ticket in the database
    const ticket = await prisma.ticket.findUnique({
      where: { id: request.ticketId },
      include: {
        event: {
          include: {
            venue: true,
          },
        },
      },
    });

    if (!ticket) {
      return {
        success: false,
        error: 'Ticket not found',
      };
    }

    // Check if ticket is already used
    if (ticket.status === 'used') {
      return {
        success: false,
        error: 'Ticket has already been used',
      };
    }

    // Verify the ticket hasn't been cancelled or is invalid
    if (ticket.status !== 'minted' && ticket.status !== 'reserved') {
      return {
        success: false,
        error: `Ticket cannot be scanned. Status: ${ticket.status}`,
      };
    }

    // Get the charge record to find the minted token ID
    const charge = await prisma.charge.findFirst({
      where: { ticketId: ticket.id },
      orderBy: { createdAt: 'desc' },
    });

    if (!charge || !charge.mintedTokenId) {
      return {
        success: false,
        error: 'Ticket NFT not found. Please contact support.',
      };
    }

    const tokenId = BigInt(charge.mintedTokenId);

    // Verify ownership
    try {
      const isOwner = await ownsTicket(
        request.walletAddress as Address,
        tokenId
      );

      if (!isOwner) {
        return {
          success: false,
          error: 'Wallet does not own this ticket NFT',
        };
      }
    } catch (error) {
      console.error('[TicketScanService] Ownership verification failed:', error);
      return {
        success: false,
        error: 'Failed to verify ticket ownership',
      };
    }

    // Use the ticket on-chain (and optionally transform to souvenir)
    const transformToSouvenir = request.transformToSouvenir ?? true;
    const useTicketResult = await markTicketUsed(
      tokenId,
      request.walletAddress as Address,
      transformToSouvenir
    );

    if (!useTicketResult.success) {
      console.error('[TicketScanService] On-chain useTicket failed:', useTicketResult.error);
      return {
        success: false,
        error: `Failed to process ticket on blockchain: ${useTicketResult.error}`,
      };
    }

    // Update ticket status in database
    await prisma.ticket.update({
      where: { id: ticket.id },
      data: { status: 'used' },
    });

    // Create a scan record
    await prisma.ticketScan.create({
      data: {
        ticketId: ticket.id,
        scannedAt: new Date(),
        result: 'valid',
        scannerUserId: null, // TODO: Add actual staff user ID when auth is implemented
      },
    });

    console.log('[TicketScanService] Ticket scanned successfully:', {
      ticketId: ticket.id,
      tokenId: tokenId.toString(),
      transactionHash: useTicketResult.transactionHash,
    });

    // Build metadata URL for souvenir
    const souvenirMetadataUrl = transformToSouvenir
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/metadata/${tokenId.toString()}`
      : undefined;

    return {
      success: true,
      ticket: {
        id: ticket.id,
        eventId: ticket.eventId,
        eventName: ticket.event.title,
        venueName: ticket.event.venue.name,
        seatSection: ticket.seatSection || undefined,
        seatRow: ticket.seatRow || undefined,
        seat: ticket.seat || undefined,
        status: 'used',
      },
      transactionHash: useTicketResult.transactionHash,
      souvenirMetadataUrl,
    };
  } catch (error) {
    console.error('[TicketScanService] Scan failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown scanning error',
    };
  }
}

/**
 * Validates a ticket QR code without scanning it
 * Used for quick validation before actual scanning
 */
export async function validateTicket(ticketId: string): Promise<{
  valid: boolean;
  ticket?: {
    id: string;
    eventName: string;
    venueName: string;
    eventDate: Date;
    status: string;
    seatInfo?: string;
    tierName?: string;
    perks?: Array<{
      id: number;
      name: string;
      description?: string | null;
      instructions?: string | null;
      quantity: number;
      redeemedQuantity: number;
      remainingQuantity: number;
    }>;
  };
  error?: string;
}> {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        event: {
          include: {
            venue: true,
          },
        },
        ticketType: {
          include: {
            perks: true,
          },
        },
        perkRedemptions: {
          include: {
            perk: true,
          },
        },
      },
    });

    if (!ticket) {
      return {
        valid: false,
        error: 'Ticket not found',
      };
    }

    if (ticket.status === 'used') {
      return {
        valid: false,
        error: 'Ticket has already been used',
      };
    }

    if (ticket.status === 'canceled') {
      return {
        valid: false,
        error: 'Ticket has been cancelled',
      };
    }

    const seatInfo = [ticket.seatSection, ticket.seatRow, ticket.seat]
      .filter(Boolean)
      .join(' ');

    const redemptionsByPerkId = new Map(
      ticket.perkRedemptions.map((redemption) => [redemption.ticketPerkId, redemption])
    );

    const perksWithStatus = [] as Array<{
      id: number;
      name: string;
      description?: string | null;
      instructions?: string | null;
      quantity: number;
      redeemedQuantity: number;
      remainingQuantity: number;
    }>;

    if (ticket.ticketType?.perks) {
      for (const perk of ticket.ticketType.perks) {
        let redemption = redemptionsByPerkId.get(perk.id);

        if (!redemption) {
          redemption = await prisma.ticketPerkRedemption.create({
            data: {
              ticketId: ticket.id,
              ticketPerkId: perk.id,
            },
            include: {
              perk: true,
            },
          });
          redemptionsByPerkId.set(perk.id, redemption);
        }

        perksWithStatus.push({
          id: perk.id,
          name: perk.name,
          description: perk.description,
          instructions: perk.instructions,
          quantity: perk.quantity,
          redeemedQuantity: redemption.redeemedQuantity,
          remainingQuantity: Math.max(perk.quantity - redemption.redeemedQuantity, 0),
        });
      }
    }

    return {
      valid: true,
      ticket: {
        id: ticket.id,
        eventName: ticket.event.title,
        venueName: ticket.event.venue.name,
        eventDate: ticket.event.startsAt,
        status: ticket.status,
        seatInfo: seatInfo || undefined,
        tierName: ticket.ticketType?.name,
        perks: perksWithStatus,
      },
    };
  } catch (error) {
    console.error('[TicketScanService] Validation failed:', error);
    return {
      valid: false,
      error: 'Failed to validate ticket',
    };
  }
}
