import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TicketsStep } from '../TicketsStep';
import type { TicketTypeForm, Venue } from '@/app/events/new/types';

describe('TicketsStep', () => {
  const mockVenue: Venue = {
    id: '1',
    name: 'Test Venue',
    slug: 'test-venue',
    city: 'New York',
    capacity: 500,
  };

  const mockTicket: TicketTypeForm = {
    id: 'ticket-1',
    name: 'General Admission',
    description: 'Standard entry',
    price: '50',
    currency: 'USD',
    capacity: '100',
    salesStart: '2025-11-01T00:00',
    salesEnd: '2025-12-01T23:59',
    perks: [],
  };

  const mockProps = {
    ticketTypes: [mockTicket],
    errors: {},
    selectedVenue: mockVenue,
    handlers: {
      onAddTicket: vi.fn(),
      onRemoveTicket: vi.fn(),
      onUpdateTicket: vi.fn(),
      onAddPerk: vi.fn(),
      onUpdatePerk: vi.fn(),
      onRemovePerk: vi.fn(),
    },
  };

  describe('rendering', () => {
    it('should render step description', () => {
      render(<TicketsStep {...mockProps} />);

      expect(screen.getByText(/configure ticket tiers/i)).toBeInTheDocument();
    });

    it('should render add ticket button', () => {
      render(<TicketsStep {...mockProps} />);

      expect(screen.getByRole('button', { name: /add ticket tier/i })).toBeInTheDocument();
    });

    it('should render ticket type cards', () => {
      render(<TicketsStep {...mockProps} />);

      expect(screen.getByText(/ticket tier #1/i)).toBeInTheDocument();
    });

    it('should show capacity warning section', () => {
      render(<TicketsStep {...mockProps} />);

      expect(screen.getByText(/capacity overview/i)).toBeInTheDocument();
    });
  });

  describe('ticket management', () => {
    it('should call onAddTicket when add button is clicked', () => {
      render(<TicketsStep {...mockProps} />);

      const addButton = screen.getByRole('button', { name: /add ticket tier/i });
      fireEvent.click(addButton);

      expect(mockProps.handlers.onAddTicket).toHaveBeenCalled();
    });

    it('should render multiple ticket tiers', () => {
      const propsWithMultiple = {
        ...mockProps,
        ticketTypes: [
          mockTicket,
          { ...mockTicket, id: 'ticket-2', name: 'VIP' },
        ],
      };

      render(<TicketsStep {...propsWithMultiple} />);

      expect(screen.getByText(/ticket tier #1/i)).toBeInTheDocument();
      expect(screen.getByText(/ticket tier #2/i)).toBeInTheDocument();
    });

    it('should pass correct handlers to ticket cards', () => {
      render(<TicketsStep {...mockProps} />);

      // Verify TicketTypeCard is rendered by checking for ticket tier heading
      expect(screen.getByText(/ticket tier #1 - general admission/i)).toBeInTheDocument();
    });
  });

  describe('capacity validation', () => {
    it('should show total capacity', () => {
      render(<TicketsStep {...mockProps} />);

      expect(screen.getByText(/total tickets: 100/i)).toBeInTheDocument();
    });

    it('should calculate total capacity correctly', () => {
      const propsWithMultiple = {
        ...mockProps,
        ticketTypes: [
          { ...mockTicket, capacity: '100' },
          { ...mockTicket, id: 'ticket-2', capacity: '150' },
        ],
      };

      render(<TicketsStep {...propsWithMultiple} />);

      expect(screen.getByText(/total tickets: 250/i)).toBeInTheDocument();
    });

    it('should show venue capacity', () => {
      render(<TicketsStep {...mockProps} />);

      expect(screen.getByText(/venue capacity: 500/i)).toBeInTheDocument();
    });

    it('should show warning when exceeding venue capacity', () => {
      const propsExceeding = {
        ...mockProps,
        ticketTypes: [
          { ...mockTicket, capacity: '600' },
        ],
      };

      render(<TicketsStep {...propsExceeding} />);

      expect(screen.getByText(/exceeds venue capacity/i)).toBeInTheDocument();
    });

    it('should not show warning when within capacity', () => {
      render(<TicketsStep {...mockProps} />);

      expect(screen.queryByText(/exceeds venue capacity/i)).not.toBeInTheDocument();
    });

    it('should handle invalid capacity values', () => {
      const propsWithInvalid = {
        ...mockProps,
        ticketTypes: [
          { ...mockTicket, capacity: 'invalid' },
        ],
      };

      render(<TicketsStep {...propsWithInvalid} />);

      expect(screen.getByText(/total tickets: 0/i)).toBeInTheDocument();
    });

    it('should handle empty capacity values', () => {
      const propsWithEmpty = {
        ...mockProps,
        ticketTypes: [
          { ...mockTicket, capacity: '' },
        ],
      };

      render(<TicketsStep {...propsWithEmpty} />);

      expect(screen.getByText(/total tickets: 0/i)).toBeInTheDocument();
    });
  });

  describe('validation errors', () => {
    it('should render with errors without crashing', () => {
      const propsWithErrors = {
        ...mockProps,
        errors: {
          'ticketTypes.ticket-1.name': 'Name is required',
          'ticketTypes.ticket-1.price': 'Invalid price',
        },
      };

      render(<TicketsStep {...propsWithErrors} />);

      // TicketTypeCard should receive errors (error display is tested in TicketTypeCard tests)
      expect(screen.getByText(/ticket tier #1/i)).toBeInTheDocument();
    });

    it('should handle multiple tickets with errors', () => {
      const propsWithErrors = {
        ...mockProps,
        ticketTypes: [
          mockTicket,
          { ...mockTicket, id: 'ticket-2', name: 'VIP' },
        ],
        errors: {
          'ticketTypes.ticket-1.name': 'Error 1',
          'ticketTypes.ticket-2.price': 'Error 2',
        },
      };

      render(<TicketsStep {...propsWithErrors} />);

      // Both tickets should render
      expect(screen.getByText(/ticket tier #1/i)).toBeInTheDocument();
      expect(screen.getByText(/ticket tier #2/i)).toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('should show message when no tickets', () => {
      const propsWithNoTickets = {
        ...mockProps,
        ticketTypes: [],
      };

      render(<TicketsStep {...propsWithNoTickets} />);

      expect(screen.getByText(/no ticket tiers yet/i)).toBeInTheDocument();
    });

    it('should show add button in empty state', () => {
      const propsWithNoTickets = {
        ...mockProps,
        ticketTypes: [],
      };

      render(<TicketsStep {...propsWithNoTickets} />);

      expect(screen.getByRole('button', { name: /add ticket tier/i })).toBeInTheDocument();
    });
  });

  describe('venue context', () => {
    it('should display venue name in capacity section', () => {
      render(<TicketsStep {...mockProps} />);

      expect(screen.getByText(/test venue/i)).toBeInTheDocument();
    });

    it('should handle null venue gracefully', () => {
      const propsWithoutVenue = {
        ...mockProps,
        selectedVenue: null,
      };

      render(<TicketsStep {...propsWithoutVenue} />);

      expect(screen.getByText(/no venue selected/i)).toBeInTheDocument();
    });

    it('should show capacity info only when venue is selected', () => {
      const propsWithoutVenue = {
        ...mockProps,
        selectedVenue: null,
      };

      render(<TicketsStep {...propsWithoutVenue} />);

      expect(screen.queryByText(/venue capacity:/i)).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have accessible add button', () => {
      render(<TicketsStep {...mockProps} />);

      const addButton = screen.getByRole('button', { name: /add ticket tier/i });
      expect(addButton).toBeInTheDocument();
    });

    it('should provide context for capacity warnings', () => {
      const propsExceeding = {
        ...mockProps,
        ticketTypes: [
          { ...mockTicket, capacity: '600' },
        ],
      };

      render(<TicketsStep {...propsExceeding} />);

      const warning = screen.getByText(/exceeds venue capacity/i);
      expect(warning).toHaveClass('text-red-600');
    });
  });

  describe('ticket limits', () => {
    it('should allow adding up to maximum ticket tiers', () => {
      const manyTickets = Array.from({ length: 5 }, (_, i) => ({
        ...mockTicket,
        id: `ticket-${i + 1}`,
        name: `Ticket ${i + 1}`,
      }));

      const propsWithMany = {
        ...mockProps,
        ticketTypes: manyTickets,
      };

      render(<TicketsStep {...propsWithMany} />);

      expect(screen.getByText(/ticket tier #1/i)).toBeInTheDocument();
      expect(screen.getByText(/ticket tier #5/i)).toBeInTheDocument();
    });
  });

  describe('capacity display', () => {
    it('should show percentage of venue capacity used', () => {
      const props = {
        ...mockProps,
        ticketTypes: [
          { ...mockTicket, capacity: '250' }, // 50% of 500
        ],
      };

      render(<TicketsStep {...props} />);

      expect(screen.getByText(/50%/i)).toBeInTheDocument();
    });

    it('should show 100% when at capacity', () => {
      const props = {
        ...mockProps,
        ticketTypes: [
          { ...mockTicket, capacity: '500' },
        ],
      };

      render(<TicketsStep {...props} />);

      expect(screen.getByText(/100%/i)).toBeInTheDocument();
    });

    it('should show over 100% when exceeding', () => {
      const props = {
        ...mockProps,
        ticketTypes: [
          { ...mockTicket, capacity: '600' },
        ],
      };

      render(<TicketsStep {...props} />);

      expect(screen.getByText(/120%/i)).toBeInTheDocument();
    });
  });

  describe('helper text', () => {
    it('should show helper text about ticket tiers', () => {
      render(<TicketsStep {...mockProps} />);

      expect(screen.getByText(/create different ticket tiers/i)).toBeInTheDocument();
    });

    it('should show guidance when no venue selected', () => {
      const propsWithoutVenue = {
        ...mockProps,
        selectedVenue: null,
      };

      render(<TicketsStep {...propsWithoutVenue} />);

      expect(screen.getByText(/select a venue.*to see capacity/i)).toBeInTheDocument();
    });
  });
});
