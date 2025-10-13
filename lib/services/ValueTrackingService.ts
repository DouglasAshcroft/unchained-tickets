/**
 * Value Tracking Service
 *
 * Tracks impressions and click-throughs for external events
 * Calculates estimated advertising value using CPM/CPC model
 */

import { prisma } from '@/lib/db/prisma';

// Pricing model (industry standard)
const CPM = 5.0; // $5 per 1000 impressions
const CPC = 0.5; // $0.50 per click

export class ValueTrackingService {
  /**
   * Track an impression for an event
   */
  async trackImpression(
    eventId: number,
    sessionId: string,
    referrer?: string
  ): Promise<void> {
    // Create impression log
    await prisma.eventImpression.create({
      data: {
        eventId,
        sessionId,
        referrer: referrer || null,
        clickedThrough: false,
      },
    });

    // Increment event impression count
    await prisma.event.update({
      where: { id: eventId },
      data: {
        impressions: { increment: 1 },
        lastImpressionAt: new Date(),
      },
    });

    // Update venue marketing value
    await this.updateVenueMarketingValue(eventId);
  }

  /**
   * Track a click-through for an event
   */
  async trackClickThrough(
    eventId: number,
    sessionId: string
  ): Promise<void> {
    // Update impression to mark as clicked
    await prisma.eventImpression.updateMany({
      where: {
        eventId,
        sessionId,
        clickedThrough: false,
      },
      data: {
        clickedThrough: true,
      },
    });

    // Increment event click-through count
    await prisma.event.update({
      where: { id: eventId },
      data: {
        clickThroughs: { increment: 1 },
      },
    });

    // Recalculate ad value
    await this.calculateAdValue(eventId);

    // Update venue marketing value
    await this.updateVenueMarketingValue(eventId);
  }

  /**
   * Calculate estimated advertising value for an event
   */
  private async calculateAdValue(eventId: number): Promise<number> {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        impressions: true,
        clickThroughs: true,
      },
    });

    if (!event) return 0;

    const impressionValue = (event.impressions / 1000) * CPM;
    const clickValue = event.clickThroughs * CPC;
    const totalValue = impressionValue + clickValue;

    // Update event with calculated value
    await prisma.event.update({
      where: { id: eventId },
      data: {
        estimatedAdValue: totalValue,
      },
    });

    return totalValue;
  }

  /**
   * Update venue marketing value aggregate
   */
  private async updateVenueMarketingValue(eventId: number): Promise<void> {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        venue: true,
      },
    });

    if (!event) return;

    // Get all events for this venue
    const venueEvents = await prisma.event.findMany({
      where: {
        venueId: event.venueId,
        eventSource: { in: ['serper', 'manual'] },
      },
      select: {
        impressions: true,
        clickThroughs: true,
        advocacyCount: true,
      },
    });

    const totalImpressions = venueEvents.reduce((sum, e) => sum + e.impressions, 0);
    const totalClicks = venueEvents.reduce((sum, e) => sum + e.clickThroughs, 0);
    const totalAdvocates = venueEvents.reduce((sum, e) => sum + e.advocacyCount, 0);
    const estimatedAdValue = (totalImpressions / 1000) * CPM + totalClicks * CPC;

    // Upsert venue marketing value
    await prisma.venueMarketingValue.upsert({
      where: { venueName: event.venue.name },
      update: {
        totalImpressions,
        totalClicks,
        totalAdvocates,
        estimatedAdValue,
        lastUpdated: new Date(),
      },
      create: {
        venueName: event.venue.name,
        venueEmail: event.venueContactEmail,
        totalImpressions,
        totalClicks,
        totalAdvocates,
        estimatedAdValue,
        weeklyImpressions: 0,
        monthlyImpressions: 0,
      },
    });
  }

  /**
   * Get marketing value for a venue
   */
  async getVenueMarketingValue(venueName: string) {
    return await prisma.venueMarketingValue.findUnique({
      where: { venueName },
    });
  }

  /**
   * Get event value stats
   */
  async getEventValueStats(eventId: number) {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        impressions: true,
        clickThroughs: true,
        estimatedAdValue: true,
        advocacyCount: true,
      },
    });

    return event;
  }
}

export const valueTrackingService = new ValueTrackingService();
