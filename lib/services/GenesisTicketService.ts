/**
 * GenesisTicketService
 *
 * Handles minting and management of Genesis Archive Tickets - the first test ticket
 * for each event, preserved in Unchained's company history as a soulbound NFT.
 *
 * Genesis Tickets:
 * - Minted to company archive wallet
 * - Marked with isGenesisTicket: true
 * - Automatically revealed (marked as USED)
 * - Special metadata with 10x rarity multiplier
 * - Document Unchained's journey, one event at a time
 */

import { prisma } from '@/lib/db/prisma';
import { mintTicket } from '@/lib/services/NFTMintingService';
import { Address } from 'viem';

const COMPANY_ARCHIVE_WALLET = (process.env.COMPANY_ARCHIVE_WALLET || '0x44Df6638425A44FA72ac83BBEbdf45f5391a17c2') as Address;

export interface GenesisTicketResult {
  success: boolean;
  ticketId?: string;
  chargeId?: string;
  tokenId?: string;
  txHash?: string;
  error?: string;
}

/**
 * Mint the Genesis Archive Ticket for an event
 *
 * This creates the first NFT ticket for the event and marks it as a special
 * Genesis ticket for company history. The ticket is:
 * - Minted to the company archive wallet
 * - Marked as isGenesisTicket: true in database
 * - Automatically revealed (USED status) so poster shows immediately
 * - Given special section/row/seat: "GENESIS/001/001"
 */
