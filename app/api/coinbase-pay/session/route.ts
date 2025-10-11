import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { walletAddress, eventId } = body ?? {};

    if (!walletAddress || typeof walletAddress !== 'string') {
      return NextResponse.json(
        { error: 'walletAddress is required before launching Coinbase Pay.' },
        { status: 400 }
      );
    }

    if (typeof eventId !== 'number') {
      return NextResponse.json({ error: 'eventId is required.' }, { status: 400 });
    }

    // TODO: Integrate with Coinbase Pay Sessions API and return the real session token.
    const sessionToken = randomUUID();

    return NextResponse.json({ sessionToken });
  } catch (error) {
    console.error('Error creating Coinbase Pay session', error);
    return NextResponse.json(
      { error: 'Failed to create Coinbase Pay session.' },
      { status: 500 }
    );
  }
}
