import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TicketTypeCard } from '../TicketTypeCard';
import type { TicketTypeForm } from '../../../types';

const createMockTicket = (overrides?: Partial<TicketTypeForm>): TicketTypeForm => ({
  id: 'ticket-1',
  name: 'VIP Pass',
  description: 'Premium access to the event',
  price: '50.00',
  currency: 'USD',
  capacity: '100',
  salesStartsAt: '2025-01-01T00:00',
  salesEndsAt: '2025-12-31T23:59',
  perks: [],
  ...overrides,
});

const createMockHandlers = () => ({
  onUpdate: vi.fn(),
  onRemove: vi.fn(),
  onAddPerk: vi.fn(),
  onUpdatePerk: vi.fn(),
  onRemovePerk: vi.fn(),
});

describe('TicketTypeCard', () => {
  describe('rendering', () => {
    it('should render ticket type name input', () => {
      const ticket = createMockTicket();
      const handlers = createMockHandlers();

      render(<TicketTypeCard ticket={ticket} index={0} errors={{}} handlers={handlers} />);

      const nameInput = screen.getByLabelText(/ticket name/i) as HTMLInputElement;
      expect(nameInput.value).toBe('VIP Pass');
    });

    it('should render ticket description textarea', () => {
      const ticket = createMockTicket();
      const handlers = createMockHandlers();

      render(<TicketTypeCard ticket={ticket} index={0} errors={{}} handlers={handlers} />);

      const descInput = screen.getByLabelText(/description/i) as HTMLTextAreaElement;
      expect(descInput.value).toBe('Premium access to the event');
    });

    it('should render price input', () => {
      const ticket = createMockTicket();
      const handlers = createMockHandlers();

      render(<TicketTypeCard ticket={ticket} index={0} errors={{}} handlers={handlers} />);

      const priceInput = screen.getByLabelText(/price/i) as HTMLInputElement;
      expect(priceInput.value).toBe('50.00');
    });

    it('should render capacity input', () => {
      const ticket = createMockTicket();
      const handlers = createMockHandlers();

      render(<TicketTypeCard ticket={ticket} index={0} errors={{}} handlers={handlers} />);

      const capacityInput = screen.getByLabelText(/capacity/i) as HTMLInputElement;
      expect(capacityInput.value).toBe('100');
    });

    it('should render currency select', () => {
      const ticket = createMockTicket();
      const handlers = createMockHandlers();

      render(<TicketTypeCard ticket={ticket} index={0} errors={{}} handlers={handlers} />);

      const currencySelect = screen.getByLabelText(/currency/i) as HTMLSelectElement;
      expect(currencySelect.value).toBe('USD');
    });

    it('should render sales start and end date inputs', () => {
      const ticket = createMockTicket();
      const handlers = createMockHandlers();

      render(<TicketTypeCard ticket={ticket} index={0} errors={{}} handlers={handlers} />);

      expect(screen.getByLabelText(/sales start/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/sales end/i)).toBeInTheDocument();
    });

    it('should display ticket index in header', () => {
      const ticket = createMockTicket();
      const handlers = createMockHandlers();

      render(<TicketTypeCard ticket={ticket} index={2} errors={{}} handlers={handlers} />);

      expect(screen.getByText(/ticket tier #3/i)).toBeInTheDocument();
    });

    it('should show remove button', () => {
      const ticket = createMockTicket();
      const handlers = createMockHandlers();

      render(<TicketTypeCard ticket={ticket} index={0} errors={{}} handlers={handlers} />);

      expect(screen.getByRole('button', { name: /remove ticket/i })).toBeInTheDocument();
    });

    it('should show add perk button', () => {
      const ticket = createMockTicket();
      const handlers = createMockHandlers();

      render(<TicketTypeCard ticket={ticket} index={0} errors={{}} handlers={handlers} />);

      expect(screen.getByRole('button', { name: /add perk/i })).toBeInTheDocument();
    });
  });

  describe('field updates', () => {
    it('should call onUpdate when name changes', () => {
      const ticket = createMockTicket();
      const handlers = createMockHandlers();

      render(<TicketTypeCard ticket={ticket} index={0} errors={{}} handlers={handlers} />);

      const nameInput = screen.getByLabelText(/ticket name/i);
      fireEvent.change(nameInput, { target: { value: 'General Admission' } });

      expect(handlers.onUpdate).toHaveBeenCalledWith(ticket.id, 'name', 'General Admission');
    });

    it('should call onUpdate when description changes', () => {
      const ticket = createMockTicket();
      const handlers = createMockHandlers();

      render(<TicketTypeCard ticket={ticket} index={0} errors={{}} handlers={handlers} />);

      const descInput = screen.getByLabelText(/description/i);
      fireEvent.change(descInput, { target: { value: 'Standard entry' } });

      expect(handlers.onUpdate).toHaveBeenCalledWith(ticket.id, 'description', 'Standard entry');
    });

    it('should call onUpdate when price changes', () => {
      const ticket = createMockTicket();
      const handlers = createMockHandlers();

      render(<TicketTypeCard ticket={ticket} index={0} errors={{}} handlers={handlers} />);

      const priceInput = screen.getByLabelText(/price/i);
      fireEvent.change(priceInput, { target: { value: '75.00' } });

      expect(handlers.onUpdate).toHaveBeenCalledWith(ticket.id, 'price', '75.00');
    });

    it('should call onUpdate when capacity changes', () => {
      const ticket = createMockTicket();
      const handlers = createMockHandlers();

      render(<TicketTypeCard ticket={ticket} index={0} errors={{}} handlers={handlers} />);

      const capacityInput = screen.getByLabelText(/capacity/i);
      fireEvent.change(capacityInput, { target: { value: '200' } });

      expect(handlers.onUpdate).toHaveBeenCalledWith(ticket.id, 'capacity', '200');
    });

    it('should call onUpdate when currency changes', () => {
      const ticket = createMockTicket();
      const handlers = createMockHandlers();

      render(<TicketTypeCard ticket={ticket} index={0} errors={{}} handlers={handlers} />);

      const currencySelect = screen.getByLabelText(/currency/i);
      fireEvent.change(currencySelect, { target: { value: 'EUR' } });

      expect(handlers.onUpdate).toHaveBeenCalledWith(ticket.id, 'currency', 'EUR');
    });

    it('should call onUpdate when sales start changes', () => {
      const ticket = createMockTicket();
      const handlers = createMockHandlers();

      render(<TicketTypeCard ticket={ticket} index={0} errors={{}} handlers={handlers} />);

      const startInput = screen.getByLabelText(/sales start/i);
      fireEvent.change(startInput, { target: { value: '2025-02-01T00:00' } });

      expect(handlers.onUpdate).toHaveBeenCalledWith(ticket.id, 'salesStart', '2025-02-01T00:00');
    });

    it('should call onUpdate when sales end changes', () => {
      const ticket = createMockTicket();
      const handlers = createMockHandlers();

      render(<TicketTypeCard ticket={ticket} index={0} errors={{}} handlers={handlers} />);

      const endInput = screen.getByLabelText(/sales end/i);
      fireEvent.change(endInput, { target: { value: '2025-11-30T23:59' } });

      expect(handlers.onUpdate).toHaveBeenCalledWith(ticket.id, 'salesEnd', '2025-11-30T23:59');
    });
  });

  describe('validation errors', () => {
    it('should display name error', () => {
      const ticket = createMockTicket();
      const handlers = createMockHandlers();
      const errors = {
        [`ticketTypes.${ticket.id}.name`]: 'Ticket name is required',
      };

      render(<TicketTypeCard ticket={ticket} index={0} errors={errors} handlers={handlers} />);

      expect(screen.getByText('Ticket name is required')).toBeInTheDocument();
    });

    it('should display price error', () => {
      const ticket = createMockTicket();
      const handlers = createMockHandlers();
      const errors = {
        [`ticketTypes.${ticket.id}.price`]: 'Price must be a valid number',
      };

      render(<TicketTypeCard ticket={ticket} index={0} errors={errors} handlers={handlers} />);

      expect(screen.getByText('Price must be a valid number')).toBeInTheDocument();
    });

    it('should display capacity error', () => {
      const ticket = createMockTicket();
      const handlers = createMockHandlers();
      const errors = {
        [`ticketTypes.${ticket.id}.capacity`]: 'Capacity is required',
      };

      render(<TicketTypeCard ticket={ticket} index={0} errors={errors} handlers={handlers} />);

      expect(screen.getByText('Capacity is required')).toBeInTheDocument();
    });

    it('should apply error styling to inputs with errors', () => {
      const ticket = createMockTicket();
      const handlers = createMockHandlers();
      const errors = {
        [`ticketTypes.${ticket.id}.name`]: 'Required',
      };

      render(<TicketTypeCard ticket={ticket} index={0} errors={errors} handlers={handlers} />);

      const nameInput = screen.getByLabelText(/ticket name/i);
      expect(nameInput).toHaveClass('border-red-500');
    });
  });

  describe('ticket removal', () => {
    it('should call onRemove when remove button is clicked', () => {
      const ticket = createMockTicket();
      const handlers = createMockHandlers();

      render(<TicketTypeCard ticket={ticket} index={0} errors={{}} handlers={handlers} />);

      const removeButton = screen.getByRole('button', { name: /remove ticket/i });
      fireEvent.click(removeButton);

      expect(handlers.onRemove).toHaveBeenCalledWith(ticket.id);
    });
  });

  describe('perks management', () => {
    it('should display existing perks', () => {
      const ticket = createMockTicket({
        perks: [
          { id: 'perk-1', name: 'Meet & Greet', description: 'Meet the artist', quantity: 1, instructions: '' },
          { id: 'perk-2', name: 'VIP Lounge', description: 'Access to lounge', quantity: 1, instructions: '' },
        ],
      });
      const handlers = createMockHandlers();

      render(<TicketTypeCard ticket={ticket} index={0} errors={{}} handlers={handlers} />);

      expect(screen.getByDisplayValue('Meet & Greet')).toBeInTheDocument();
      expect(screen.getByDisplayValue('VIP Lounge')).toBeInTheDocument();
    });

    it('should call onAddPerk when add perk button is clicked', () => {
      const ticket = createMockTicket();
      const handlers = createMockHandlers();

      render(<TicketTypeCard ticket={ticket} index={0} errors={{}} handlers={handlers} />);

      const addPerkButton = screen.getByRole('button', { name: /add perk/i });
      fireEvent.click(addPerkButton);

      expect(handlers.onAddPerk).toHaveBeenCalledWith(ticket.id);
    });

    it('should call onUpdatePerk when perk name changes', () => {
      const ticket = createMockTicket({
        perks: [
          { id: 'perk-1', name: 'Meet & Greet', description: 'Meet the artist', quantity: 1, instructions: '' },
        ],
      });
      const handlers = createMockHandlers();

      render(<TicketTypeCard ticket={ticket} index={0} errors={{}} handlers={handlers} />);

      const perkNameInput = screen.getByDisplayValue('Meet & Greet');
      fireEvent.change(perkNameInput, { target: { value: 'Photo Op' } });

      expect(handlers.onUpdatePerk).toHaveBeenCalledWith(ticket.id, 'perk-1', 'name', 'Photo Op');
    });

    it('should call onUpdatePerk when perk description changes', () => {
      const ticket = createMockTicket({
        perks: [
          { id: 'perk-1', name: 'Meet & Greet', description: 'Meet the artist', quantity: 1, instructions: '' },
        ],
      });
      const handlers = createMockHandlers();

      render(<TicketTypeCard ticket={ticket} index={0} errors={{}} handlers={handlers} />);

      const perkDescInput = screen.getByDisplayValue('Meet the artist');
      fireEvent.change(perkDescInput, { target: { value: 'Meet artists backstage' } });

      expect(handlers.onUpdatePerk).toHaveBeenCalledWith(ticket.id, 'perk-1', 'description', 'Meet artists backstage');
    });

    it('should call onUpdatePerk when perk quantity changes', () => {
      const ticket = createMockTicket({
        perks: [
          { id: 'perk-1', name: 'Meet & Greet', description: 'Meet the artist', quantity: 1, instructions: '' },
        ],
      });
      const handlers = createMockHandlers();

      render(<TicketTypeCard ticket={ticket} index={0} errors={{}} handlers={handlers} />);

      const perkQuantityInput = screen.getByLabelText(/quantity/i);
      fireEvent.change(perkQuantityInput, { target: { value: '2' } });

      expect(handlers.onUpdatePerk).toHaveBeenCalledWith(ticket.id, 'perk-1', 'quantity', 2);
    });

    it('should call onRemovePerk when remove perk button is clicked', () => {
      const ticket = createMockTicket({
        perks: [
          { id: 'perk-1', name: 'Meet & Greet', description: 'Meet the artist', quantity: 1, instructions: '' },
        ],
      });
      const handlers = createMockHandlers();

      render(<TicketTypeCard ticket={ticket} index={0} errors={{}} handlers={handlers} />);

      const removePerkButton = screen.getByRole('button', { name: /remove perk/i });
      fireEvent.click(removePerkButton);

      expect(handlers.onRemovePerk).toHaveBeenCalledWith(ticket.id, 'perk-1');
    });

    it('should show perk validation errors', () => {
      const ticket = createMockTicket({
        perks: [
          { id: 'perk-1', name: '', description: '', quantity: 1, instructions: '' },
        ],
      });
      const handlers = createMockHandlers();
      const errors = {
        [`ticketTypes.${ticket.id}.perks.perk-1.name`]: 'Perk name is required',
      };

      render(<TicketTypeCard ticket={ticket} index={0} errors={errors} handlers={handlers} />);

      expect(screen.getByText('Perk name is required')).toBeInTheDocument();
    });
  });

  describe('collapsible behavior', () => {
    it('should start expanded', () => {
      const ticket = createMockTicket();
      const handlers = createMockHandlers();

      render(<TicketTypeCard ticket={ticket} index={0} errors={{}} handlers={handlers} />);

      // All form fields should be visible
      expect(screen.getByLabelText(/ticket name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    });

    it('should toggle collapsed state when header is clicked', () => {
      const ticket = createMockTicket();
      const handlers = createMockHandlers();

      render(<TicketTypeCard ticket={ticket} index={0} errors={{}} handlers={handlers} />);

      const header = screen.getByText(/ticket tier #1/i);
      fireEvent.click(header);

      // Form fields should be hidden
      expect(screen.queryByLabelText(/description/i)).not.toBeInTheDocument();
    });

    it('should show expand/collapse icon', () => {
      const ticket = createMockTicket();
      const handlers = createMockHandlers();

      const { container } = render(<TicketTypeCard ticket={ticket} index={0} errors={{}} handlers={handlers} />);

      const header = screen.getByText(/ticket tier #1/i).closest('div');
      expect(header).toBeInTheDocument();

      // Should have some indicator (chevron icon)
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('currency options', () => {
    it('should support USD currency', () => {
      const ticket = createMockTicket({ currency: 'USD' });
      const handlers = createMockHandlers();

      render(<TicketTypeCard ticket={ticket} index={0} errors={{}} handlers={handlers} />);

      const currencySelect = screen.getByLabelText(/currency/i);
      expect(currencySelect).toHaveValue('USD');
    });

    it('should support EUR currency', () => {
      const ticket = createMockTicket({ currency: 'EUR' });
      const handlers = createMockHandlers();

      render(<TicketTypeCard ticket={ticket} index={0} errors={{}} handlers={handlers} />);

      const currencySelect = screen.getByLabelText(/currency/i);
      expect(currencySelect).toHaveValue('EUR');
    });

    it('should have multiple currency options available', () => {
      const ticket = createMockTicket();
      const handlers = createMockHandlers();

      render(<TicketTypeCard ticket={ticket} index={0} errors={{}} handlers={handlers} />);

      const currencySelect = screen.getByLabelText(/currency/i) as HTMLSelectElement;
      const options = Array.from(currencySelect.options).map(opt => opt.value);

      expect(options).toContain('USD');
      expect(options).toContain('EUR');
      expect(options).toContain('GBP');
    });
  });

  describe('edge cases', () => {
    it('should handle empty ticket name', () => {
      const ticket = createMockTicket({ name: '' });
      const handlers = createMockHandlers();

      render(<TicketTypeCard ticket={ticket} index={0} errors={{}} handlers={handlers} />);

      const nameInput = screen.getByLabelText(/ticket name/i) as HTMLInputElement;
      expect(nameInput.value).toBe('');
    });

    it('should handle zero price', () => {
      const ticket = createMockTicket({ price: '0' });
      const handlers = createMockHandlers();

      render(<TicketTypeCard ticket={ticket} index={0} errors={{}} handlers={handlers} />);

      const priceInput = screen.getByLabelText(/price/i) as HTMLInputElement;
      expect(priceInput.value).toBe('0');
    });

    it('should handle empty perks array', () => {
      const ticket = createMockTicket({ perks: [] });
      const handlers = createMockHandlers();

      render(<TicketTypeCard ticket={ticket} index={0} errors={{}} handlers={handlers} />);

      // Should show add perk button but no perks
      expect(screen.getByRole('button', { name: /add perk/i })).toBeInTheDocument();
      expect(screen.queryByText(/meet & greet/i)).not.toBeInTheDocument();
    });

    it('should handle multiple errors simultaneously', () => {
      const ticket = createMockTicket();
      const handlers = createMockHandlers();
      const errors = {
        [`ticketTypes.${ticket.id}.name`]: 'Name required',
        [`ticketTypes.${ticket.id}.price`]: 'Price invalid',
        [`ticketTypes.${ticket.id}.capacity`]: 'Capacity required',
      };

      render(<TicketTypeCard ticket={ticket} index={0} errors={errors} handlers={handlers} />);

      expect(screen.getByText('Name required')).toBeInTheDocument();
      expect(screen.getByText('Price invalid')).toBeInTheDocument();
      expect(screen.getByText('Capacity required')).toBeInTheDocument();
    });
  });
});
