import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { CoinbaseCommerceService } from '@/lib/services/CoinbaseCommerceService';
import { mintTicket } from '@/lib/services/NFTMintingService';
import type { Address } from 'viem';

async function handleChargeConfirmed(event: any) {
  const chargeId = event.data?.id as string | undefined;
  if (!chargeId) {
    return NextResponse.json({ error: 'Missing charge id' }, { status: 400 });
  }

  const chargeRecord = await prisma.charge.findUnique({
    where: { chargeId },
  });

  if (!chargeRecord) {
    console.warn(`Charge ${chargeId} not found`);
    return NextResponse.json({ success: true });
  }

  if (chargeRecord.status === 'confirmed') {
    return NextResponse.json({ success: true });
  }

  const ticket = chargeRecord.ticketId
    ? await prisma.ticket.findUnique({ where: { id: chargeRecord.ticketId } })
    : null;

  const walletAddress = chargeRecord.walletAddress;

  if (!ticket || !walletAddress) {
    await prisma.charge.update({
      where: { id: chargeRecord.id },
      data: { status: 'confirmed', mintRetryCount: 0, mintLastError: null },
    });
    return NextResponse.json({ success: true });
  }

  if (chargeRecord.mintedTokenId) {
    await prisma.charge.update({
      where: { id: chargeRecord.id },
      data: { status: 'confirmed', mintRetryCount: 0, mintLastError: null },
    });
    return NextResponse.json({ success: true });
  }

  // Mint NFT ticket
  console.log('[Webhook] Attempting to mint NFT for ticket:', ticket.id);

  try {
    // Get ticket details with relations
    const ticketWithDetails = await prisma.ticket.findUnique({
      where: { id: ticket.id },
      include: {
        event: true,
        ticketType: true,
      },
    });

    if (!ticketWithDetails) {
      throw new Error('Ticket not found with details');
    }

    // Mint the NFT
    const mintResult = await mintTicket({
      eventId: ticketWithDetails.eventId,
      tierId: ticketWithDetails.ticketTypeId || 0, // Default to 0 if no tier
      recipient: walletAddress as Address,
      section: ticketWithDetails.seatSection || '',
      row: ticketWithDetails.seatRow || '',
      seat: ticketWithDetails.seat || '',
    });

    if (!mintResult.success) {
      console.error('[Webhook] Minting failed:', mintResult.error);

      // Update charge with error and increment retry count
      await prisma.charge.update({
        where: { id: chargeRecord.id },
        data: {
          status: 'confirmed',
          mintRetryCount: (chargeRecord.mintRetryCount || 0) + 1,
          mintLastError: mintResult.error || 'Unknown minting error',
        },
      });

      return NextResponse.json({
        success: true,
        warning: 'Payment confirmed but NFT minting failed',
        error: mintResult.error,
      });
    }

    // Update charge with mint details
    await prisma.charge.update({
      where: { id: chargeRecord.id },
      data: {
        status: 'confirmed',
        mintedTokenId: mintResult.tokenId.toString(),
        transactionHash: mintResult.transactionHash,
        mintRetryCount: 0,
        mintLastError: null,
      },
    });

    console.log('[Webhook] Successfully minted NFT:', {
      tokenId: mintResult.tokenId.toString(),
      transactionHash: mintResult.transactionHash,
    });

    return NextResponse.json({
      success: true,
      tokenId: mintResult.tokenId.toString(),
      transactionHash: mintResult.transactionHash,
    });
  } catch (error) {
    console.error('[Webhook] Minting error:', error);

    // Update charge with error
    await prisma.charge.update({
      where: { id: chargeRecord.id },
      data: {
        status: 'confirmed',
        mintRetryCount: (chargeRecord.mintRetryCount || 0) + 1,
        mintLastError: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    return NextResponse.json({
      success: true,
      warning: 'Payment confirmed but NFT minting encountered an error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

async function handleChargeFailure(event: any) {
  const chargeId = event.data?.id as string | undefined;
  if (!chargeId) {
    return NextResponse.json({ error: 'Missing charge id' }, { status: 400 });
  }

  await prisma.charge.updateMany({
    where: { chargeId },
    data: { status: 'failed', mintLastError: null },
  });

  return NextResponse.json({ success: true });
}

async function handleChargeDelayed(event: any) {
  const chargeId = event.data?.id as string | undefined;
  if (!chargeId) {
    return NextResponse.json({ error: 'Missing charge id' }, { status: 400 });
  }

  await prisma.charge.updateMany({
    where: { chargeId },
    data: { status: 'delayed' },
  });

  return NextResponse.json({ success: true });
}

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-cc-webhook-signature');
    const rawBody = await request.text();

    const isValid = CoinbaseCommerceService.verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(rawBody);

    switch (event.type) {
      case 'charge:confirmed':
        return await handleChargeConfirmed(event);
      case 'charge:failed':
        return await handleChargeFailure(event);
      case 'charge:delayed':
        return await handleChargeDelayed(event);
      default:
        return NextResponse.json({ success: true, ignored: event.type });
    }
  } catch (error) {
    console.error('Coinbase webhook error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({ success: true });
}
