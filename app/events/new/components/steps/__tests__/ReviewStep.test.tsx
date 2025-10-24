import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReviewStep } from '../ReviewStep';
import type { EventFormData } from '@/app/events/new/types';

describe('ReviewStep', () => {
  const mockFormData: EventFormData = {
    title: 'Summer Music Festival',
    primaryArtistId: '1',
    posterImageUrl: 'https://example.com/poster.jpg',
    externalLink: 'https://eventbrite.com/summer',
    startsAt: '2025-07-15T18:00',
    endsAt: '2025-07-15T23:00',
    doorsOpen: '2025-07-15T17:00',
    venueId: '1',
    mapsLink: 'https://maps.google.com/venue',
    ticketTypes: [
      {
        id: 'ticket-1',
        name: 'General Admission',
        description: 'Standard entry',
        price: '50',
        currency: 'USD',
        capacity: '100',
        salesStart: '2025-06-01T00:00',
        salesEnd: '2025-07-15T18:00',
        perks: [],
      },
    ],
  };

  const mockProps = {
    formData: mockFormData,
    selectedArtist: { id: '1', name: 'Taylor Swift', slug: 'taylor-swift', genre: 'Pop' },
    selectedVenue: { id: '1', name: 'Madison Square Garden', slug: 'msg', city: 'New York', capacity: 20000 },
  };

  describe('rendering', () => {
    it('should render step description', () => {
      render(<ReviewStep {...mockProps} />);

      expect(screen.getByText(/review your event details/i)).toBeInTheDocument();
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

      expect(screen.getByText(/poster:/i)).toBeInTheDocument();
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

      expect(screen.getByText(/poster:/i)).toBeInTheDocument();
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

      expect(screen.getByText(/external link:/i)).toBeInTheDocument();
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

      expect(screen.getByText(/start time:/i)).toBeInTheDocument();
    });

    it('should display doors open time', () => {
      render(<ReviewStep {...mockProps} />);

      expect(screen.getByText(/doors open:/i)).toBeInTheDocument();
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

      expect(screen.getByText(/end time:/i)).toBeInTheDocument();
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

      // Should show formatted date (getAllByText because multiple dates)
      expect(screen.getAllByText(/2025/).length).toBeGreaterThanOrEqual(1);
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

      expect(screen.getByText(/review your event details/i)).toBeInTheDocument();
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

      expect(screen.getByText(/please review all information/i)).toBeInTheDocument();
    });
  });
});
