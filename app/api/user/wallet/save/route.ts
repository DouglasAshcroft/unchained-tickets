import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/utils/auth';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';

const SaveWalletSchema = z.object({
  walletAddress: z.string().min(1, 'Wallet address is required'),
  chain: z.string().default('base'),
  isPrimary: z.boolean().default(true),
  provider: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request);
    const userId = authUser.id;
    const body = await request.json();

    // Validate request
    const validation = SaveWalletSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { walletAddress, chain, isPrimary, provider } = validation.data;

    // Normalize wallet address (lowercase for consistency)
    const normalizedAddress = walletAddress.toLowerCase();

    // Check if wallet already exists
    let wallet = await prisma.wallet.findUnique({
      where: { address: normalizedAddress },
    });

    // Create wallet if it doesn't exist
    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          address: normalizedAddress,
          chain,
        },
      });
    }

    // Check if user already has this wallet linked
    const existingUserWallet = await prisma.userWallet.findUnique({
      where: {
        userId_walletId: {
          userId,
          walletId: wallet.id,
        },
      },
    });

    if (existingUserWallet) {
      // Update isPrimary if different
      if (existingUserWallet.isPrimary !== isPrimary) {
        // If setting as primary, remove primary from other wallets
        if (isPrimary) {
          await prisma.userWallet.updateMany({
            where: { userId, isPrimary: true },
            data: { isPrimary: false },
          });
        }

        await prisma.userWallet.update({
          where: {
            userId_walletId: {
              userId,
              walletId: wallet.id,
            },
          },
          data: { isPrimary },
        });
      }

      return NextResponse.json({
        success: true,
        wallet: {
          address: wallet.address,
          chain: wallet.chain,
          isPrimary,
        },
        message: 'Wallet already linked',
      });
    }

    // If setting as primary, remove primary from other wallets
    if (isPrimary) {
      await prisma.userWallet.updateMany({
        where: { userId, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    // Link wallet to user
    await prisma.userWallet.create({
      data: {
        userId,
        walletId: wallet.id,
        isPrimary,
      },
    });

    // Update User.walletAddress and walletProvider if this is primary
    if (isPrimary) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          walletAddress: normalizedAddress,
          walletProvider: provider || 'unknown',
        },
      });
    }

    return NextResponse.json({
      success: true,
      wallet: {
        address: wallet.address,
        chain: wallet.chain,
        isPrimary,
      },
    });
  } catch (error) {
    console.error('Error saving wallet:', error);
    return NextResponse.json(
      { error: 'Failed to save wallet' },
      { status: 500 }
    );
  }
}
