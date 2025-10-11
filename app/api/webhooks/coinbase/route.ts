import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { CoinbaseCommerceService } from '@/lib/services/CoinbaseCommerceService';
// TODO Phase 3.1: Reimplement NFT minting with viem
// import { NFTMintingService } from '@/lib/services/NFTMintingService';

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

  // TODO Phase 3.1: Reimplement NFT minting with viem/wagmi
  console.warn('⚠️ NFT minting temporarily disabled during Phase 1. Will be reimplemented in Phase 3.1');

  // Mark charge as confirmed without minting for now
  await prisma.charge.update({
    where: { id: chargeRecord.id },
    data: {
      status: 'confirmed',
      mintRetryCount: 0,
      mintLastError: 'Minting temporarily disabled - awaiting Phase 3.1 implementation',
    },
  });

  return NextResponse.json({
    success: true,
    warning: 'Payment confirmed but NFT minting is temporarily disabled'
  });
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
