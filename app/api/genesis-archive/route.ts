import { NextResponse } from 'next/server';
import { getAllGenesisTickets } from '@/lib/services/GenesisTicketService';

/**
 * GET /api/genesis-archive
 * Returns all Genesis Archive tickets in chronological order
 */
export async function GET() {
  try {
    const tickets = await getAllGenesisTickets();

    return NextResponse.json({
      success: true,
      count: tickets.length,
      tickets,
    });
  } catch (error) {
    console.error('[Genesis Archive API] Error fetching tickets:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch Genesis tickets',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
