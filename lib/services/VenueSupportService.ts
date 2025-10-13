import { prisma } from '@/lib/db/prisma';

interface StartSupportSessionParams {
  adminUserId: number;
  venueId: number;
  ipAddress?: string;
  userAgent?: string;
}

interface SwitchVenueParams {
  adminUserId: number;
  newVenueId: number;
  ipAddress?: string;
  userAgent?: string;
}

interface SupportSessionResult {
  id: number;
  venueId: number;
  venueName: string;
  venueSlug: string;
  startedAt: Date;
}

/**
 * Service for managing admin/dev support access to venue dashboards.
 * Provides secure session management with audit logging.
 */
export class VenueSupportService {
  /**
   * Start a new support session for a venue.
   * Only admin and dev users can start support sessions.
   */
  async startSupportSession({
    adminUserId,
    venueId,
    ipAddress,
    userAgent,
  }: StartSupportSessionParams): Promise<SupportSessionResult> {
    // Verify user has admin or dev role
    const user = await prisma.user.findUnique({
      where: { id: adminUserId },
      select: { role: true },
    });

    if (!user || (user.role !== 'admin' && user.role !== 'dev')) {
      throw new Error('Unauthorized: Only admin and dev users can access venue support');
    }

    // End any existing active sessions for this user
    await prisma.venueSupportSession.updateMany({
      where: {
        userId: adminUserId,
        endedAt: null,
      },
      data: {
        endedAt: new Date(),
      },
    });

    // Get venue details
    const venue = await prisma.venue.findUnique({
      where: { id: venueId },
      select: { id: true, name: true, slug: true },
    });

    if (!venue) {
      throw new Error(`Venue with ID ${venueId} not found`);
    }

    // Create new support session
    const session = await prisma.venueSupportSession.create({
      data: {
        userId: adminUserId,
        supportedVenueId: venueId,
        ipAddress,
        userAgent,
      },
    });

    // Log to audit trail
    await prisma.adminAuditLog.create({
      data: {
        userId: adminUserId,
        action: 'venue_support_start',
        targetType: 'venue',
        targetId: venueId,
        metadata: {
          venueName: venue.name,
          venueSlug: venue.slug,
        },
        ipAddress,
        userAgent,
      },
    });

    return {
      id: session.id,
      venueId: venue.id,
      venueName: venue.name,
      venueSlug: venue.slug,
      startedAt: session.startedAt,
    };
  }

  /**
   * Switch from one venue to another.
   * Ends the current session and starts a new one.
   */
  async switchVenue({
    adminUserId,
    newVenueId,
    ipAddress,
    userAgent,
  }: SwitchVenueParams): Promise<SupportSessionResult> {
    // Get current session to log the switch
    const currentSession = await this.getCurrentSupportSession(adminUserId);

    // End current session and start new one
    const result = await this.startSupportSession({
      adminUserId,
      venueId: newVenueId,
      ipAddress,
      userAgent,
    });

    // Log the switch action
    if (currentSession) {
      await prisma.adminAuditLog.create({
        data: {
          userId: adminUserId,
          action: 'venue_support_switch',
          targetType: 'venue',
          targetId: newVenueId,
          metadata: {
            fromVenueId: currentSession.venueId,
            fromVenueName: currentSession.venueName,
            toVenueId: result.venueId,
            toVenueName: result.venueName,
          },
          ipAddress,
          userAgent,
        },
      });
    }

    return result;
  }

  /**
   * End the current support session for a user.
   */
  async endSupportSession(
    adminUserId: number,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    const session = await prisma.venueSupportSession.findFirst({
      where: {
        userId: adminUserId,
        endedAt: null,
      },
      include: {
        venue: {
          select: { id: true, name: true },
        },
      },
    });

    if (!session) {
      return; // No active session to end
    }

    // End the session
    await prisma.venueSupportSession.update({
      where: { id: session.id },
      data: { endedAt: new Date() },
    });

    // Log the end
    await prisma.adminAuditLog.create({
      data: {
        userId: adminUserId,
        action: 'venue_support_end',
        targetType: 'venue',
        targetId: session.supportedVenueId,
        metadata: {
          venueName: session.venue.name,
          sessionDurationMs: Date.now() - session.startedAt.getTime(),
        },
        ipAddress,
        userAgent,
      },
    });
  }

  /**
   * Get the current active support session for a user.
   */
  async getCurrentSupportSession(
    adminUserId: number
  ): Promise<SupportSessionResult | null> {
    const session = await prisma.venueSupportSession.findFirst({
      where: {
        userId: adminUserId,
        endedAt: null,
      },
      include: {
        venue: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy: {
        startedAt: 'desc',
      },
    });

    if (!session) {
      return null;
    }

    return {
      id: session.id,
      venueId: session.venue.id,
      venueName: session.venue.name,
      venueSlug: session.venue.slug,
      startedAt: session.startedAt,
    };
  }

  /**
   * Get support session history for a user.
   */
  async getSupportHistory(adminUserId: number, limit: number = 50) {
    return prisma.venueSupportSession.findMany({
      where: { userId: adminUserId },
      include: {
        venue: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy: {
        startedAt: 'desc',
      },
      take: limit,
    });
  }

  /**
   * Get audit logs with optional filters.
   */
  async getAuditLogs(params: {
    userId?: number;
    action?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }) {
    const { userId, action, startDate, endDate, limit = 100, offset = 0 } = params;

    const where: any = {};

    if (userId) {
      where.userId = userId;
    }

    if (action) {
      where.action = action;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = startDate;
      }
      if (endDate) {
        where.createdAt.lte = endDate;
      }
    }

    const [logs, total] = await Promise.all([
      prisma.adminAuditLog.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      prisma.adminAuditLog.count({ where }),
    ]);

    return {
      logs,
      total,
      limit,
      offset,
    };
  }
}

// Export singleton instance
export const venueSupportService = new VenueSupportService();
