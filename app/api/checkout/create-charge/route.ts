import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
// TODO: Rewrite NFTMintingService to use viem instead of ethers
// import { NFTMintingService } from '@/lib/services/NFTMintingService';
import { getCoinbaseCommerceService } from '@/lib/services/CoinbaseCommerceService';

function toDecimal(value: number): Prisma.Decimal {
  return new Prisma.Decimal(value.toFixed(2));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventId, ticketTier, quantity, totalPrice, walletAddress } = body;

    if (!eventId || !ticketTier || !quantity || quantity <= 0 || !totalPrice) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { venue: true },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true';
    const perTicketPriceCents = Math.round((Number(totalPrice) / Number(quantity)) * 100);

    const ticket = await prisma.ticket.create({
      data: {
        eventId,
        userId: null,
        qrHash: `charge-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        priceCents: Number.isFinite(perTicketPriceCents) ? perTicketPriceCents : null,
        currency: 'USD',
        status: 'reserved',
      },
    });

    const totalPriceDecimal = toDecimal(Number(totalPrice));
    const rpcUrl = process.env.BASE_RPC_URL || process.env.NEXT_PUBLIC_BASE_RPC_URL;
    const mintingPrivateKey = process.env.MINTING_PRIVATE_KEY || process.env.MINTING_WALLET_PRIVATE_KEY;
    const mintingContractAddress = process.env.NFT_CONTRACT_ADDRESS || process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS;
    const canMintOnChain = Boolean(rpcUrl && mintingPrivateKey && mintingContractAddress);
    // Unused during Phase 1, will be needed in Phase 3.1 for NFT minting
    // const _maxMintRetries = Number(process.env.MINT_MAX_RETRIES ?? '3');

    if (isDevMode) {
      const chargeId = `mock-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

      await prisma.charge.create({
        data: {
          chargeId,
          eventId,
          ticketId: ticket.id,
          ticketTier,
          quantity,
          totalPrice: totalPriceDecimal,
          status: 'pending',
          walletAddress,
          mintRetryCount: 0,
          mintLastError: null,
        },
      });

      // TODO Phase 3.1: Reimplement NFT minting with viem/wagmi
      if (walletAddress && canMintOnChain) {
        console.warn('⚠️ NFT minting temporarily disabled during Phase 1. Will be reimplemented with viem in Phase 3.1');
      }

      if (walletAddress && !canMintOnChain) {
        console.warn('⚠️ Minting skipped: configure BASE_RPC_URL, MINTING_PRIVATE_KEY, and NFT_CONTRACT_ADDRESS to enable dev minting.');
      }

      return NextResponse.json({
        chargeId,
        ticketId: ticket.id,
        status: walletAddress ? 'pending-mint' : 'pending-wallet',
        message: 'Mock charge created. Configure minting credentials to enable on-chain minting in dev mode.',
      });
    }

    try {
      const commerce = getCoinbaseCommerceService();
      const amountString = totalPriceDecimal.toString();
      const charge = await commerce.createCharge({
        name: `${event.title} Ticket`,
        description: `Event on ${new Date(event.startsAt).toLocaleDateString()}`,
        localPrice: {
          amount: amountString,
          currency: 'USD',
        },
        metadata: {
          ticketId: ticket.id,
          eventId,
          ticketTier,
          quantity,
          walletAddress,
        },
      });

      await prisma.charge.create({
        data: {
          chargeId: charge.id,
          eventId,
          ticketId: ticket.id,
          ticketTier,
          quantity,
          totalPrice: totalPriceDecimal,
          status: 'pending',
          walletAddress,
          mintRetryCount: 0,
          mintLastError: null,
        },
      });

      return NextResponse.json(
        {
          chargeId: charge.id,
          ticketId: ticket.id,
          hostedUrl: charge.hosted_url,
          status: 'pending',
        },
        { status: 201 }
      );
    } catch (error) {
      console.error('Charge creation error:', error);
      return NextResponse.json(
        {
          error: 'Failed to create charge',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in create-charge:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
