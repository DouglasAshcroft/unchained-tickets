/**
 * Advocacy Service
 *
 * Core business logic for advocacy system
 */

import { prisma } from '@/lib/prisma';
import { calculateTier, getNextTierProgress } from '@/lib/config/advocacyTiers';
import { emailService } from './EmailService';
import type { AdvocacySubmission, AdvocacyStats, LeaderboardEntry } from '@/lib/types/advocacy';

export class AdvocacyService {
  /**
   * Submit advocacy request
   */
  async submitAdvocacy(submission: AdvocacySubmission): Promise<{ success: boolean; advocacyId: number }> {
    // Get event details
    const event = await prisma.event.findUnique({
      where: { id: submission.eventId },
      include: { venue: true },
    });

    if (!event) {
      throw new Error('Event not found');
    }

    // Create advocacy request
    const advocacyRequest = await prisma.advocacyRequest.create({
      data: {
        email: submission.email.toLowerCase(),
        eventId: submission.eventId,
        venueName: event.venue.name,
        venueEmail: event.venueContactEmail,
        userMessage: submission.userMessage || null,
        emailSent: false,
      },
    });

    // Increment event advocacy count
    await prisma.event.update({
      where: { id: submission.eventId },
      data: {
        advocacyCount: { increment: 1 },
      },
    });

    // Create or update waitlist signup
    let waitlistSignup = await prisma.waitlistSignup.findUnique({
      where: { email: submission.email.toLowerCase() },
    });

    if (!waitlistSignup) {
      // Create new waitlist entry
      waitlistSignup = await prisma.waitlistSignup.create({
        data: {
          email: submission.email.toLowerCase(),
          referralCode: this.generateReferralCode(),
          advocacyCount: 1,
          totalVenuesReached: 1,
          currentTier: 'starter',
          confirmedAt: new Date(),
        },
      });
    } else {
      // Update existing entry
      const newAdvocacyCount = waitlistSignup.advocacyCount + 1;
      const newTier = calculateTier(newAdvocacyCount);

      await prisma.waitlistSignup.update({
        where: { email: submission.email.toLowerCase() },
        data: {
          advocacyCount: newAdvocacyCount,
          totalVenuesReached: { increment: 1 },
          currentTier: newTier.id,
        },
      });
    }

    // Queue email for sending (handled by batch job or immediately)
    // In production, this would trigger an email queue
    // For now, send immediately
    try {
      await emailService.sendAdvocacyEmail(advocacyRequest.id);
    } catch (error) {
      console.error('Failed to send advocacy email:', error);
      // Don't fail the request if email fails
    }

    return {
      success: true,
      advocacyId: advocacyRequest.id,
    };
  }

  /**
   * Get advocacy stats for a user
   */
  async getAdvocacyStats(email: string): Promise<AdvocacyStats | null> {
    const waitlistSignup = await prisma.waitlistSignup.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        advocacyRequests: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            event: {
              include: {
                venue: true,
              },
            },
          },
        },
      },
    });

    if (!waitlistSignup) {
      return null;
    }

    const tierProgress = getNextTierProgress(waitlistSignup.advocacyCount);

    return {
      email: waitlistSignup.email,
      advocacyCount: waitlistSignup.advocacyCount,
      totalVenuesReached: waitlistSignup.totalVenuesReached,
      currentTier: waitlistSignup.currentTier,
      tierProgress: {
        current: tierProgress.current.title,
        next: tierProgress.next?.title || null,
        progress: tierProgress.progress,
        remaining: tierProgress.remaining,
      },
      recentAdvocacies: waitlistSignup.advocacyRequests as any,
    };
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(limit: number = 20): Promise<LeaderboardEntry[]> {
    const topAdvocates = await prisma.waitlistSignup.findMany({
      orderBy: { advocacyCount: 'desc' },
      take: limit,
      select: {
        email: true,
        advocacyCount: true,
        currentTier: true,
      },
    });

    return topAdvocates.map((advocate, index) => ({
      email: this.maskEmail(advocate.email),
      advocacyCount: advocate.advocacyCount,
      currentTier: advocate.currentTier,
      rank: index + 1,
    }));
  }

  /**
   * Check if user has already advocated for an event
   */
  async hasAdvocated(email: string, eventId: number): Promise<boolean> {
    const existing = await prisma.advocacyRequest.findFirst({
      where: {
        email: email.toLowerCase(),
        eventId,
      },
    });

    return !!existing;
  }

  /**
   * Get total advocates for an event
   */
  async getEventAdvocateCount(eventId: number): Promise<number> {
    return await prisma.advocacyRequest.count({
      where: { eventId },
    });
  }

  /**
   * Helper: Generate referral code
   */
  private generateReferralCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * Helper: Mask email for leaderboard
   */
  private maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    if (!local || !domain) return email;

    const maskedLocal = local.length > 2
      ? local[0] + '*'.repeat(local.length - 2) + local[local.length - 1]
      : local;

    return `${maskedLocal}@${domain}`;
  }
}

export const advocacyService = new AdvocacyService();
