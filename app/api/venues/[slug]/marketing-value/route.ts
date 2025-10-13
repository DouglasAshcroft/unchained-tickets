/**
 * GET /api/venues/[slug]/marketing-value
 *
 * Get marketing value stats for a venue
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { valueTrackingService } from '@/lib/services/ValueTrackingService';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Get venue
    const venue = await prisma.venue.findUnique({
      where: { slug: params.slug },
      select: { name: true },
    });

    if (!venue) {
      return NextResponse.json(
        { error: 'Venue not found' },
        { status: 404 }
      );
    }

    // Get marketing value
    const marketingValue = await valueTrackingService.getVenueMarketingValue(venue.name);

    if (!marketingValue) {
      return NextResponse.json({
        venueName: venue.name,
        totalImpressions: 0,
        totalClicks: 0,
        totalAdvocates: 0,
        estimatedAdValue: 0,
      });
    }

    return NextResponse.json(marketingValue);
  } catch (error: any) {
    console.error('Marketing value error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get marketing value' },
      { status: 500 }
    );
  }
}
