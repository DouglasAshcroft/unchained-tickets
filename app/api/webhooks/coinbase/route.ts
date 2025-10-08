import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { CoinbaseCommerceService } from '@/lib/services/CoinbaseCommerceService';
import { NFTMintingService } from '@/lib/services/NFTMintingService';

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

  const mintingService = new NFTMintingService();
  const maxMintRetries = Number(process.env.MINT_MAX_RETRIES ?? '3');
  const tierId = chargeRecord.ticketTier.toLowerCase().includes('vip') ? 1 : 0;

  try {
    const { txHash, tokenId } = await mintingService.mintTicket({
      eventId: chargeRecord.eventId,
      tierId,
      recipientAddress: walletAddress,
    });

    let wallet = await prisma.wallet.findUnique({ where: { address: walletAddress } });
    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          chain: process.env.NEXT_PUBLIC_CHAIN_ID === '84532' ? 'base-sepolia' : 'base',
          address: walletAddress,
        },
      });
    }

    const contractAddress = process.env.NFT_CONTRACT_ADDRESS || process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS || '';
    const contract = await prisma.nFTContract.findFirst({ where: { address: contractAddress } });

    if (contract) {
      await prisma.nFTMint.create({
        data: {
          ticketId: ticket.id,
          contractId: contract.id,
          tokenId,
          txHash,
          mintedAt: new Date(),
          ownerWalletId: wallet.id,
        },
      });
    }

    await prisma.ticket.update({
      where: { id: ticket.id },
      data: { status: 'minted' },
    });

    await prisma.charge.update({
      where: { id: chargeRecord.id },
      data: {
        status: 'confirmed',
        transactionHash: txHash,
        mintedTokenId: tokenId,
        mintRetryCount: 0,
        mintLastError: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Minting error during webhook:', error);
    const nextRetryCount = (chargeRecord.mintRetryCount ?? 0) + 1;
    const nextStatus = nextRetryCount >= maxMintRetries ? 'failed' : 'retrying';

    await prisma.charge.update({
      where: { id: chargeRecord.id },
      data: {
        status: nextStatus,
        mintRetryCount: nextRetryCount,
        mintLastError: error instanceof Error ? error.message : 'Unknown error',
      },
    });
    return NextResponse.json({ error: 'Minting failed' }, { status: 500 });
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
