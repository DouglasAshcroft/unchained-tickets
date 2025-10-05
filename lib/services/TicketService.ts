import { eventRepository } from '@/lib/repositories/EventRepository';

export interface Purchase {
  id: string;
  eventId: number;
  eventTitle: string;
  tier: string;
  quantity: number;
  totalPrice: number;
  transactionId: string;
  purchasedAt: string;
}

export interface ValidationResult {
  valid: boolean;
  reason?: string;
  event?: any;
}

export interface ValidatedTicket extends Purchase {
  validation: ValidationResult;
  eventData?: any;
}

export class TicketService {
  /**
   * Validate a single purchase against the database
   * Checks if event exists and is in valid status
   */
  async validatePurchase(purchaseId: string, eventId: number): Promise<ValidationResult> {
    try {
      // Check if event exists in database
      const event = await eventRepository.findById(eventId);

      if (!event) {
        return {
          valid: false,
          reason: 'Event not found - may have been deleted',
        };
      }

      // Check if event is canceled
      if (event.status === 'canceled') {
        return {
          valid: false,
          reason: 'Event has been canceled',
        };
      }

      // Check if event is in draft status (shouldn't have been purchasable)
      if (event.status === 'draft') {
        return {
          valid: false,
          reason: 'Event is not yet published',
        };
      }

      // Event is valid
      return {
        valid: true,
        event,
      };
    } catch (error) {
      console.error('Error validating purchase:', error);
      return {
        valid: false,
        reason: 'Validation error - please try again',
      };
    }
  }

  /**
   * Validate multiple purchases and return only valid tickets
   * This simulates the production flow of validating NFT tickets
   */
  async getValidTickets(purchases: Purchase[]): Promise<ValidatedTicket[]> {
    try {
      const validated = await Promise.all(
        purchases.map(async (purchase) => {
          const validation = await this.validatePurchase(purchase.id, purchase.eventId);
          return {
            ...purchase,
            validation,
            eventData: validation.event,
          };
        })
      );

      return validated;
    } catch (error) {
      console.error('Error validating tickets:', error);
      return [];
    }
  }

  /**
   * Filter purchases to only return valid, active tickets
   * Excludes tickets for deleted, canceled, or draft events
   */
  filterValidTickets(validatedTickets: ValidatedTicket[]): ValidatedTicket[] {
    return validatedTickets.filter((ticket) => ticket.validation.valid);
  }

  /**
   * Get invalid tickets with reasons why they're invalid
   * Useful for showing user what happened to their purchases
   */
  getInvalidTickets(validatedTickets: ValidatedTicket[]): ValidatedTicket[] {
    return validatedTickets.filter((ticket) => !ticket.validation.valid);
  }

  /**
   * Generate QR code data for ticket validation at venue
   * This will be scanned at the venue to validate entry
   */
  generateTicketQRCode(purchase: Purchase, ticketIndex: number): string {
    return `UNCHAINED-TICKET:${purchase.eventId}:${purchase.id}:${ticketIndex}:${purchase.transactionId}`;
  }

  /**
   * Validate a QR code scanned at venue
   * This would be called by venue staff to check ticket validity
   */
  async validateQRCode(qrCode: string): Promise<{ valid: boolean; ticket?: ValidatedTicket; error?: string }> {
    try {
      // Parse QR code format: UNCHAINED-TICKET:eventId:purchaseId:ticketIndex:transactionId
      const parts = qrCode.split(':');

      if (parts[0] !== 'UNCHAINED-TICKET' || parts.length !== 5) {
        return { valid: false, error: 'Invalid QR code format' };
      }

      const [, eventIdStr, purchaseId, , transactionId] = parts;
      const eventId = parseInt(eventIdStr, 10);

      // Validate the purchase
      const validation = await this.validatePurchase(purchaseId, eventId);

      if (!validation.valid) {
        return {
          valid: false,
          error: validation.reason || 'Ticket is not valid',
        };
      }

      // TODO: In production, also check:
      // - If ticket has already been scanned (prevent double-entry)
      // - If ticket belongs to correct event
      // - If current time is within event time window

      return {
        valid: true,
        ticket: {
          id: purchaseId,
          eventId,
          eventTitle: validation.event.title,
          tier: 'Unknown', // Would be stored in purchase record
          quantity: 1,
          totalPrice: 0,
          transactionId,
          purchasedAt: new Date().toISOString(),
          validation,
          eventData: validation.event,
        },
      };
    } catch (error) {
      console.error('QR validation error:', error);
      return { valid: false, error: 'Failed to validate QR code' };
    }
  }
}

// Export singleton instance
export const ticketService = new TicketService();
