import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ticketService } from '@/lib/services/TicketService';
import { scanTicket, validateTicket } from '@/lib/services/TicketScanService';

const ValidateRequestSchema = z.object({
  purchases: z.array(
    z.object({
      id: z.string(),
      eventId: z.number(),
      eventTitle: z.string(),
      tier: z.string(),
      quantity: z.number(),
      totalPrice: z.number(),
      transactionId: z.string(),
      purchasedAt: z.string(),
    })
  ),
});

/**
 * POST /api/tickets/validate
 *
 * Validates an array of purchases against the database
 * Returns validated tickets with event data and validity status
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const { purchases } = ValidateRequestSchema.parse(body);

    // Validate all purchases
    const validatedTickets = await ticketService.getValidTickets(purchases);

    // Separate valid and invalid tickets
    const validTickets = ticketService.filterValidTickets(validatedTickets);
    const invalidTickets = ticketService.getInvalidTickets(validatedTickets);

    return NextResponse.json({
      validTickets,
      invalidTickets,
      summary: {
        total: purchases.length,
        valid: validTickets.length,
        invalid: invalidTickets.length,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request format', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Ticket validation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

const QRValidateSchema = z.object({
  qrCode: z.string(),
});

/**
 * PUT /api/tickets/validate
 *
 * Validates a QR code scanned at venue
 * Used by venue staff to check ticket validity at event entry
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { qrCode } = QRValidateSchema.parse(body);

    const result = await ticketService.validateQRCode(qrCode);

    if (!result.valid) {
      return NextResponse.json(
        { valid: false, error: result.error || 'Invalid ticket' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      ticket: result.ticket,
      message: 'Ticket is valid - entry approved',
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request format', details: error.issues },
        { status: 400 }
      );
    }

    console.error('QR validation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

const ScanRequestSchema = z.object({
  ticketId: z.string(),
  walletAddress: z.string(),
  transformToSouvenir: z.boolean().optional().default(true),
});

/**
 * PATCH /api/tickets/validate
 *
 * Scans a ticket at the venue and transforms it to a souvenir NFT
 * Used by venue staff during event check-in
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = ScanRequestSchema.parse(body);

    const result = await scanTicket(validatedData);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to scan ticket'
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      ticket: result.ticket,
      transactionHash: result.transactionHash,
      souvenirMetadataUrl: result.souvenirMetadataUrl,
      message: 'Ticket scanned successfully - entry approved',
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request format', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Ticket scan error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET /api/tickets/validate?ticketId=xxx
 *
 * Quick validation of a ticket before scanning
 * Returns ticket details without modifying state
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ticketId = searchParams.get('ticketId');

    if (!ticketId) {
      return NextResponse.json(
        { error: 'ticketId parameter is required' },
        { status: 400 }
      );
    }

    const result = await validateTicket(ticketId);

    if (!result.valid) {
      return NextResponse.json(
        { valid: false, error: result.error },
        { status: 200 } // 200 because validation worked, ticket is just invalid
      );
    }

    return NextResponse.json({
      valid: true,
      ticket: result.ticket,
    });
  } catch (error) {
    console.error('Ticket validation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
