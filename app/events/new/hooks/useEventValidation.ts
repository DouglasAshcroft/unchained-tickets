import { useState, useCallback } from 'react';
import type { FormState, FormErrors, WizardStep } from '../types';

/**
 * Validates if a string is a valid URL
 */
const isValidUrl = (value: string): boolean => {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

/**
 * Custom hook to manage event form validation
 *
 * Validates form data for each step of the wizard:
 * - basics: Event title, poster URL, external links
 * - schedule: Dates, times, venue, maps link
 * - tickets: Ticket types, pricing, capacity, perks
 * - posters: Approved poster variants for all tiers
 * - review: Publication status
 *
 * @param formData - Current form state to validate
 * @returns Validation errors and methods
 */
export function useEventValidation(formData: FormState) {
  const [errors, setErrors] = useState<FormErrors>({});

  /**
   * Validate a specific wizard step
   *
   * @param stepId - The step to validate
   * @returns Object containing validation errors (empty if valid)
   */
  const validateStep = useCallback(
    (stepId: WizardStep): FormErrors => {
      const stepErrors: FormErrors = {};

      if (stepId === 'basics') {
        // Title validation
        if (!formData.title.trim()) {
          stepErrors.title = 'Event title is required.';
        }

        // Poster URL validation (optional, but must be valid if provided)
        if (formData.posterImageUrl && !isValidUrl(formData.posterImageUrl)) {
          stepErrors.posterImageUrl = 'Enter a valid URL for the poster image.';
        }

        // External link validation (optional, but must be valid if provided)
        if (formData.externalLink && !isValidUrl(formData.externalLink)) {
          stepErrors.externalLink = 'External link must be a valid URL.';
        }
      }

      if (stepId === 'schedule') {
        // Start date/time validation
        if (!formData.startsAt) {
          stepErrors.startsAt = 'Start date/time is required.';
        }

        // Venue validation
        if (!formData.venueId) {
          stepErrors.venueId = 'Select a venue to continue.';
        }

        // End time validation (must be after start time)
        if (formData.startsAt && formData.endsAt) {
          const start = new Date(formData.startsAt);
          const end = new Date(formData.endsAt);
          if (end <= start) {
            stepErrors.endsAt = 'End time must be after the start time.';
          }
        }

        // Maps link validation
        if (!formData.mapsLink) {
          stepErrors.mapsLink = 'Maps link is required for the venue.';
        } else if (!isValidUrl(formData.mapsLink)) {
          stepErrors.mapsLink = 'Maps link must be a valid URL.';
        }
      }

      if (stepId === 'tickets') {
        // Track ticket names for uniqueness validation
        const seenNames = new Set<string>();

        formData.ticketTypes.forEach((ticket) => {
          // Ticket name validation
          const trimmedName = ticket.name.trim();
          if (!trimmedName) {
            stepErrors[`ticketTypes.${ticket.id}.name`] = 'Ticket name is required.';
          } else {
            // Check uniqueness (case-insensitive)
            const normalized = trimmedName.toLowerCase();
            if (seenNames.has(normalized)) {
              stepErrors[`ticketTypes.${ticket.id}.name`] = 'Ticket names must be unique.';
            } else {
              seenNames.add(normalized);
            }
          }

          // Price validation
          const priceValue = ticket.price.trim();
          if (!priceValue) {
            stepErrors[`ticketTypes.${ticket.id}.price`] = 'Enter a price for this ticket.';
          } else {
            const parsedPrice = Number.parseFloat(priceValue);
            if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
              stepErrors[`ticketTypes.${ticket.id}.price`] =
                'Price must be a valid non-negative number.';
            }
          }

          // Currency validation (3-letter code)
          const currencyValue = ticket.currency.trim();
          if (!/^[A-Za-z]{3}$/.test(currencyValue)) {
            stepErrors[`ticketTypes.${ticket.id}.currency`] =
              'Use a three-letter currency code (e.g., USD).';
          }

          // Capacity validation
          const capacityValue = ticket.capacity.trim();
          if (!capacityValue) {
            stepErrors[`ticketTypes.${ticket.id}.capacity`] = 'Capacity is required.';
          } else {
            const parsedCapacity = Number.parseInt(capacityValue, 10);
            // Check if it's a valid integer (no decimals) and positive
            if (
              !Number.isFinite(parsedCapacity) ||
              parsedCapacity <= 0 ||
              capacityValue !== parsedCapacity.toString()
            ) {
              stepErrors[`ticketTypes.${ticket.id}.capacity`] =
                'Capacity must be a positive whole number.';
            }
          }

          // Sales window validation
          if (ticket.salesStart && ticket.salesEnd) {
            const startDate = new Date(ticket.salesStart);
            const endDate = new Date(ticket.salesEnd);
            if (endDate < startDate) {
              stepErrors[`ticketTypes.${ticket.id}.salesEnd`] =
                'Sales end must be after the start.';
            }
          }

          // Perk validation
          ticket.perks.forEach((perk) => {
            // Perk name validation
            const trimmedPerkName = perk.name.trim();
            if (!trimmedPerkName) {
              stepErrors[`ticketTypes.${ticket.id}.perks.${perk.id}.name`] =
                'Perk name is required.';
            }

            // Perk quantity validation
            const quantityValue = perk.quantity.trim();
            const parsedQuantity = Number.parseInt(quantityValue || '0', 10);
            if (!Number.isFinite(parsedQuantity) || parsedQuantity < 1) {
              stepErrors[`ticketTypes.${ticket.id}.perks.${perk.id}.quantity`] =
                'Quantity must be at least 1.';
            }

            // Perk description length validation
            if (perk.description.length > 500) {
              stepErrors[`ticketTypes.${ticket.id}.perks.${perk.id}.description`] =
                'Description must be 500 characters or fewer.';
            }

            // Perk instructions length validation
            if (perk.instructions.length > 500) {
              stepErrors[`ticketTypes.${ticket.id}.perks.${perk.id}.instructions`] =
                'Instructions must be 500 characters or fewer.';
            }
          });
        });
      }

      if (stepId === 'posters') {
        // Check if all ticket types have approved posters
        const missingPosters = formData.ticketTypes.filter((ticket) => {
          const variant = formData.posterVariants.find(
            (v) => v.ticketTypeId === ticket.id
          );
          return !variant || !variant.isApproved;
        });

        if (missingPosters.length > 0) {
          stepErrors.posters = `Please approve posters for all ticket tiers. Missing: ${missingPosters.map((t) => t.name).join(', ')}`;
        }
      }

      if (stepId === 'review') {
        // Status validation
        if (!['draft', 'published'].includes(formData.status)) {
          stepErrors.status = 'Select whether to keep this as a draft or publish it.';
        }
      }

      // Update errors state
      setErrors(stepErrors);

      return stepErrors;
    },
    [formData]
  );

  /**
   * Clear all validation errors
   */
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    errors,
    validateStep,
    clearErrors,
  };
}
