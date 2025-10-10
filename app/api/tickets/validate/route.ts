import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ticketService } from '@/lib/services/TicketService';

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
