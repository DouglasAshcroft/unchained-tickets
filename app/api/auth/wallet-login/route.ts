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

    let user;
    let isNewUser = false;

    if (!wallet || wallet.users.length === 0) {
      // Auto-create user for new wallet (Base-style one-wallet sign-in)
      const newUser = await prisma.user.create({
        data: {
          email: `${walletAddress.toLowerCase()}@wallet.unchained`,
          name: null,
          role: 'fan',
          walletAddress: walletAddress,
          walletProvider: 'unknown',
        },
      });

      // Create wallet record
      await prisma.wallet.create({
        data: {
          address: walletAddress,
          chain: 'base',
          users: {
            create: {
              userId: newUser.id,
              isPrimary: true,
            },
          },
        },
      });

      user = newUser;
      isNewUser = true;
    } else {
      // Existing wallet - get user
      const userWallet = wallet.users.find(uw => uw.isPrimary) || wallet.users[0];
      user = userWallet.user;
    }

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
      isNewUser,
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
