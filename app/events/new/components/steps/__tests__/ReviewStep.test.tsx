import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReviewStep } from '../ReviewStep';
import type { EventFormData } from '@/app/events/new/types';

describe('ReviewStep', () => {
  // Generate dates that are guaranteed to be in the future
  const futureDate = new Date();
  futureDate.setFullYear(futureDate.getFullYear() + 1); // 1 year in the future
  const futureStartDate = futureDate.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:mm

  const futureEndDate = new Date(futureDate);
  futureEndDate.setHours(futureEndDate.getHours() + 5);
  const futureEndString = futureEndDate.toISOString().slice(0, 16);

  const futureDoorsDate = new Date(futureDate);
  futureDoorsDate.setHours(futureDoorsDate.getHours() - 1);
  const futureDoorsString = futureDoorsDate.toISOString().slice(0, 16);

  const mockFormData: EventFormData = {
    title: 'Summer Music Festival',
    primaryArtistId: '1',
    posterImageUrl: 'https://example.com/poster.jpg',
    externalLink: 'https://eventbrite.com/summer',
    startsAt: futureStartDate,
    endsAt: futureEndString,
    doorsOpen: futureDoorsString,
    venueId: '1',
    mapsLink: 'https://maps.google.com/venue',
    status: 'draft' as 'draft' | 'published',
    ticketTypes: [
      {
        id: 'ticket-1',
        name: 'General Admission',
        description: 'Standard entry',
        price: '50',
        currency: 'USD',
        capacity: '100',
        salesStart: '2025-06-01T00:00',
        salesEnd: futureStartDate,
        perks: [],
        pricingType: 'fixed' as const,
        isActive: true,
      },
    ],
    posterVariants: [],
  };

  const mockProps = {
    formData: mockFormData,
    selectedArtist: { id: '1', name: 'Taylor Swift', slug: 'taylor-swift', genre: 'Pop' },
    selectedVenue: { id: '1', name: 'Madison Square Garden', slug: 'msg', city: 'New York', capacity: 20000 },
  };

  describe('rendering', () => {
    it('should render step description', () => {
      render(<ReviewStep {...mockProps} />);

      expect(screen.getByText(/verify the payload/i)).toBeInTheDocument();
    });

    it('should show all section headings', () => {
      render(<ReviewStep {...mockProps} />);

      expect(screen.getByText(/^event details$/i)).toBeInTheDocument();
      expect(screen.getByText(/^schedule$/i)).toBeInTheDocument();
      expect(screen.getByText(/^tickets$/i)).toBeInTheDocument();
    });
  });

  describe('event details section', () => {
    it('should display event title', () => {
      render(<ReviewStep {...mockProps} />);

      expect(screen.getByText('Summer Music Festival')).toBeInTheDocument();
    });

    it('should display artist name', () => {
      render(<ReviewStep {...mockProps} />);

      expect(screen.getByText('Taylor Swift')).toBeInTheDocument();
    });

    it('should display poster URL when available', () => {
      render(<ReviewStep {...mockProps} />);

      // Just check that the URL is displayed - the label will be there too
      expect(screen.getByText(/example\.com\/poster\.jpg/i)).toBeInTheDocument();
    });

    it('should show "None" when no poster', () => {
      const propsNoPoster = {
        ...mockProps,
        formData: {
          ...mockFormData,
          posterImageUrl: '',
        },
      };

      render(<ReviewStep {...propsNoPoster} />);

      // Should show "None" when no poster
      expect(screen.getByText('None')).toBeInTheDocument();
    });

    it('should display external link when available', () => {
      render(<ReviewStep {...mockProps} />);

      expect(screen.getByText(/eventbrite\.com\/summer/i)).toBeInTheDocument();
    });

    it('should show "None" when no external link', () => {
      const propsNoLink = {
        ...mockProps,
        formData: {
          ...mockFormData,
          externalLink: '',
        },
      };

      render(<ReviewStep {...propsNoLink} />);

      // Should show "None" when no external link
      expect(screen.getAllByText('None').length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('schedule section', () => {
    it('should display venue name', () => {
      render(<ReviewStep {...mockProps} />);

      expect(screen.getByText(/madison square garden/i)).toBeInTheDocument();
    });

    it('should display venue city', () => {
      render(<ReviewStep {...mockProps} />);

      expect(screen.getByText(/new york/i)).toBeInTheDocument();
    });

    it('should display start time', () => {
      render(<ReviewStep {...mockProps} />);

      expect(screen.getByText(/start time/i)).toBeInTheDocument();
    });

    it('should display doors open time', () => {
      render(<ReviewStep {...mockProps} />);

      expect(screen.getByText(/doors open/i)).toBeInTheDocument();
    });

    it('should show "Not specified" when no end time', () => {
      const propsNoEnd = {
        ...mockProps,
        formData: {
          ...mockFormData,
          endsAt: '',
        },
      };

      render(<ReviewStep {...propsNoEnd} />);

      expect(screen.getByText(/end time/i)).toBeInTheDocument();
      expect(screen.getByText(/not specified/i)).toBeInTheDocument();
    });
  });

  describe('tickets section', () => {
    it('should display ticket count', () => {
      render(<ReviewStep {...mockProps} />);

      expect(screen.getByText(/1 ticket tier/i)).toBeInTheDocument();
    });

    it('should display ticket name', () => {
      render(<ReviewStep {...mockProps} />);

      expect(screen.getByText('General Admission')).toBeInTheDocument();
    });

    it('should display ticket price with currency', () => {
      render(<ReviewStep {...mockProps} />);

      expect(screen.getByText(/\$50\.00/i)).toBeInTheDocument();
    });

    it('should display ticket capacity', () => {
      render(<ReviewStep {...mockProps} />);

      expect(screen.getByText(/100 tickets/i)).toBeInTheDocument();
    });

    it('should handle multiple ticket tiers', () => {
      const propsMultiple = {
        ...mockProps,
        formData: {
          ...mockFormData,
          ticketTypes: [
            mockFormData.ticketTypes[0],
            { ...mockFormData.ticketTypes[0], id: 'ticket-2', name: 'VIP', price: '150' },
          ],
        },
      };

      render(<ReviewStep {...propsMultiple} />);

      expect(screen.getByText(/2 ticket tiers/i)).toBeInTheDocument();
      expect(screen.getByText('General Admission')).toBeInTheDocument();
      expect(screen.getByText('VIP')).toBeInTheDocument();
    });

    it('should display total capacity', () => {
      render(<ReviewStep {...mockProps} />);

      expect(screen.getByText(/total capacity: 100/i)).toBeInTheDocument();
    });
  });

  describe('formatting', () => {
    it('should format dates nicely', () => {
      render(<ReviewStep {...mockProps} />);

      // Should show formatted date with year (getAllByText because multiple dates)
      expect(screen.getAllByText(/202\d/).length).toBeGreaterThanOrEqual(1);
    });

    it('should format prices with currency symbol', () => {
      render(<ReviewStep {...mockProps} />);

      expect(screen.getByText(/\$/)).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle missing optional fields', () => {
      const propsMinimal = {
        ...mockProps,
        formData: {
          ...mockFormData,
          posterImageUrl: '',
          externalLink: '',
          endsAt: '',
          doorsOpen: '',
        },
      };

      render(<ReviewStep {...propsMinimal} />);

      expect(screen.getByText(/verify the payload/i)).toBeInTheDocument();
    });

    it('should handle null artist gracefully', () => {
      const propsNoArtist = {
        ...mockProps,
        selectedArtist: null,
      };

      render(<ReviewStep {...propsNoArtist} />);

      expect(screen.getByText(/unknown artist/i)).toBeInTheDocument();
    });

    it('should handle null venue gracefully', () => {
      const propsNoVenue = {
        ...mockProps,
        selectedVenue: null,
      };

      render(<ReviewStep {...propsNoVenue} />);

      expect(screen.getByText(/unknown venue/i)).toBeInTheDocument();
    });

    it('should handle empty ticket array', () => {
      const propsNoTickets = {
        ...mockProps,
        formData: {
          ...mockFormData,
          ticketTypes: [],
        },
      };

      render(<ReviewStep {...propsNoTickets} />);

      expect(screen.getByText(/0 ticket tiers/i)).toBeInTheDocument();
    });
  });

  describe('visual organization', () => {
    it('should use sections for better readability', () => {
      render(<ReviewStep {...mockProps} />);

      const sections = screen.getAllByRole('heading', { level: 3 });
      expect(sections.length).toBeGreaterThan(0);
    });

    it('should show helper text', () => {
      render(<ReviewStep {...mockProps} />);

      expect(screen.getByText(/please review all information carefully/i)).toBeInTheDocument();
    });
  });

  describe('publication status', () => {
    const mockHandlers = {
      onStatusChange: vi.fn(),
    };

    const propsWithHandlers = {
      ...mockProps,
      handlers: mockHandlers,
    };

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should render status selector', () => {
      render(<ReviewStep {...propsWithHandlers} />);

      expect(screen.getByText(/save as draft/i)).toBeInTheDocument();
      expect(screen.getByText(/publish now/i)).toBeInTheDocument();
    });

    it('should show blockchain readiness checklist', () => {
      render(<ReviewStep {...propsWithHandlers} />);

      expect(screen.getByText(/blockchain readiness/i)).toBeInTheDocument();
    });

    it('should call onStatusChange when draft is selected', () => {
      render(<ReviewStep {...propsWithHandlers} />);

      const draftButton = screen.getByRole('button', { name: /save as draft/i });
      fireEvent.click(draftButton);

      expect(mockHandlers.onStatusChange).toHaveBeenCalledWith('draft');
    });

    it('should call onStatusChange when publish is selected', () => {
      render(<ReviewStep {...propsWithHandlers} />);

      const publishButton = screen.getByRole('button', { name: /publish now/i });
      fireEvent.click(publishButton);

      expect(mockHandlers.onStatusChange).toHaveBeenCalledWith('published');
    });

    it('should display validation errors when event not ready', () => {
      const propsNotReady = {
        ...propsWithHandlers,
        formData: {
          ...mockFormData,
          venueId: '',
        },
        selectedVenue: null,
      };

      render(<ReviewStep {...propsNotReady} />);

      expect(screen.getByText(/event must have a venue/i)).toBeInTheDocument();
    });

    it('should show all blockchain readiness checks', () => {
      render(<ReviewStep {...propsWithHandlers} />);

      // Check for specific blockchain readiness check text
      expect(screen.getByText(/venue selected/i)).toBeInTheDocument();
      expect(screen.getByText(/artist selected/i)).toBeInTheDocument();
      expect(screen.getByText(/genre set/i)).toBeInTheDocument();
      expect(screen.getByText(/future date/i)).toBeInTheDocument();
      expect(screen.getByText(/ticket types configured/i)).toBeInTheDocument();
    });
  });
});
