/**
 * Shared types for the New Event creation wizard
 *
 * These types are used across hooks, components, and the main page
 * to ensure type safety and consistency.
 */

export type PricingType = 'general_admission' | 'reserved' | 'mixed';

export type TicketPerkForm = {
  id: string;
  name: string;
  description: string;
  instructions: string;
  quantity: string;
};

export type TicketTypeForm = {
  id: string;
  name: string;
  description: string;
  pricingType: PricingType;
  price: string;
  currency: string;
  capacity: string;
  salesStart: string;
  salesEnd: string;
  isActive: boolean;
  perks: TicketPerkForm[];
};

export type PosterVariant = {
  ticketTypeId: string;
  ticketTypeName: string;
  imageUrl: string;
  isApproved: boolean;
  rarityMultiplier: number;
};

export type FormState = {
  title: string;
  posterImageUrl: string;
  externalLink: string;
  mapsLink: string;
  startsAt: string;
  endsAt: string;
  venueId: string;
  primaryArtistId: string;
  status: 'draft' | 'published';
  ticketTypes: TicketTypeForm[];
  posterVariants: PosterVariant[];
};

export type FormErrors = Record<string, string | undefined>;

export type WizardStep = 'basics' | 'schedule' | 'tickets' | 'posters' | 'review';

export interface StepDefinition {
  id: WizardStep;
  title: string;
  description: string;
}

export type VenueOption = {
  id: number;
  name: string;
  city?: string | null;
  state?: string | null;
  addressLine1?: string | null;
  postalCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  mapsLink?: string | null;
};

export type ArtistOption = {
  id: number;
  name: string;
  slug: string;
  genre?: string | null;
};
