import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { authService } from '@/lib/services/AuthService';

/**
 * Wallet-based authentication endpoint
 * Allows users to log in using their connected wallet address
 * without requiring email/password credentials.
 *
 * This is used for:
 * - Dev role auto-login after provisioning
 * - Wallet-only users who don't have password credentials
 * - Seamless Web3 authentication flow
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress } = body;

    if (!walletAddress || typeof walletAddress !== 'string') {
      return NextResponse.json(
        { error: 'walletAddress is required' },
        { status: 400 }
      );
    }

    // Find wallet and associated user
    const wallet = await prisma.wallet.findUnique({
      where: { address: walletAddress },
      include: {
        users: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!wallet || wallet.users.length === 0) {
      return NextResponse.json(
        { error: 'No user found for this wallet address' },
        { status: 404 }
      );
    }

    // Get the primary wallet or first wallet
    const userWallet = wallet.users.find(uw => uw.isPrimary) || wallet.users[0];
    const user = userWallet.user;

    // Generate JWT token
    const token = authService.generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Wallet login error:', error);
    return NextResponse.json(
      {
        error: 'Failed to authenticate with wallet',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
