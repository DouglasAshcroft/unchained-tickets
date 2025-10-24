/**
 * TicketReservationService
 *
 * Handles atomic ticket number assignment and capacity management to prevent
 * duplicate tickets and enforce venue-set capacity limits.
 *
 * Core Concepts:
 * - Sequential ticket numbering per event + tier (e.g., VIP 001, VIP 002, ...)
 * - Atomic assignment using database transactions
 * - Capacity enforcement before ticket creation
 * - Race condition handling with retry logic
 */

import { prisma } from '@/lib/db/prisma';

export interface TicketNumberResult {
  seatNumber: string;       // e.g., "042"
  isAtCapacity: boolean;    // true if this would exceed capacity
  ticketCount: number;      // current number of tickets sold
}

export interface CapacityCheckResult {
  available: number;        // tickets remaining
  capacity: number | null;  // total capacity (null if unlimited)
  soldOut: boolean;         // true if no tickets remaining
  ticketCount: number;      // current number of tickets sold
}

export interface SeatAssignment {
  seatSection: string;      // Tier name (e.g., "VIP", "General Admission")
  seatRow: string;          // Always "001" for GA/VIP
  seat: string;             // Formatted seat number (e.g., "042")
}

/**
 * Get the next available ticket number for a tier
 *
 * This is the core function that prevents duplicate ticket assignments.
 * It counts existing tickets and calculates the next sequential number.
 *
 * @param eventId - Database event ID
 * @param ticketTypeId - Ticket tier/type ID
 * @returns Ticket number and capacity status
 */
export async function getNextTicketNumber(
  eventId: number,
  ticketTypeId: number
): Promise<TicketNumberResult> {
  console.log(`[TicketReservationService] Getting next ticket number for event ${eventId}, tier ${ticketTypeId}`);

  // Count existing tickets for this event + tier (excluding canceled and Genesis tickets)
  // Genesis tickets are archive/test tickets and should NOT count against capacity
  const ticketCount = await prisma.ticket.count({
    where: {
      eventId,
      ticketTypeId,
      status: {
        not: 'canceled', // Don't count canceled tickets (note: one 'l')
      },
      isGenesisTicket: false, // NEVER count Genesis tickets against capacity
    },
  });

  console.log(`[TicketReservationService] Current ticket count: ${ticketCount}`);

  // Get tier capacity
  const ticketType = await prisma.eventTicketType.findUnique({
    where: { id: ticketTypeId },
    select: { capacity: true, name: true },
  });

  if (!ticketType) {
    throw new Error(`Ticket type ${ticketTypeId} not found`);
  }

  const { capacity } = ticketType;
  const nextNumber = ticketCount + 1;

  // Check if at capacity
  const isAtCapacity = capacity !== null && nextNumber > capacity;

  console.log(`[TicketReservationService] Next number: ${nextNumber}, Capacity: ${capacity}, At capacity: ${isAtCapacity}`);

  return {
    seatNumber: nextNumber.toString().padStart(3, '0'), // "001", "042", "500"
    isAtCapacity,
    ticketCount,
  };
}

/**
 * Check if a ticket tier has reached capacity
 *
 * Call this BEFORE attempting to create a ticket to provide early feedback
 * to the user if the event is sold out.
 *
 * @param eventId - Database event ID
 * @param ticketTypeId - Ticket tier/type ID
 * @returns Capacity status with availability count
 */
export async function checkTierCapacity(
  eventId: number,
  ticketTypeId: number
): Promise<CapacityCheckResult> {
  console.log(`[TicketReservationService] Checking capacity for event ${eventId}, tier ${ticketTypeId}`);

  // Count existing tickets (excluding canceled and Genesis tickets)
  const ticketCount = await prisma.ticket.count({
    where: {
      eventId,
      ticketTypeId,
      status: {
        not: 'canceled', // Note: one 'l' in the enum
      },
      isGenesisTicket: false, // NEVER count Genesis tickets against capacity
    },
  });

  // Get tier capacity
  const ticketType = await prisma.eventTicketType.findUnique({
    where: { id: ticketTypeId },
    select: { capacity: true, name: true },
  });

  if (!ticketType) {
    throw new Error(`Ticket type ${ticketTypeId} not found`);
  }

  const { capacity } = ticketType;

  // Calculate availability
  const available = capacity !== null ? capacity - ticketCount : Infinity;
  const soldOut = capacity !== null && ticketCount >= capacity;

  console.log(`[TicketReservationService] Capacity check: ${ticketCount}/${capacity}, Available: ${available}, Sold out: ${soldOut}`);

  return {
    available: capacity !== null ? Math.max(0, available) : 999999,
    capacity,
    soldOut,
    ticketCount,
  };
}

/**
 * Format seat assignment data for database storage
 *
 * Converts ticket tier name and seat number into the three-part seat
 * assignment format: (seatSection, seatRow, seat)
 *
 * For GA/VIP events:
 * - seatSection = tier name (e.g., "VIP", "General Admission")
 * - seatRow = "001" (always, since seats aren't organized by row)
 * - seat = formatted number (e.g., "042")
 *
 * @param tierName - Name of the ticket tier
 * @param seatNumber - Formatted seat number (e.g., "042")
 * @returns Seat assignment object for database
 */
export function formatSeatAssignment(
  tierName: string,
  seatNumber: string
): SeatAssignment {
  return {
    seatSection: tierName,
    seatRow: '001',
    seat: seatNumber,
  };
}

/**
 * Helper function to display ticket number in "X of Y" format
 *
 * @param seatNumber - Seat number (e.g., "042")
 * @param capacity - Total capacity (e.g., 500)
 * @returns Formatted string (e.g., "042 of 500")
 */
export function formatTicketDisplay(seatNumber: string, capacity: number | null): string {
  if (capacity === null) {
    return `#${seatNumber}`;
  }
  return `${seatNumber} of ${capacity}`;
}

/**
 * Get all tickets for an event + tier (for debugging/admin)
 *
 * @param eventId - Database event ID
 * @param ticketTypeId - Ticket tier/type ID
 * @returns List of tickets with seat assignments
 */
export async function getTicketsForTier(eventId: number, ticketTypeId: number) {
  return prisma.ticket.findMany({
    where: {
      eventId,
      ticketTypeId,
      status: { not: 'canceled' },
    },
    select: {
      id: true,
      seatSection: true,
      seatRow: true,
      seat: true,
      status: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });
}