export async function mintGenesisTicket(
  eventId: number,
  onChainEventId: number,
  recipientAddress: string = COMPANY_ARCHIVE_WALLET
): Promise<GenesisTicketResult> {
  console.log(`[GenesisTicketService] 🏆 Minting Genesis Archive Ticket for event ${eventId}...`);
  console.log(`[GenesisTicketService]    Recipient: ${recipientAddress}`);

  try {
    // Check if Genesis ticket already exists for this event
    const existingRegistry = await prisma.eventBlockchainRegistry.findUnique({
      where: { eventId },
      include: {
        genesisTicket: true,
      },
    });

    if (existingRegistry?.genesisTicket) {
      console.log(`[GenesisTicketService] Genesis ticket already exists for event ${eventId}`);
      const existingMint = await prisma.nFTMint.findFirst({
        where: { ticketId: existingRegistry.genesisTicket.id },
      });

      return {
        success: true,
        ticketId: existingRegistry.genesisTicket.id,
        tokenId: existingMint?.tokenId,
        txHash: existingMint?.txHash,
      };
    }

    // Get event and its first ticket tier (highest priced = VIP/best tier)
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        ticketTypes: {
          where: { isActive: true },
          orderBy: { priceCents: 'desc' }, // Get most expensive tier
          take: 1,
        },
      },
    });

    if (!event) {
      return {
        success: false,
        error: `Event ${eventId} not found`,
      };
    }

    if (event.ticketTypes.length === 0) {
      return {
        success: false,
        error: `Event ${eventId} has no active ticket types`,
      };
    }

    const ticketType = event.ticketTypes[0]; // Best/highest tier

    console.log(`[GenesisTicketService] Using tier: ${ticketType.name}`);

    // Create charge record for Genesis ticket
    const charge = await prisma.charge.create({
      data: {
        chargeId: `genesis-${eventId}-${Date.now()}`,
        eventId,
        ticketTier: ticketType.name,
        quantity: 1,
        totalPrice: 0.00,
        walletAddress: recipientAddress,
        status: 'confirmed',
        transactionHash: null, // Will be filled after minting
        mintedTokenId: null, // Will be filled after minting
      },
    });

    console.log(`[GenesisTicketService] Charge created: ${charge.chargeId}`);

    // Create ticket record with fixed Genesis seat assignment
    // Genesis tickets always get seat "GENESIS/001/001" - the first ticket for the event
    const ticket = await prisma.ticket.create({
      data: {
        eventId,
        ticketTypeId: ticketType.id,
        status: 'reserved', // Will be updated to 'minted' after NFT mint
        priceCents: 0,
        currency: 'USD',
        seatSection: 'GENESIS',  // Special section for company archive
        seatRow: '001',           // Always row 001
        seat: '001',              // Always seat 001 (first ticket)
        isGenesisTicket: true,    // Mark as Genesis Archive ticket
      },
    });

    console.log(`[GenesisTicketService] Ticket created: ${ticket.id}`);

    // Link charge to ticket
    await prisma.charge.update({
      where: { id: charge.id },
      data: {
        ticketId: ticket.id,
      },
    });

    // Mint the NFT on-chain
    console.log(`[GenesisTicketService] Minting NFT to blockchain...`);

    const mintResult = await mintTicket({
      eventId: onChainEventId, // Use on-chain event ID
      tierId: 0, // First tier (VIP/best tier is registered first)
      recipient: recipientAddress as Address,
      section: 'GENESIS',
      row: '001',
      seat: '001',
    });

    if (!mintResult.success) {
      console.error(`[GenesisTicketService] ❌ NFT minting failed:`, mintResult.error);

      // Mark ticket and charge as failed
      await prisma.$transaction([
        prisma.ticket.update({
          where: { id: ticket.id },
          data: { status: 'cancelled' },
        }),
        prisma.charge.update({
          where: { id: charge.id },
          data: {
            status: 'failed',
            mintLastError: mintResult.error,
          },
        }),
      ]);

      return {
        success: false,
        ticketId: ticket.id,
        chargeId: charge.chargeId,
        error: mintResult.error,
      };
    }

    console.log(`[GenesisTicketService] ✅ NFT minted successfully`);
    console.log(`[GenesisTicketService]    Token ID: ${mintResult.tokenId.toString()}`);
    console.log(`[GenesisTicketService]    TX Hash: ${mintResult.transactionHash}`);

    // Get or create NFT contract record
    const contractAddress = process.env.NFT_CONTRACT_ADDRESS || process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS;
    const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID) || 84532;

    const nftContract = await prisma.nFTContract.upsert({
      where: { address: contractAddress! },
      update: {},
      create: {
        chain: chainId === 84532 ? 'base-sepolia' : 'base',
        address: contractAddress!,
        name: 'Unchained Tickets',
        symbol: 'UNCHAINED',
      },
    });

    // Check if NFTMint record already exists (in case of retry)
    const existingMint = await prisma.nFTMint.findFirst({
      where: {
        contractId: nftContract.id,
        tokenId: mintResult.tokenId.toString(),
      },
    });

    // Update ticket, charge, and registry records
    await prisma.$transaction(async (tx) => {
      // Update ticket to 'minted' status
      await tx.ticket.update({
        where: { id: ticket.id },
        data: {
          status: 'minted',
        },
      });

      // Update charge with mint details
      await tx.charge.update({
        where: { id: charge.id },
        data: {
          status: 'confirmed',
          mintedTokenId: mintResult.tokenId.toString(),
          transactionHash: mintResult.transactionHash,
        },
      });

      // Only create NFTMint if it doesn't already exist
      if (!existingMint) {
        await tx.nFTMint.create({
          data: {
            ticketId: ticket.id,
            contractId: nftContract.id,
            tokenId: mintResult.tokenId.toString(),
            txHash: mintResult.transactionHash,
            mintedAt: new Date(),
          },
        });
      }

      // Link Genesis ticket to blockchain registry
      await tx.eventBlockchainRegistry.update({
        where: { eventId },
        data: {
          genesisTicketId: ticket.id,
        },
      });
    });

    console.log(`[GenesisTicketService] 🎉 Genesis Archive Ticket minted successfully!`);
    console.log(`[GenesisTicketService]    Event: ${event.title}`);
    console.log(`[GenesisTicketService]    Ticket ID: ${ticket.id}`);
    console.log(`[GenesisTicketService]    Token ID: ${mintResult.tokenId.toString()}`);
    console.log(`[GenesisTicketService]    Owner: ${recipientAddress}`);

    return {
      success: true,
      ticketId: ticket.id,
      chargeId: charge.chargeId,
      tokenId: mintResult.tokenId.toString(),
      txHash: mintResult.transactionHash,
    };
  } catch (error) {
    console.error(`[GenesisTicketService] ❌ Error minting Genesis ticket:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Reveal a Genesis ticket by marking it as USED
 *
 * This makes the collectible poster visible immediately without needing
 * to wait for the event or scan the ticket.
 */
export async function revealGenesisTicket(ticketId: string): Promise<boolean> {
  console.log(`[GenesisTicketService] 🎨 Revealing Genesis ticket ${ticketId}...`);

  try {
    // Update ticket status to 'used' so the poster reveals
    await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        status: 'used',
      },
    });

    // Create a scan record for documentation
    await prisma.ticketScan.create({
      data: {
        ticketId,
        result: 'valid',
        scannedAt: new Date(),
      },
    });

    console.log(`[GenesisTicketService] ✅ Genesis ticket revealed`);
    return true;
  } catch (error) {
    console.error(`[GenesisTicketService] ❌ Error revealing Genesis ticket:`, error);
    return false;
  }
}

/**
 * Get the Genesis ticket for an event
 */
export async function getGenesisTicketForEvent(eventId: number) {
  const registry = await prisma.eventBlockchainRegistry.findUnique({
    where: { eventId },
    include: {
      genesisTicket: {
        include: {
          event: true,
          ticketType: true,
          mints: true,
        },
      },
    },
  });

  return registry?.genesisTicket || null;
}

/**
 * Get all Genesis tickets (for company archive dashboard)
 */
export async function getAllGenesisTickets() {
  const registries = await prisma.eventBlockchainRegistry.findMany({
    where: {
      genesisTicketId: { not: null },
    },
    include: {
      event: {
        include: {
          venue: true,
          artists: {
            include: {
              artist: true,
            },
          },
        },
      },
      genesisTicket: {
        include: {
          ticketType: true,
          mints: true,
        },
      },
    },
    orderBy: {
      registeredAt: 'asc', // Oldest first (chronological company history)
    },
  });

  return registries.map(r => ({
    eventId: r.eventId,
    eventTitle: r.event.title,
    eventDate: r.event.startsAt,
    venueName: r.event.venue.name,
    artistName: r.event.artists[0]?.artist?.name || 'Unknown Artist',
    ticket: r.genesisTicket,
    onChainEventId: r.onChainEventId,
    registeredAt: r.registeredAt,
  }));
}
