/**
 * Blockchain Validation Utilities
 *
 * Centralized validation logic for determining if an event is ready
 * for blockchain registration. This ensures consistent validation
 * across event creation, editing, and publishing flows.
 *
 * DRY Principle: Single source of truth for blockchain readiness checks
 */

export interface BlockchainReadinessCheck {
  hasVenue: boolean;
  hasArtist: boolean;
  hasGenre: boolean;
  isFutureDate: boolean;
  hasActiveTickets: boolean;
  hasPoster?: boolean;
}

export interface BlockchainValidationResult {
  ready: boolean;
  errors: string[];
  warnings: string[];
  checks: BlockchainReadinessCheck;
}

interface EventData {
  startsAt: Date;
  venueId?: number | null;
  venue?: { id: number; name: string } | null;
  primaryArtistId?: number | null;
  primaryArtist?: { id: number; name: string; genre?: string | null } | null;
  ticketTypes?: Array<{ isActive: boolean }>;
  posterImageUrl?: string | null;
}

/**
 * Validates if an event is ready for blockchain registration
 *
 * @param event - Event data to validate
 * @returns Validation result with ready status, errors, warnings, and detailed checks
 */
export function validateBlockchainReadiness(event: EventData): BlockchainValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check 1: Has venue
  const hasVenue = Boolean(event.venueId && event.venue);
  if (!hasVenue) {
    errors.push('Event must have a venue');
  }

  // Check 2: Has primary artist
  const hasArtist = Boolean(event.primaryArtistId && event.primaryArtist);
  if (!hasArtist) {
    errors.push('Event must have a primary artist');
  }

  // Check 3: Artist has genre
  const hasGenre = Boolean(event.primaryArtist?.genre);
  if (hasArtist && !hasGenre) {
    errors.push('Primary artist must have a genre');
  }

  // Check 4: Event is in the future
  const now = new Date();
  const isFutureDate = event.startsAt > now;
  if (!isFutureDate) {
    errors.push('Event start date must be in the future');
  }

  // Check 5: Has at least one active ticket type
  const activeTickets = event.ticketTypes?.filter((tt) => tt.isActive) || [];
  const hasActiveTickets = activeTickets.length > 0;
  if (!hasActiveTickets) {
    errors.push('Event must have at least one active ticket type');
  }

  // Warning: Poster recommended but not required
  const hasPoster = Boolean(event.posterImageUrl);
  if (!hasPoster) {
    warnings.push('Event has no poster image');
  }

  const checks: BlockchainReadinessCheck = {
    hasVenue,
    hasArtist,
    hasGenre,
    isFutureDate,
    hasActiveTickets,
    hasPoster,
  };

  const ready = errors.length === 0;

  return {
    ready,
    errors,
    warnings,
    checks,
  };
}

/**
 * Get a human-readable summary of blockchain readiness
 *
 * @param validation - Result from validateBlockchainReadiness
 * @returns User-friendly message
 */
export function getReadinessSummary(validation: BlockchainValidationResult): string {
  if (validation.ready) {
    return 'Event is ready for blockchain registration';
  }

  const errorCount = validation.errors.length;
  const plural = errorCount === 1 ? 'issue' : 'issues';
  return `${errorCount} ${plural} preventing blockchain registration`;
}
