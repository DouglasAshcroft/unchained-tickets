import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
// import { consumePerk } from '@/lib/services/NFTMintingService'; // TODO: Add consumePerk to NFTMintingService

const RedeemPerkSchema = z.object({
  ticketId: z.string(),
  walletAddress: z.string(),
  ticketPerkId: z.number().int().positive(),
  quantity: z.number().int().positive().optional().default(1),
});

/**
 * POST /api/perks/redeem
 *
 * Redeems a perk for a ticket holder
 * Calls the smart contract's consumePerk function
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ticketId, walletAddress, ticketPerkId, quantity } = RedeemPerkSchema.parse(body);

    console.log('[Perk Redeem] Request:', { ticketId, walletAddress, ticketPerkId, quantity });

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        ticketType: {
          include: {
            perks: true,
          },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    if (!ticket.ticketType) {
      return NextResponse.json(
        { error: 'Ticket type not assigned, cannot redeem perks' },
        { status: 400 }
      );
    }

    const ticketPerk = ticket.ticketType.perks.find((perk) => perk.id === ticketPerkId);

    if (!ticketPerk) {
      return NextResponse.json(
        { error: 'Perk not found for this ticket type' },
        { status: 404 }
      );
    }

    const redemption = await prisma.ticketPerkRedemption.upsert({
      where: {
        ticketId_ticketPerkId: {
          ticketId,
          ticketPerkId,
        },
      },
      update: {},
      create: {
        ticketId,
        ticketPerkId,
      },
    });

    const nextRedeemedQuantity = redemption.redeemedQuantity + quantity;

    if (nextRedeemedQuantity > ticketPerk.quantity) {
      return NextResponse.json(
        {
          error: 'Cannot redeem more than the allotted quantity',
          redeemedQuantity: redemption.redeemedQuantity,
          remainingQuantity: Math.max(ticketPerk.quantity - redemption.redeemedQuantity, 0),
        },
        { status: 400 }
      );
    }

    const updated = await prisma.ticketPerkRedemption.update({
      where: {
        ticketId_ticketPerkId: {
          ticketId,
          ticketPerkId,
        },
      },
      data: {
        redeemedQuantity: nextRedeemedQuantity,
        lastRedeemedAt: new Date(),
      },
      include: {
        perk: true,
      },
    });

    // TODO: In production, call consumePerk on-chain and persist tx hash

    console.log('[Perk Redeem] Success', {
      ticketId,
      ticketPerkId,
      redeemedQuantity: updated.redeemedQuantity,
    });

    return NextResponse.json({
      success: true,
      ticketId,
      ticketPerkId,
      redeemedQuantity: updated.redeemedQuantity,
      remainingQuantity: Math.max(updated.perk.quantity - updated.redeemedQuantity, 0),
      quantity,
      message: `${updated.perk.name} redeemed successfully`,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request format', details: error.issues },
        { status: 400 }
      );
    }

    console.error('[Perk Redeem] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
