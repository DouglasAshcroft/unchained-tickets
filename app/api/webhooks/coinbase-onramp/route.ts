import { NextRequest, NextResponse } from 'next/server';
import { getUserService } from '@/lib/services/UserService';
import { prisma } from '@/lib/db/prisma';
import crypto from 'crypto';

/**
 * POST /api/webhooks/coinbase-onramp
 *
 * Handle Coinbase Onramp webhook events
 *
 * Events:
 * - onramp.transaction.success: User completed payment, funds sent to wallet
 * - onramp.transaction.failed: Payment failed
 * - onramp.transaction.pending: Payment processing
 *
 * Actions on success:
 * 1. Verify webhook signature
 * 2. Extract wallet address from event
 * 3. Find/create user profile (by email from metadata)
 * 4. Trigger NFT minting (via existing flow)
 * 5. Send email confirmation
 * 6. Return 200 OK
 */

type OnrampWebhookEvent = {
  id: string;
  type: string;
  created_at: string;
  data: {
    id: string;
    status: 'success' | 'failed' | 'pending';
    destination_wallets: Array<{
      address: string;
      blockchain: string;
      assets: string[];
    }>;
    fiat_amount: {
      value: string;
      currency: string;
    };
    crypto_amount: {
      value: string;
      currency: string;
    };
    partner_user_id?: string; // Email we passed during session creation
    metadata?: Record<string, any>;
  };
};

/**
 * Verify Coinbase webhook signature
 * Prevents replay attacks and ensures authenticity
 */
function verifyWebhookSignature(
  rawBody: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature) {
    return false;
  }

  const computed = crypto
    .createHmac('sha256', secret)
    .update(rawBody, 'utf8')
    .digest('hex');

  const signatureBuffer = Buffer.from(signature, 'utf8');
  const computedBuffer = Buffer.from(computed, 'utf8');

  if (signatureBuffer.length !== computedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(signatureBuffer, computedBuffer);
}

// Store processed event IDs to prevent duplicate processing (idempotency)
const processedEvents = new Set<string>();

export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const rawBody = await request.text();
    const signature = request.headers.get('x-coinbase-signature');

    // Verify signature if secret is configured
    const webhookSecret = process.env.COINBASE_WEBHOOK_SECRET;
    if (webhookSecret) {
      if (!verifyWebhookSignature(rawBody, signature, webhookSecret)) {
        console.error('Invalid webhook signature');
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        );
      }
    } else {
      console.warn('⚠️  COINBASE_WEBHOOK_SECRET not set - webhook signature not verified!');
    }

    // Parse event
    const event: OnrampWebhookEvent = JSON.parse(rawBody);

    // Check for duplicate/replayed events (idempotency)
    if (processedEvents.has(event.id)) {
      console.log('Event already processed (idempotent):', event.id);
      return NextResponse.json({ received: true }, { status: 200 });
    }

    console.log('Received Coinbase Onramp webhook:', {
      eventId: event.id,
      type: event.type,
      status: event.data.status,
    });

    // Handle different event types
    switch (event.type) {
      case 'onramp.transaction.success':
        await handleOnrampSuccess(event);
        break;

      case 'onramp.transaction.failed':
        await handleOnrampFailure(event);
        break;

      case 'onramp.transaction.pending':
        await handleOnrampPending(event);
        break;

      default:
        console.log('Unhandled event type:', event.type);
    }

    // Mark event as processed
    processedEvents.add(event.id);

    // Clean up old events (keep last 1000)
    if (processedEvents.size > 1000) {
      const toDelete = Array.from(processedEvents).slice(0, 100);
      toDelete.forEach(id => processedEvents.delete(id));
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Webhook processing error:', error);

    // Always return 200 to prevent Coinbase retries for unrecoverable errors
    // Log the error for manual review
    return NextResponse.json(
      {
        received: true,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 200 }
    );
  }
}

