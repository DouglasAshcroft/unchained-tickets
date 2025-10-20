import { NextRequest, NextResponse } from 'next/server';
import { getCoinbaseOnrampService } from '@/lib/services/CoinbaseOnrampService';
import { z } from 'zod';

// Request validation schema
const SessionRequestSchema = z.object({
  walletAddress: z.string().min(1, 'Wallet address is required'),
  eventId: z.number().int().positive(),
  ticketTier: z.string().min(1),
  quantity: z.number().int().positive().max(8),
  totalPrice: z.number().positive(),
  email: z.string().email('Valid email is required'),
});

type SessionRequest = z.infer<typeof SessionRequestSchema>;

/**
 * POST /api/onramp/session
 *
 * Generate a secure Coinbase Onramp session token for fiat-to-crypto onboarding
 *
 * Required for production Coinbase Onramp (session tokens mandatory after July 31, 2025)
 *
 * @param walletAddress - Destination wallet address for USDC
 * @param eventId - Event ID for the ticket purchase
 * @param ticketTier - Ticket tier name
 * @param quantity - Number of tickets
 * @param totalPrice - Total ticket price in USD
 * @param email - User email (required for account creation and recovery)
 *
 * @returns sessionToken, expiresAt, fundingAmount (may exceed ticket price if below minimum)
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json().catch(() => ({}));
    const validation = SessionRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid request parameters',
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const { walletAddress, totalPrice, email }: SessionRequest = validation.data;

    // Initialize Coinbase Onramp service
    const onrampService = getCoinbaseOnrampService();

    // Check if service is properly configured
    if (!onrampService.isConfigured()) {
      return NextResponse.json(
        {
          error: 'Coinbase Onramp is not properly configured',
          details: 'CDP API credentials are missing. Please contact support.',
        },
        { status: 500 }
      );
    }

    // Check if onramp is enabled
    if (!onrampService.isEnabled()) {
      return NextResponse.json(
        {
          error: 'Coinbase Onramp is currently disabled',
          details: 'Please use an alternative payment method.',
        },
        { status: 503 }
      );
    }

    // Calculate funding amount (may be higher than ticket price if below minimum)
    const funding = onrampService.calculateFundingAmount(totalPrice);

    // Extract real client IP for security/compliance
    // Coinbase requires the actual end-user IP, not proxy IPs
    const clientIp =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      request.headers.get('cf-connecting-ip') || // Cloudflare
      '127.0.0.1';

    // Validate IP address
    if (clientIp === '127.0.0.1' || clientIp === 'localhost') {
      console.warn(
        '⚠️  Using localhost IP for onramp session. This may cause issues in production. Ensure proper IP forwarding is configured.'
      );
    }

    // Create session token via Coinbase CDP API
    const session = await onrampService.createSession({
      walletAddress,
      clientIp,
      presetFiatAmount: funding.fundingAmount,
      assetSymbol: 'USDC',
      blockchain: 'base',
      partnerUserId: email, // Use email as partner user ID for tracking
    });

    // Log session creation for monitoring
    console.log('Onramp session created:', {
      walletAddress: `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
      email,
      fundingAmount: funding.fundingAmount,
      ticketCharge: funding.ticketCharge,
      belowMinimum: funding.belowMinimum,
      clientIp,
      expiresAt: session.expiresAt,
    });

    return NextResponse.json(
      {
        sessionToken: session.token,
        expiresAt: session.expiresAt,
        fundingAmount: funding.fundingAmount,
        ticketPrice: funding.ticketCharge,
        remainder: funding.remainder,
        belowMinimum: funding.belowMinimum,
        minimumRequired: onrampService.getMinimumPurchaseAmount(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error creating Coinbase Onramp session:', error);

    // Provide helpful error messages
    if (error instanceof Error) {
      if (error.message.includes('CDP API credentials')) {
        return NextResponse.json(
          {
            error: 'Configuration error',
            details: 'Coinbase Onramp is not properly configured. Please contact support.',
          },
          { status: 500 }
        );
      }

      if (error.message.includes('401') || error.message.includes('403')) {
        return NextResponse.json(
          {
            error: 'Authentication failed',
            details: 'Invalid API credentials. Please contact support.',
          },
          { status: 500 }
        );
      }

      if (error.message.includes('429')) {
        return NextResponse.json(
          {
            error: 'Rate limit exceeded',
            details: 'Too many requests. Please try again in a moment.',
          },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      {
        error: 'Failed to create onramp session',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
