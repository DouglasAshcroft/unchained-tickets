import { prisma } from '@/lib/db/prisma';
import { User, Prisma } from '@prisma/client';

/**
 * User Service
 * Handles user creation and management, especially for onramp-created users
 */

export type CreateUserFromOnrampParams = {
  email: string;
  walletAddress: string;
  eventId?: number;
  ticketId?: string;
};

export type FindOrCreateUserParams = {
  email: string;
  walletAddress?: string;
  walletProvider?: string;
  name?: string;
};

export class UserService {
  /**
   * Create a new user from Coinbase Onramp flow
   * Links the user to a ticket if provided
   *
   * @param params User creation parameters
   * @returns Created or updated user
   */
  async createUserFromOnramp(params: CreateUserFromOnrampParams): Promise<User> {
    const { email, walletAddress, ticketId } = params;

    // Check if user exists by email
    let user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          walletAddress,
          walletProvider: 'coinbase_smart_wallet',
          createdViaOnramp: true,
          onboardingComplete: false,
          emailVerified: false,
          role: 'fan',
        },
      });

      console.log('Created new user from onramp:', {
        userId: user.id,
        email: user.email,
        walletAddress: `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
      });
    } else if (!user.walletAddress) {
      // Existing user without wallet - add wallet
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          walletAddress,
          walletProvider: 'coinbase_smart_wallet',
        },
      });

      console.log('Added wallet to existing user:', {
        userId: user.id,
        email: user.email,
        walletAddress: `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
      });
    } else if (user.walletAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      // User already has a different wallet - this is unusual
      console.warn('User already has a different wallet:', {
        userId: user.id,
        email: user.email,
        existingWallet: `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`,
        newWallet: `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
      });

      // Don't update - keep their original wallet
    }

    // Link ticket to user if provided
    if (ticketId) {
      await prisma.ticket.update({
        where: { id: ticketId },
        data: { userId: user.id },
      });

      console.log('Linked ticket to user:', {
        userId: user.id,
        ticketId,
      });
    }

    return user;
  }

  /**
   * Find existing user or create new one
   * More flexible than createUserFromOnramp
   *
   * @param params User lookup/creation parameters
   * @returns Found or created user
   */
  async findOrCreateUser(params: FindOrCreateUserParams): Promise<User> {
    const { email, walletAddress, walletProvider, name } = params;

    // Try to find by email first
    if (email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (existingUser) {
        // Update wallet if provided and user doesn't have one
        if (walletAddress && !existingUser.walletAddress) {
          return await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              walletAddress,
              walletProvider: walletProvider || 'external',
            },
          });
        }

        return existingUser;
      }
    }

    // Try to find by wallet address
    if (walletAddress) {
      const existingUser = await prisma.user.findUnique({
        where: { walletAddress: walletAddress.toLowerCase() },
      });

      if (existingUser) {
        // Update email if provided and user doesn't have one
        if (email && !existingUser.email) {
          return await prisma.user.update({
            where: { id: existingUser.id },
            data: { email: email.toLowerCase() },
          });
        }

        return existingUser;
      }
    }

    // Create new user
    const userData: Prisma.UserCreateInput = {
      email: email?.toLowerCase(),
      walletAddress: walletAddress?.toLowerCase(),
      walletProvider: walletProvider || (walletAddress ? 'external' : undefined),
      name,
      role: 'fan',
      onboardingComplete: false,
    };

    return await prisma.user.create({
      data: userData,
    });
  }

  /**
   * Update user's onboarding status
   *
   * @param userId User ID
   * @param complete Whether onboarding is complete
   */
  async updateOnboardingStatus(userId: number, complete: boolean): Promise<User> {
    return await prisma.user.update({
      where: { id: userId },
      data: { onboardingComplete: complete },
    });
  }

  /**
   * Verify user's email
   *
   * @param userId User ID
   */
  async verifyEmail(userId: number): Promise<User> {
    return await prisma.user.update({
      where: { id: userId },
      data: { emailVerified: true },
    });
  }

  /**
   * Get user by email
   *
   * @param email User email
   */
  async getUserByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  /**
   * Get user by wallet address
   *
   * @param walletAddress Wallet address
   */
  async getUserByWallet(walletAddress: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { walletAddress: walletAddress.toLowerCase() },
    });
  }

  /**
   * Check if user needs onboarding
   *
   * @param userId User ID
   */
  async needsOnboarding(userId: number): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { onboardingComplete: true, createdViaOnramp: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Users created via onramp who haven't completed onboarding
    return user.createdViaOnramp && !user.onboardingComplete;
  }
}

// Singleton instance
let userServiceInstance: UserService | null = null;

/**
 * Get or create UserService singleton
 */
export function getUserService(): UserService {
  if (!userServiceInstance) {
    userServiceInstance = new UserService();
  }
  return userServiceInstance;
}
