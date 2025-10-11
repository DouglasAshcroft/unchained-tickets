import { NextRequest, NextResponse } from 'next/server';
import { eventService } from '@/lib/services/EventService';
import {
  mintTicketsWithPaymaster,
  type PaymasterMintRequest,
} from '@/lib/services/PaymasterService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      eventId,
      ticketTier,
      quantity,
      totalPrice,
      email,
      walletAddress,
      transactionReference,
    } = body ?? {};

    if (!eventId || typeof eventId !== 'number') {
      return NextResponse.json({ error: 'eventId is required' }, { status: 400 });
    }

    if (!ticketTier || typeof ticketTier !== 'string') {
      return NextResponse.json({ error: 'ticketTier is required' }, { status: 400 });
    }

    if (!quantity || typeof quantity !== 'number') {
      return NextResponse.json({ error: 'quantity is required' }, { status: 400 });
    }

    if (!totalPrice || typeof totalPrice !== 'number') {
      return NextResponse.json({ error: 'totalPrice is required' }, { status: 400 });
    }

    if (email && typeof email !== 'string') {
      return NextResponse.json({ error: 'email must be a string' }, { status: 400 });
    }

    if (!walletAddress || typeof walletAddress !== 'string') {
      return NextResponse.json({ error: 'walletAddress is required' }, { status: 400 });
    }

    const event = await eventService.getEventById(eventId);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    if (process.env.NODE_ENV !== 'production') {
      console.info('[card-charge] Simulating card payment for', {
        eventId,
        ticketTier,
        quantity,
        totalPrice,
      transactionReference,
    });
    }

    const mintRequest: PaymasterMintRequest = {
      eventId,
      ticketTier,
      quantity,
      totalPrice,
      walletAddress,
      purchaserEmail: typeof email === 'string' ? email : undefined,
      transactionReference,
    };

    const { transactionId } = await mintTicketsWithPaymaster(mintRequest);

    return NextResponse.json({ transactionId });
  } catch (error) {
    console.error('Error processing card checkout', error);
    return NextResponse.json({ error: 'Failed to process payment' }, { status: 500 });
  }
}
