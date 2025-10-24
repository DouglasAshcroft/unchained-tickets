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

// Alias types for component compatibility
export type Artist = {
  id: number;
  name: string;
  slug: string;
  genre: string | null;
};

export type Venue = {
  id: number;
  name: string;
  slug: string;
  city?: string | null;
  state?: string | null;
  capacity?: number | null;
};

export type EventFormData = FormState & {
  doorsOpen: string;
};

// Wizard steps definition
export const WIZARD_STEPS: StepDefinition[] = [
  {
    id: 'basics',
    title: 'Basics',
    description: 'Name your event and add optional branding links.',
  },
  {
    id: 'schedule',
    title: 'Schedule & Venue',
    description: 'Set the timeline and choose where the event happens.',
  },
  {
    id: 'tickets',
    title: 'Tickets & Seating',
    description: 'Define ticket tiers, pricing, and reserve a seat map if needed.',
  },
  {
    id: 'posters',
    title: 'Collectible Posters',
    description: 'Generate or upload exclusive poster art for each ticket tier.',
  },
  {
    id: 'review',
    title: 'Review & Publish',
    description: 'Double-check details and decide whether to publish now or later.',
  },
];
