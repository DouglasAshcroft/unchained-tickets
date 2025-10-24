import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEventFormState } from '../useEventFormState';

describe('useEventFormState', () => {
  describe('initialization', () => {
    it('should initialize with default empty state', () => {
      const { result } = renderHook(() => useEventFormState());

      expect(result.current.formData.title).toBe('');
      expect(result.current.formData.posterImageUrl).toBe('');
      expect(result.current.formData.externalLink).toBe('');
      expect(result.current.formData.mapsLink).toBe('');
      expect(result.current.formData.startsAt).toBe('');
      expect(result.current.formData.endsAt).toBe('');
      expect(result.current.formData.venueId).toBe('');
      expect(result.current.formData.primaryArtistId).toBe('');
      expect(result.current.formData.status).toBe('draft');
    });

    it('should initialize with one empty ticket type', () => {
      const { result } = renderHook(() => useEventFormState());

      expect(result.current.formData.ticketTypes).toHaveLength(1);
      expect(result.current.formData.ticketTypes[0].name).toBe('');
      expect(result.current.formData.ticketTypes[0].price).toBe('');
      expect(result.current.formData.ticketTypes[0].capacity).toBe('');
      expect(result.current.formData.ticketTypes[0].perks).toEqual([]);
    });

    it('should initialize with empty poster variants', () => {
      const { result } = renderHook(() => useEventFormState());

      expect(result.current.formData.posterVariants).toEqual([]);
    });
  });

  describe('basic field updates', () => {
    it('should update title field', () => {
      const { result } = renderHook(() => useEventFormState());

      act(() => {
        result.current.updateField('title', 'Summer Concert 2025');
      });

      expect(result.current.formData.title).toBe('Summer Concert 2025');
    });

    it('should update posterImageUrl field', () => {
      const { result } = renderHook(() => useEventFormState());

      act(() => {
        result.current.updateField('posterImageUrl', 'https://example.com/poster.jpg');
      });

      expect(result.current.formData.posterImageUrl).toBe('https://example.com/poster.jpg');
    });

    it('should update venueId field', () => {
      const { result } = renderHook(() => useEventFormState());

      act(() => {
        result.current.updateField('venueId', '42');
      });

      expect(result.current.formData.venueId).toBe('42');
    });

    it('should update status field', () => {
      const { result } = renderHook(() => useEventFormState());

      act(() => {
        result.current.updateField('status', 'published');
      });

      expect(result.current.formData.status).toBe('published');
    });

    it('should not mutate other fields when updating one field', () => {
      const { result } = renderHook(() => useEventFormState());

      act(() => {
        result.current.updateField('title', 'Test');
        result.current.updateField('venueId', '1');
      });

      expect(result.current.formData.title).toBe('Test');
      expect(result.current.formData.venueId).toBe('1');
      expect(result.current.formData.posterImageUrl).toBe('');
    });
  });

  describe('ticket type management', () => {
    it('should add a new ticket type', () => {
      const { result } = renderHook(() => useEventFormState());

      const initialLength = result.current.formData.ticketTypes.length;

      act(() => {
        result.current.addTicketType();
      });

      expect(result.current.formData.ticketTypes).toHaveLength(initialLength + 1);
    });

    it('should add ticket type with unique ID', () => {
      const { result } = renderHook(() => useEventFormState());

      act(() => {
        result.current.addTicketType();
      });

      const ids = result.current.formData.ticketTypes.map(t => t.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should update ticket type field', () => {
      const { result } = renderHook(() => useEventFormState());

      const ticketId = result.current.formData.ticketTypes[0].id;

      act(() => {
        result.current.updateTicketField(ticketId, 'name', 'VIP Pass');
      });

      expect(result.current.formData.ticketTypes[0].name).toBe('VIP Pass');
    });

    it('should update multiple ticket type fields independently', () => {
      const { result } = renderHook(() => useEventFormState());

      act(() => {
        result.current.addTicketType();
      });

      const [ticket1, ticket2] = result.current.formData.ticketTypes;

      act(() => {
        result.current.updateTicketField(ticket1.id, 'name', 'VIP');
        result.current.updateTicketField(ticket2.id, 'name', 'GA');
        result.current.updateTicketField(ticket1.id, 'price', '100.00');
      });

      expect(result.current.formData.ticketTypes[0].name).toBe('VIP');
      expect(result.current.formData.ticketTypes[0].price).toBe('100.00');
      expect(result.current.formData.ticketTypes[1].name).toBe('GA');
    });

    it('should remove ticket type by ID', () => {
      const { result } = renderHook(() => useEventFormState());

      act(() => {
        result.current.addTicketType();
        result.current.addTicketType();
      });

      expect(result.current.formData.ticketTypes).toHaveLength(3);

      const ticketIdToRemove = result.current.formData.ticketTypes[1].id;

      act(() => {
        result.current.removeTicketType(ticketIdToRemove);
      });

      expect(result.current.formData.ticketTypes).toHaveLength(2);
      expect(result.current.formData.ticketTypes.find(t => t.id === ticketIdToRemove)).toBeUndefined();
    });

    it('should not remove last ticket type', () => {
      const { result } = renderHook(() => useEventFormState());

      const ticketId = result.current.formData.ticketTypes[0].id;

      act(() => {
        result.current.removeTicketType(ticketId);
      });

      // Should still have 1 ticket type
      expect(result.current.formData.ticketTypes).toHaveLength(1);
    });

    it('should return warning when trying to remove last ticket type', () => {
      const { result } = renderHook(() => useEventFormState());

      const ticketId = result.current.formData.ticketTypes[0].id;

      let warningMessage: string | undefined;
      act(() => {
        warningMessage = result.current.removeTicketType(ticketId);
      });

      expect(warningMessage).toBe('Keep at least one ticket type');
    });
  });

  describe('perk management', () => {
    it('should add perk to specific ticket', () => {
      const { result } = renderHook(() => useEventFormState());

      const ticketId = result.current.formData.ticketTypes[0].id;

      act(() => {
        result.current.addPerkToTicket(ticketId);
      });

      expect(result.current.formData.ticketTypes[0].perks).toHaveLength(1);
      expect(result.current.formData.ticketTypes[0].perks[0].name).toBe('');
      expect(result.current.formData.ticketTypes[0].perks[0].quantity).toBe('1');
    });

    it('should add multiple perks to same ticket', () => {
      const { result } = renderHook(() => useEventFormState());

      const ticketId = result.current.formData.ticketTypes[0].id;

      act(() => {
        result.current.addPerkToTicket(ticketId);
        result.current.addPerkToTicket(ticketId);
        result.current.addPerkToTicket(ticketId);
      });

      expect(result.current.formData.ticketTypes[0].perks).toHaveLength(3);
    });

    it('should add perks with unique IDs', () => {
      const { result } = renderHook(() => useEventFormState());

      const ticketId = result.current.formData.ticketTypes[0].id;

      act(() => {
        result.current.addPerkToTicket(ticketId);
        result.current.addPerkToTicket(ticketId);
      });

      const perkIds = result.current.formData.ticketTypes[0].perks.map(p => p.id);
      const uniqueIds = new Set(perkIds);

      expect(uniqueIds.size).toBe(perkIds.length);
    });

    it('should update perk field', () => {
      const { result } = renderHook(() => useEventFormState());

      const ticketId = result.current.formData.ticketTypes[0].id;

      act(() => {
        result.current.addPerkToTicket(ticketId);
      });

      const perkId = result.current.formData.ticketTypes[0].perks[0].id;

      act(() => {
        result.current.updatePerkField(ticketId, perkId, 'name', 'Free Drink');
      });

      expect(result.current.formData.ticketTypes[0].perks[0].name).toBe('Free Drink');
    });

    it('should update multiple perk fields', () => {
      const { result } = renderHook(() => useEventFormState());

      const ticketId = result.current.formData.ticketTypes[0].id;

      act(() => {
        result.current.addPerkToTicket(ticketId);
      });

      const perkId = result.current.formData.ticketTypes[0].perks[0].id;

      act(() => {
        result.current.updatePerkField(ticketId, perkId, 'name', 'VIP Access');
        result.current.updatePerkField(ticketId, perkId, 'description', 'Access to VIP lounge');
        result.current.updatePerkField(ticketId, perkId, 'quantity', '2');
      });

      const perk = result.current.formData.ticketTypes[0].perks[0];
      expect(perk.name).toBe('VIP Access');
      expect(perk.description).toBe('Access to VIP lounge');
      expect(perk.quantity).toBe('2');
    });

    it('should remove perk from ticket', () => {
      const { result } = renderHook(() => useEventFormState());

      const ticketId = result.current.formData.ticketTypes[0].id;

      act(() => {
        result.current.addPerkToTicket(ticketId);
        result.current.addPerkToTicket(ticketId);
      });

      const perkIdToRemove = result.current.formData.ticketTypes[0].perks[0].id;

      act(() => {
        result.current.removePerkFromTicket(ticketId, perkIdToRemove);
      });

      expect(result.current.formData.ticketTypes[0].perks).toHaveLength(1);
      expect(result.current.formData.ticketTypes[0].perks.find(p => p.id === perkIdToRemove)).toBeUndefined();
    });

    it('should not affect other tickets when managing perks', () => {
      const { result } = renderHook(() => useEventFormState());

      act(() => {
        result.current.addTicketType();
      });

      const [ticket1, ticket2] = result.current.formData.ticketTypes;

      act(() => {
        result.current.addPerkToTicket(ticket1.id);
        result.current.addPerkToTicket(ticket2.id);
        result.current.addPerkToTicket(ticket2.id);
      });

      expect(result.current.formData.ticketTypes[0].perks).toHaveLength(1);
      expect(result.current.formData.ticketTypes[1].perks).toHaveLength(2);
    });
  });

  describe('poster variants', () => {
    it('should add poster variant', () => {
      const { result } = renderHook(() => useEventFormState());

      const variant = {
        ticketTypeId: 'ticket-1',
        ticketTypeName: 'VIP',
        imageUrl: 'data:image/png;base64,abc',
        isApproved: false,
        rarityMultiplier: 2.0,
      };

      act(() => {
        result.current.addPosterVariant(variant);
      });

      expect(result.current.formData.posterVariants).toHaveLength(1);
      expect(result.current.formData.posterVariants[0]).toEqual(variant);
    });

    it('should update poster variant approval', () => {
      const { result } = renderHook(() => useEventFormState());

      const variant = {
        ticketTypeId: 'ticket-1',
        ticketTypeName: 'VIP',
        imageUrl: 'url',
        isApproved: false,
        rarityMultiplier: 2.0,
      };

      act(() => {
        result.current.addPosterVariant(variant);
      });

      act(() => {
        result.current.approvePosterVariant('ticket-1');
      });

      expect(result.current.formData.posterVariants[0].isApproved).toBe(true);
    });

    it('should update poster variant image URL', () => {
      const { result } = renderHook(() => useEventFormState());

      const variant = {
        ticketTypeId: 'ticket-1',
        ticketTypeName: 'VIP',
        imageUrl: 'url1',
        isApproved: false,
        rarityMultiplier: 2.0,
      };

      act(() => {
        result.current.addPosterVariant(variant);
      });

      act(() => {
        result.current.updatePosterVariantImage('ticket-1', 'url2');
      });

      expect(result.current.formData.posterVariants[0].imageUrl).toBe('url2');
    });
  });

  describe('reset functionality', () => {
    it('should reset form to initial state', () => {
      const { result } = renderHook(() => useEventFormState());

      act(() => {
        result.current.updateField('title', 'Test Event');
        result.current.updateField('venueId', '1');
        result.current.addTicketType();
      });

      act(() => {
        result.current.resetForm();
      });

      expect(result.current.formData.title).toBe('');
      expect(result.current.formData.venueId).toBe('');
      expect(result.current.formData.ticketTypes).toHaveLength(1);
      expect(result.current.formData.ticketTypes[0].name).toBe('');
    });
  });

  describe('immutability', () => {
    it('should not mutate original state object', () => {
      const { result } = renderHook(() => useEventFormState());

      const originalTicketId = result.current.formData.ticketTypes[0].id;

      act(() => {
        result.current.updateTicketField(originalTicketId, 'name', 'VIP');
      });

      // Create a new reference to verify immutability
      const ticketsCopy = [...result.current.formData.ticketTypes];

      act(() => {
        result.current.updateTicketField(originalTicketId, 'price', '100');
      });

      // Original copy should not have price field updated
      expect(ticketsCopy[0].price).toBe('');
    });
  });
});
