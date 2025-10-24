import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEventValidation } from '../useEventValidation';
import type { FormState } from '../../types';

// Helper to create valid form data
const createValidFormData = (): FormState => ({
  title: 'Summer Concert 2025',
  posterImageUrl: '',
  externalLink: '',
  mapsLink: 'https://maps.google.com/?q=venue',
  startsAt: '2025-12-01T19:00',
  endsAt: '2025-12-01T23:00',
  venueId: '1',
  primaryArtistId: '1',
  status: 'draft',
  ticketTypes: [
    {
      id: 'ticket-1',
      name: 'VIP Pass',
      description: 'Premium access',
      pricingType: 'general_admission',
      price: '99.99',
      currency: 'USD',
      capacity: '100',
      salesStart: '',
      salesEnd: '',
      isActive: true,
      perks: [],
    },
  ],
  posterVariants: [
    {
      ticketTypeId: 'ticket-1',
      ticketTypeName: 'VIP Pass',
      imageUrl: 'data:image/png;base64,abc',
      isApproved: true,
      rarityMultiplier: 2.0,
    },
  ],
});

describe('useEventValidation', () => {
  describe('basics step validation', () => {
    it('should require event title', () => {
      const formData = createValidFormData();
      formData.title = '';

      const { result } = renderHook(() => useEventValidation(formData));
      const errors = result.current.validateStep('basics');

      expect(errors.title).toBe('Event title is required.');
    });

    it('should pass with valid title', () => {
      const formData = createValidFormData();
      formData.title = 'Test Event';

      const { result } = renderHook(() => useEventValidation(formData));
      const errors = result.current.validateStep('basics');

      expect(errors.title).toBeUndefined();
    });

    it('should require title to be non-whitespace', () => {
      const formData = createValidFormData();
      formData.title = '   ';

      const { result } = renderHook(() => useEventValidation(formData));
      const errors = result.current.validateStep('basics');

      expect(errors.title).toBe('Event title is required.');
    });

    it('should validate poster URL format when provided', () => {
      const formData = createValidFormData();
      formData.posterImageUrl = 'not-a-url';

      const { result } = renderHook(() => useEventValidation(formData));
      const errors = result.current.validateStep('basics');

      expect(errors.posterImageUrl).toBe('Enter a valid URL for the poster image.');
    });

    it('should accept valid poster URL', () => {
      const formData = createValidFormData();
      formData.posterImageUrl = 'https://example.com/poster.jpg';

      const { result } = renderHook(() => useEventValidation(formData));
      const errors = result.current.validateStep('basics');

      expect(errors.posterImageUrl).toBeUndefined();
    });

    it('should allow empty poster URL', () => {
      const formData = createValidFormData();
      formData.posterImageUrl = '';

      const { result } = renderHook(() => useEventValidation(formData));
      const errors = result.current.validateStep('basics');

      expect(errors.posterImageUrl).toBeUndefined();
    });

    it('should validate external link format when provided', () => {
      const formData = createValidFormData();
      formData.externalLink = 'invalid-url';

      const { result } = renderHook(() => useEventValidation(formData));
      const errors = result.current.validateStep('basics');

      expect(errors.externalLink).toBe('External link must be a valid URL.');
    });

    it('should accept valid external link', () => {
      const formData = createValidFormData();
      formData.externalLink = 'https://tickets.example.com';

      const { result } = renderHook(() => useEventValidation(formData));
      const errors = result.current.validateStep('basics');

      expect(errors.externalLink).toBeUndefined();
    });

    it('should allow empty external link', () => {
      const formData = createValidFormData();
      formData.externalLink = '';

      const { result } = renderHook(() => useEventValidation(formData));
      const errors = result.current.validateStep('basics');

      expect(errors.externalLink).toBeUndefined();
    });
  });

  describe('schedule step validation', () => {
    it('should require start date', () => {
      const formData = createValidFormData();
      formData.startsAt = '';

      const { result } = renderHook(() => useEventValidation(formData));
      const errors = result.current.validateStep('schedule');

      expect(errors.startsAt).toBe('Start date/time is required.');
    });

    it('should require venue selection', () => {
      const formData = createValidFormData();
      formData.venueId = '';

      const { result } = renderHook(() => useEventValidation(formData));
      const errors = result.current.validateStep('schedule');

      expect(errors.venueId).toBe('Select a venue to continue.');
    });

    it('should validate end time is after start time', () => {
      const formData = createValidFormData();
      formData.startsAt = '2025-12-01T19:00';
      formData.endsAt = '2025-12-01T18:00'; // Before start

      const { result } = renderHook(() => useEventValidation(formData));
      const errors = result.current.validateStep('schedule');

      expect(errors.endsAt).toBe('End time must be after the start time.');
    });

    it('should validate end time equal to start time is invalid', () => {
      const formData = createValidFormData();
      formData.startsAt = '2025-12-01T19:00';
      formData.endsAt = '2025-12-01T19:00'; // Same time

      const { result } = renderHook(() => useEventValidation(formData));
      const errors = result.current.validateStep('schedule');

      expect(errors.endsAt).toBe('End time must be after the start time.');
    });

    it('should accept valid time range', () => {
      const formData = createValidFormData();
      formData.startsAt = '2025-12-01T19:00';
      formData.endsAt = '2025-12-01T23:00';

      const { result } = renderHook(() => useEventValidation(formData));
      const errors = result.current.validateStep('schedule');

      expect(errors.endsAt).toBeUndefined();
    });

    it('should require maps link', () => {
      const formData = createValidFormData();
      formData.mapsLink = '';

      const { result } = renderHook(() => useEventValidation(formData));
      const errors = result.current.validateStep('schedule');

      expect(errors.mapsLink).toBe('Maps link is required for the venue.');
    });

    it('should validate maps link format', () => {
      const formData = createValidFormData();
      formData.mapsLink = 'not-a-valid-url';

      const { result } = renderHook(() => useEventValidation(formData));
      const errors = result.current.validateStep('schedule');

      expect(errors.mapsLink).toBe('Maps link must be a valid URL.');
    });

    it('should accept valid maps link', () => {
      const formData = createValidFormData();
      formData.mapsLink = 'https://maps.google.com/?q=test+venue';

      const { result } = renderHook(() => useEventValidation(formData));
      const errors = result.current.validateStep('schedule');

      expect(errors.mapsLink).toBeUndefined();
    });
  });

  describe('tickets step validation', () => {
    it('should require ticket name', () => {
      const formData = createValidFormData();
      formData.ticketTypes[0].name = '';

      const { result } = renderHook(() => useEventValidation(formData));
      const errors = result.current.validateStep('tickets');

      expect(errors['ticketTypes.ticket-1.name']).toBe('Ticket name is required.');
    });

    it('should require ticket name to be non-whitespace', () => {
      const formData = createValidFormData();
      formData.ticketTypes[0].name = '   ';

      const { result } = renderHook(() => useEventValidation(formData));
      const errors = result.current.validateStep('tickets');

      expect(errors['ticketTypes.ticket-1.name']).toBe('Ticket name is required.');
    });

    it('should enforce unique ticket names (case-insensitive)', () => {
      const formData = createValidFormData();
      formData.ticketTypes.push({
        id: 'ticket-2',
        name: 'vip pass', // Same as first ticket (lowercase)
        description: '',
        pricingType: 'general_admission',
        price: '50.00',
        currency: 'USD',
        capacity: '50',
        salesStart: '',
        salesEnd: '',
        isActive: true,
        perks: [],
      });

      const { result } = renderHook(() => useEventValidation(formData));
      const errors = result.current.validateStep('tickets');

      expect(errors['ticketTypes.ticket-2.name']).toBe('Ticket names must be unique.');
    });

    it('should allow different ticket names', () => {
      const formData = createValidFormData();
      formData.ticketTypes.push({
        id: 'ticket-2',
        name: 'General Admission',
        description: '',
        pricingType: 'general_admission',
        price: '50.00',
        currency: 'USD',
        capacity: '50',
        salesStart: '',
        salesEnd: '',
        isActive: true,
        perks: [],
      });

      const { result } = renderHook(() => useEventValidation(formData));
      const errors = result.current.validateStep('tickets');

      expect(errors['ticketTypes.ticket-1.name']).toBeUndefined();
      expect(errors['ticketTypes.ticket-2.name']).toBeUndefined();
    });

    it('should require price', () => {
      const formData = createValidFormData();
      formData.ticketTypes[0].price = '';

      const { result } = renderHook(() => useEventValidation(formData));
      const errors = result.current.validateStep('tickets');

      expect(errors['ticketTypes.ticket-1.price']).toBe('Enter a price for this ticket.');
    });

    it('should validate price is a valid number', () => {
      const formData = createValidFormData();
      formData.ticketTypes[0].price = 'abc';

      const { result } = renderHook(() => useEventValidation(formData));
      const errors = result.current.validateStep('tickets');

      expect(errors['ticketTypes.ticket-1.price']).toBe('Price must be a valid non-negative number.');
    });

    it('should reject negative price', () => {
      const formData = createValidFormData();
      formData.ticketTypes[0].price = '-10.00';

      const { result } = renderHook(() => useEventValidation(formData));
      const errors = result.current.validateStep('tickets');

      expect(errors['ticketTypes.ticket-1.price']).toBe('Price must be a valid non-negative number.');
    });

    it('should accept zero price (free tickets)', () => {
      const formData = createValidFormData();
      formData.ticketTypes[0].price = '0';

      const { result } = renderHook(() => useEventValidation(formData));
      const errors = result.current.validateStep('tickets');

      expect(errors['ticketTypes.ticket-1.price']).toBeUndefined();
    });

    it('should accept valid decimal price', () => {
      const formData = createValidFormData();
      formData.ticketTypes[0].price = '99.99';

      const { result } = renderHook(() => useEventValidation(formData));
      const errors = result.current.validateStep('tickets');

      expect(errors['ticketTypes.ticket-1.price']).toBeUndefined();
    });

    it('should validate currency format (3 letters)', () => {
      const formData = createValidFormData();
      formData.ticketTypes[0].currency = 'US';

      const { result } = renderHook(() => useEventValidation(formData));
      const errors = result.current.validateStep('tickets');

      expect(errors['ticketTypes.ticket-1.currency']).toBe('Use a three-letter currency code (e.g., USD).');
    });

    it('should accept valid currency codes', () => {
      const formData = createValidFormData();
      formData.ticketTypes[0].currency = 'EUR';

      const { result } = renderHook(() => useEventValidation(formData));
      const errors = result.current.validateStep('tickets');

      expect(errors['ticketTypes.ticket-1.currency']).toBeUndefined();
    });

    it('should require capacity', () => {
      const formData = createValidFormData();
      formData.ticketTypes[0].capacity = '';

      const { result } = renderHook(() => useEventValidation(formData));
      const errors = result.current.validateStep('tickets');

      expect(errors['ticketTypes.ticket-1.capacity']).toBe('Capacity is required.');
    });

    it('should validate capacity is a positive integer', () => {
      const formData = createValidFormData();
      formData.ticketTypes[0].capacity = '0';

      const { result } = renderHook(() => useEventValidation(formData));
      const errors = result.current.validateStep('tickets');

      expect(errors['ticketTypes.ticket-1.capacity']).toBe('Capacity must be a positive whole number.');
    });

    it('should reject negative capacity', () => {
      const formData = createValidFormData();
      formData.ticketTypes[0].capacity = '-50';

      const { result } = renderHook(() => useEventValidation(formData));
      const errors = result.current.validateStep('tickets');

      expect(errors['ticketTypes.ticket-1.capacity']).toBe('Capacity must be a positive whole number.');
    });

    it('should reject decimal capacity', () => {
      const formData = createValidFormData();
      formData.ticketTypes[0].capacity = '50.5';

      const { result } = renderHook(() => useEventValidation(formData));
      const errors = result.current.validateStep('tickets');

      expect(errors['ticketTypes.ticket-1.capacity']).toBe('Capacity must be a positive whole number.');
    });

    it('should validate sales end is after sales start', () => {
      const formData = createValidFormData();
      formData.ticketTypes[0].salesStart = '2025-11-01T10:00';
      formData.ticketTypes[0].salesEnd = '2025-11-01T09:00'; // Before start

      const { result } = renderHook(() => useEventValidation(formData));
      const errors = result.current.validateStep('tickets');

      expect(errors['ticketTypes.ticket-1.salesEnd']).toBe('Sales end must be after the start.');
    });

    it('should accept valid sales window', () => {
      const formData = createValidFormData();
      formData.ticketTypes[0].salesStart = '2025-11-01T10:00';
      formData.ticketTypes[0].salesEnd = '2025-12-01T10:00';

      const { result } = renderHook(() => useEventValidation(formData));
      const errors = result.current.validateStep('tickets');

      expect(errors['ticketTypes.ticket-1.salesEnd']).toBeUndefined();
    });

    describe('perk validation', () => {
      it('should require perk name', () => {
        const formData = createValidFormData();
        formData.ticketTypes[0].perks.push({
          id: 'perk-1',
          name: '',
          description: 'Free drink',
          instructions: 'Redeem at bar',
          quantity: '1',
        });

        const { result } = renderHook(() => useEventValidation(formData));
        const errors = result.current.validateStep('tickets');

        expect(errors['ticketTypes.ticket-1.perks.perk-1.name']).toBe('Perk name is required.');
      });

      it('should require perk name to be non-whitespace', () => {
        const formData = createValidFormData();
        formData.ticketTypes[0].perks.push({
          id: 'perk-1',
          name: '   ',
          description: 'Free drink',
          instructions: 'Redeem at bar',
          quantity: '1',
        });

        const { result } = renderHook(() => useEventValidation(formData));
        const errors = result.current.validateStep('tickets');

        expect(errors['ticketTypes.ticket-1.perks.perk-1.name']).toBe('Perk name is required.');
      });

      it('should validate perk quantity is at least 1', () => {
        const formData = createValidFormData();
        formData.ticketTypes[0].perks.push({
          id: 'perk-1',
          name: 'Free Drink',
          description: '',
          instructions: '',
          quantity: '0',
        });

        const { result } = renderHook(() => useEventValidation(formData));
        const errors = result.current.validateStep('tickets');

        expect(errors['ticketTypes.ticket-1.perks.perk-1.quantity']).toBe('Quantity must be at least 1.');
      });

      it('should validate perk description length', () => {
        const formData = createValidFormData();
        formData.ticketTypes[0].perks.push({
          id: 'perk-1',
          name: 'VIP Access',
          description: 'a'.repeat(501), // 501 characters
          instructions: '',
          quantity: '1',
        });

        const { result } = renderHook(() => useEventValidation(formData));
        const errors = result.current.validateStep('tickets');

        expect(errors['ticketTypes.ticket-1.perks.perk-1.description']).toBe('Description must be 500 characters or fewer.');
      });

      it('should validate perk instructions length', () => {
        const formData = createValidFormData();
        formData.ticketTypes[0].perks.push({
          id: 'perk-1',
          name: 'VIP Access',
          description: 'Access to VIP lounge',
          instructions: 'a'.repeat(501), // 501 characters
          quantity: '1',
        });

        const { result } = renderHook(() => useEventValidation(formData));
        const errors = result.current.validateStep('tickets');

        expect(errors['ticketTypes.ticket-1.perks.perk-1.instructions']).toBe('Instructions must be 500 characters or fewer.');
      });

      it('should accept valid perks', () => {
        const formData = createValidFormData();
        formData.ticketTypes[0].perks.push({
          id: 'perk-1',
          name: 'VIP Access',
          description: 'Access to VIP lounge',
          instructions: 'Show ticket at VIP entrance',
          quantity: '1',
        });

        const { result } = renderHook(() => useEventValidation(formData));
        const errors = result.current.validateStep('tickets');

        expect(errors['ticketTypes.ticket-1.perks.perk-1.name']).toBeUndefined();
        expect(errors['ticketTypes.ticket-1.perks.perk-1.quantity']).toBeUndefined();
      });
    });
  });

  describe('posters step validation', () => {
    it('should require all ticket types to have approved posters', () => {
      const formData = createValidFormData();
      formData.posterVariants[0].isApproved = false;

      const { result } = renderHook(() => useEventValidation(formData));
      const errors = result.current.validateStep('posters');

      expect(errors.posters).toContain('VIP Pass');
    });

    it('should detect missing poster variants', () => {
      const formData = createValidFormData();
      formData.ticketTypes.push({
        id: 'ticket-2',
        name: 'General Admission',
        description: '',
        pricingType: 'general_admission',
        price: '50.00',
        currency: 'USD',
        capacity: '100',
        salesStart: '',
        salesEnd: '',
        isActive: true,
        perks: [],
      });
      // No poster variant for ticket-2

      const { result } = renderHook(() => useEventValidation(formData));
      const errors = result.current.validateStep('posters');

      expect(errors.posters).toContain('General Admission');
    });

    it('should pass when all tickets have approved posters', () => {
      const formData = createValidFormData();
      formData.posterVariants[0].isApproved = true;

      const { result } = renderHook(() => useEventValidation(formData));
      const errors = result.current.validateStep('posters');

      expect(errors.posters).toBeUndefined();
    });

    it('should list all tickets with missing/unapproved posters', () => {
      const formData = createValidFormData();
      formData.ticketTypes.push({
        id: 'ticket-2',
        name: 'General Admission',
        description: '',
        pricingType: 'general_admission',
        price: '50.00',
        currency: 'USD',
        capacity: '100',
        salesStart: '',
        salesEnd: '',
        isActive: true,
        perks: [],
      });
      formData.ticketTypes.push({
        id: 'ticket-3',
        name: 'Premium',
        description: '',
        pricingType: 'general_admission',
        price: '75.00',
        currency: 'USD',
        capacity: '50',
        salesStart: '',
        salesEnd: '',
        isActive: true,
        perks: [],
      });

      const { result } = renderHook(() => useEventValidation(formData));
      const errors = result.current.validateStep('posters');

      expect(errors.posters).toContain('General Admission');
      expect(errors.posters).toContain('Premium');
    });
  });

  describe('review step validation', () => {
    it('should validate status is draft or published', () => {
      const formData = createValidFormData();
      // @ts-expect-error - Testing invalid status
      formData.status = 'invalid';

      const { result } = renderHook(() => useEventValidation(formData));
      const errors = result.current.validateStep('review');

      expect(errors.status).toBe('Select whether to keep this as a draft or publish it.');
    });

    it('should accept draft status', () => {
      const formData = createValidFormData();
      formData.status = 'draft';

      const { result } = renderHook(() => useEventValidation(formData));
      const errors = result.current.validateStep('review');

      expect(errors.status).toBeUndefined();
    });

    it('should accept published status', () => {
      const formData = createValidFormData();
      formData.status = 'published';

      const { result } = renderHook(() => useEventValidation(formData));
      const errors = result.current.validateStep('review');

      expect(errors.status).toBeUndefined();
    });
  });

  describe('error clearing', () => {
    it('should clear all errors', () => {
      const formData = createValidFormData();
      formData.title = ''; // Create an error

      const { result } = renderHook(() => useEventValidation(formData));

      // Validate to create errors
      act(() => {
        result.current.validateStep('basics');
      });
      expect(result.current.errors.title).toBe('Event title is required.');

      // Clear errors
      act(() => {
        result.current.clearErrors();
      });
      expect(Object.keys(result.current.errors)).toHaveLength(0);
    });
  });

  describe('errors state management', () => {
    it('should expose errors object', () => {
      const formData = createValidFormData();
      formData.title = '';

      const { result } = renderHook(() => useEventValidation(formData));

      act(() => {
        result.current.validateStep('basics');
      });

      expect(result.current.errors).toHaveProperty('title');
    });

    it('should update errors after validation', () => {
      const formData = createValidFormData();
      formData.title = '';

      const { result } = renderHook(() => useEventValidation(formData));

      expect(Object.keys(result.current.errors)).toHaveLength(0);

      act(() => {
        result.current.validateStep('basics');
      });

      expect(Object.keys(result.current.errors).length).toBeGreaterThan(0);
    });
  });
});
