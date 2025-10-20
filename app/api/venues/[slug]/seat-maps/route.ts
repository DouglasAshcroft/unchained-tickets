import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { VenueChecklistTask } from '@prisma/client';
import { verifyAuth } from '@/lib/utils/auth';
import { requireVenueAccess } from '@/lib/utils/venueAuth';
import { venueSeatMapService } from '@/lib/services/VenueSeatMapService';
import { SeatMapCreateSchema } from '@/lib/validators/seatMapSchemas';
import { prisma } from '@/lib/db/prisma';

const paramsSchema = z.object({
  slug: z.string().trim().min(1, 'slug is required'),
});

async function resolveVenueIdFromSlug(slug: string): Promise<number | null> {
  const venue = await prisma.venue.findUnique({
    where: { slug },
    select: { id: true },
  });
  return venue?.id ?? null;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const authUser = await verifyAuth(request);
    const { slug } = paramsSchema.parse(await context.params);

    const venueId = await resolveVenueIdFromSlug(slug);
    if (!venueId) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 });
    }

    await requireVenueAccess(authUser.id, venueId);

    const seatMaps = await venueSeatMapService.listSeatMapsForVenue(venueId);

    return NextResponse.json({ seatMaps });
  } catch (error: any) {
    if (error?.message === 'Unauthorized: You do not have access to this venue') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request parameters', details: error.issues },
        { status: 400 }
      );
    }

    console.error('[SeatMaps][GET] Error fetching seat maps:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const authUser = await verifyAuth(request);
    const { slug } = paramsSchema.parse(await context.params);

    const venueId = await resolveVenueIdFromSlug(slug);
    if (!venueId) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 });
    }

    await requireVenueAccess(authUser.id, venueId);

    const body = await request.json();
    const payload = SeatMapCreateSchema.parse(body);

    const seatMap = await venueSeatMapService.createSeatMap(venueId, payload);

    await prisma.venueChecklistStatus.upsert({
      where: {
        venueId_task: {
          venueId,
          task: VenueChecklistTask.seat_map,
        },
      },
      create: {
        venueId,
        task: VenueChecklistTask.seat_map,
        completedAt: new Date(),
      },
      update: {
        completedAt: new Date(),
      },
    });

    return NextResponse.json({ seatMap }, { status: 201 });
  } catch (error: any) {
    if (error?.message === 'Unauthorized: You do not have access to this venue') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request body', details: error.issues },
        { status: 400 }
      );
    }

    console.error('[SeatMaps][POST] Error creating seat map:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
