import { useState, useCallback } from 'react';
import type {
  FormState,
  TicketTypeForm,
  TicketPerkForm,
  PosterVariant,
} from '../types';

// Helper functions to generate IDs
const generateTicketTypeId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `ticket-${Math.random().toString(36).slice(2, 10)}`;

const generateTicketPerkId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `perk-${Math.random().toString(36).slice(2, 10)}`;

// Factory functions
const createEmptyTicketPerk = (): TicketPerkForm => ({
  id: generateTicketPerkId(),
  name: '',
  description: '',
  instructions: '',
  quantity: '1',
});

const createEmptyTicketType = (): TicketTypeForm => ({
  id: generateTicketTypeId(),
  name: '',
  description: '',
  pricingType: 'general_admission',
  price: '',
  currency: 'USD',
  capacity: '',
  salesStart: '',
  salesEnd: '',
  isActive: true,
  perks: [],
});

// Initial state
const initialState: FormState = {
  title: '',
  posterImageUrl: '',
  externalLink: '',
  mapsLink: '',
  startsAt: '',
  endsAt: '',
  venueId: '',
  primaryArtistId: '',
  status: 'draft',
  ticketTypes: [createEmptyTicketType()],
  posterVariants: [],
};

/**
 * Custom hook to manage event form state
 *
 * Handles all form data for the event creation wizard including:
 * - Basic event details (title, dates, venue, etc.)
 * - Ticket types and their configuration
 * - Ticket perks
 * - Poster variants
 *
 * @returns Form state and update methods
 */
export function useEventFormState() {
  const [formData, setFormData] = useState<FormState>(initialState);

  /**
   * Update a top-level form field
   */
  const updateField = useCallback(<K extends keyof FormState>(
    field: K,
    value: FormState[K]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  /**
   * Add a new empty ticket type
   */
  const addTicketType = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      ticketTypes: [...prev.ticketTypes, createEmptyTicketType()],
    }));
  }, []);

  /**
   * Update a specific field of a ticket type
   */
  const updateTicketField = useCallback(<K extends keyof TicketTypeForm>(
    ticketId: string,
    field: K,
    value: TicketTypeForm[K]
  ) => {
    setFormData((prev) => ({
      ...prev,
      ticketTypes: prev.ticketTypes.map((ticket) =>
        ticket.id === ticketId ? { ...ticket, [field]: value } : ticket
      ),
    }));
  }, []);

  /**
   * Remove a ticket type by ID
   * Cannot remove if it's the last ticket type
   *
   * @returns Warning message if removal blocked, undefined otherwise
   */
  const removeTicketType = useCallback((ticketId: string): string | undefined => {
    let warningMessage: string | undefined;

    setFormData((prev) => {
      if (prev.ticketTypes.length === 1) {
        warningMessage = 'Keep at least one ticket type';
        return prev; // Don't modify state
      }

      return {
        ...prev,
        ticketTypes: prev.ticketTypes.filter((ticket) => ticket.id !== ticketId),
      };
    });

    return warningMessage;
  }, []);

  /**
   * Add an empty perk to a specific ticket
   */
  const addPerkToTicket = useCallback((ticketId: string) => {
    setFormData((prev) => ({
      ...prev,
      ticketTypes: prev.ticketTypes.map((ticket) =>
        ticket.id === ticketId
          ? { ...ticket, perks: [...ticket.perks, createEmptyTicketPerk()] }
          : ticket
      ),
    }));
  }, []);

  /**
   * Update a specific field of a perk
   */
  const updatePerkField = useCallback(<K extends keyof TicketPerkForm>(
    ticketId: string,
    perkId: string,
    field: K,
    value: TicketPerkForm[K]
  ) => {
    setFormData((prev) => ({
      ...prev,
      ticketTypes: prev.ticketTypes.map((ticket) =>
        ticket.id === ticketId
          ? {
              ...ticket,
              perks: ticket.perks.map((perk) =>
                perk.id === perkId ? { ...perk, [field]: value } : perk
              ),
            }
          : ticket
      ),
    }));
  }, []);

  /**
   * Remove a perk from a ticket
   */
  const removePerkFromTicket = useCallback((ticketId: string, perkId: string) => {
    setFormData((prev) => ({
      ...prev,
      ticketTypes: prev.ticketTypes.map((ticket) =>
        ticket.id === ticketId
          ? {
              ...ticket,
              perks: ticket.perks.filter((perk) => perk.id !== perkId),
            }
          : ticket
      ),
    }));
  }, []);

  /**
   * Add a poster variant
   */
  const addPosterVariant = useCallback((variant: PosterVariant) => {
    setFormData((prev) => ({
      ...prev,
      posterVariants: [...prev.posterVariants, variant],
    }));
  }, []);

  /**
   * Approve a poster variant by ticket type ID
   */
  const approvePosterVariant = useCallback((ticketTypeId: string) => {
    setFormData((prev) => ({
      ...prev,
      posterVariants: prev.posterVariants.map((variant) =>
        variant.ticketTypeId === ticketTypeId
          ? { ...variant, isApproved: true }
          : variant
      ),
    }));
  }, []);

  /**
   * Update the image URL of a poster variant
   */
  const updatePosterVariantImage = useCallback((ticketTypeId: string, imageUrl: string) => {
    setFormData((prev) => ({
      ...prev,
      posterVariants: prev.posterVariants.map((variant) =>
        variant.ticketTypeId === ticketTypeId
          ? { ...variant, imageUrl }
          : variant
      ),
    }));
  }, []);

  /**
   * Reset form to initial state
   */
  const resetForm = useCallback(() => {
    setFormData(initialState);
  }, []);

  return {
    formData,
    updateField,
    addTicketType,
    updateTicketField,
    removeTicketType,
    addPerkToTicket,
    updatePerkField,
    removePerkFromTicket,
    addPosterVariant,
    approvePosterVariant,
    updatePosterVariantImage,
    resetForm,
  };
}
