import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { UserRole } from '@prisma/client';

/**
 * Provisions dev role for wallet addresses matching DEV_WALLET_ADDRESS
 * This endpoint is called when a wallet connects to check if it should
 * be granted developer access.
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

    // Get configured dev wallet address from environment
    const devWalletAddress = process.env.DEV_WALLET_ADDRESS;

    if (!devWalletAddress) {
      return NextResponse.json(
        { error: 'DEV_WALLET_ADDRESS not configured' },
        { status: 500 }
      );
    }

    // Normalize addresses for comparison (case-insensitive)
    const normalizedDevAddress = devWalletAddress.toLowerCase();
    const normalizedRequestAddress = walletAddress.toLowerCase();

    // Verify this is the dev wallet
    if (normalizedRequestAddress !== normalizedDevAddress) {
      return NextResponse.json(
        { error: 'Wallet not authorized for dev role' },
        { status: 403 }
      );
    }

    // Find or create wallet record
    let wallet = await prisma.wallet.findUnique({
      where: { address: walletAddress },
      include: {
        users: {
          include: {
            user: true
          }
        }
      },
    });

    if (!wallet) {
      // Create wallet record
      const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID) || 8453;
      const chain = chainId === 84532 ? 'base-sepolia' : 'base';

      wallet = await prisma.wallet.create({
        data: {
          address: walletAddress,
          chain,
        },
        include: {
          users: {
            include: {
              user: true
            }
          }
        },
      });
    }

    // Check if user exists and has correct role
    const userWallet = wallet.users.find(uw => uw.isPrimary) || wallet.users[0];

    if (userWallet) {
      const user = userWallet.user;

      if (user.role === UserRole.dev) {
        // Already has dev role
        return NextResponse.json({
          alreadyDev: true,
          message: 'User already has dev role',
        });
      }

      // Upgrade existing user to dev role
      await prisma.user.update({
        where: { id: user.id },
        data: { role: UserRole.dev },
      });

      return NextResponse.json({
        upgraded: true,
        message: 'User upgraded to dev role',
        userId: user.id,
      });
    }

    // No user exists for this wallet - create one with dev role
    const newUser = await prisma.user.create({
      data: {
        email: `dev+${walletAddress.slice(0, 8)}@unchained.local`,
        name: 'Developer',
        role: UserRole.dev,
      },
    });

    // Link wallet to user
    await prisma.userWallet.create({
      data: {
        userId: newUser.id,
        walletId: wallet.id,
        isPrimary: true,
      },
    });

    return NextResponse.json({
      created: true,
      message: 'Dev user created',
      userId: newUser.id,
    });
  } catch (error) {
    console.error('Error provisioning dev role:', error);
    return NextResponse.json(
      {
        error: 'Failed to provision dev role',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