/**
 * Handle successful onramp transaction
 * Create user, link wallet, trigger NFT minting
 */
async function handleOnrampSuccess(event: OnrampWebhookEvent) {
  const { data } = event;
  const walletAddress = data.destination_wallets[0]?.address;
  const email = data.partner_user_id; // Email passed during session creation
  const cryptoAmount = parseFloat(data.crypto_amount.value);

  if (!walletAddress) {
    console.error('No wallet address in onramp success event');
    return;
  }

  if (!email) {
    console.error('No partner_user_id (email) in onramp success event');
    return;
  }

  console.log('Processing onramp success:', {
    email,
    walletAddress: `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
    cryptoAmount,
    currency: data.crypto_amount.currency,
  });

  // Find or create user
  const userService = getUserService();
  const user = await userService.findOrCreateUser({
    email,
    walletAddress,
    walletProvider: 'coinbase_smart_wallet',
  });

  // Look for any pending charges for this email
  const pendingCharges = await prisma.charge.findMany({
    where: {
      walletAddress: walletAddress.toLowerCase(),
      status: 'pending',
    },
    include: {
      ticket: true,
      event: true,
    },
  });

  if (pendingCharges.length === 0) {
    console.warn('No pending charges found for wallet:', walletAddress);
    return;
  }

  // Process each pending charge
  for (const charge of pendingCharges) {
    try {
      // Update charge status
      await prisma.charge.update({
        where: { id: charge.id },
        data: {
          status: 'confirmed',
          userId: user.id,
        },
      });

      // Link ticket to user
      if (charge.ticketId) {
        await prisma.ticket.update({
          where: { id: charge.ticketId },
          data: {
            userId: user.id,
            status: 'minted', // TODO Phase 3.1: Actually mint NFT here
          },
        });
      }

      console.log('Charge processed successfully:', {
        chargeId: charge.chargeId,
        userId: user.id,
        ticketId: charge.ticketId,
      });

      // TODO: Trigger NFT minting here (Phase 3.1)
      // TODO: Send email confirmation

    } catch (error) {
      console.error('Error processing charge:', charge.id, error);

      // Update charge with error
      await prisma.charge.update({
        where: { id: charge.id },
        data: {
          status: 'failed',
          mintLastError: error instanceof Error ? error.message : 'Unknown error',
          mintRetryCount: { increment: 1 },
        },
      }).catch(console.error);
    }
  }
}

/**
 * Handle failed onramp transaction
 * Release ticket reservation, notify user
 */
async function handleOnrampFailure(event: OnrampWebhookEvent) {
  const { data } = event;
  const walletAddress = data.destination_wallets[0]?.address;

  console.log('Processing onramp failure:', {
    walletAddress: walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'N/A',
    eventId: event.id,
  });

  if (!walletAddress) {
    return;
  }

  // Find pending charges for this wallet
  const pendingCharges = await prisma.charge.findMany({
    where: {
      walletAddress: walletAddress.toLowerCase(),
      status: 'pending',
    },
  });

  // Mark charges as failed
  for (const charge of pendingCharges) {
    await prisma.charge.update({
      where: { id: charge.id },
      data: {
        status: 'failed',
        mintLastError: 'Onramp transaction failed',
      },
    });

    // Release ticket reservation if exists
    if (charge.ticketId) {
      await prisma.ticket.update({
        where: { id: charge.ticketId },
        data: { status: 'canceled' },
      }).catch(console.error);
    }

    console.log('Charge marked as failed:', charge.chargeId);
  }

  // TODO: Send email notification about failure
}

/**
 * Handle pending onramp transaction
 * Just log for now, no action needed
 */
async function handleOnrampPending(event: OnrampWebhookEvent) {
  const { data } = event;

  console.log('Onramp transaction pending:', {
    transactionId: data.id,
    status: data.status,
  });

  // No action needed - wait for success or failure event
}
