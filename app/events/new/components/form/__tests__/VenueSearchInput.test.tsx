import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { VenueSearchInput } from '../VenueSearchInput';

// Mock venue data
const mockVenues = [
  { id: 1, name: 'Madison Square Garden', slug: 'madison-square-garden', city: 'New York', state: 'NY' },
  { id: 2, name: 'Red Rocks Amphitheatre', slug: 'red-rocks', city: 'Morrison', state: 'CO' },
  { id: 3, name: 'The Fillmore', slug: 'the-fillmore', city: 'San Francisco', state: 'CA' },
  { id: 4, name: 'Madison Theater', slug: 'madison-theater', city: 'Covington', state: 'KY' },
];

describe('VenueSearchInput', () => {
  describe('rendering', () => {
    it('should render input field', () => {
      render(
        <VenueSearchInput
          value=""
          onChange={vi.fn()}
          onSelect={vi.fn()}
          venues={mockVenues}
        />
      );

      expect(screen.getByPlaceholderText(/search by venue name/i)).toBeInTheDocument();
    });

    it('should display current value in input', () => {
      render(
        <VenueSearchInput
          value="Madison Square Garden"
          onChange={vi.fn()}
          onSelect={vi.fn()}
          venues={mockVenues}
        />
      );

      const input = screen.getByPlaceholderText(/search by venue name/i) as HTMLInputElement;
      expect(input.value).toBe('Madison Square Garden');
    });

    it('should display label', () => {
      render(
        <VenueSearchInput
          value=""
          onChange={vi.fn()}
          onSelect={vi.fn()}
          venues={mockVenues}
          label="Event Venue"
        />
      );

      expect(screen.getByText('Event Venue')).toBeInTheDocument();
    });

    it('should display error message when provided', () => {
      render(
        <VenueSearchInput
          value=""
          onChange={vi.fn()}
          onSelect={vi.fn()}
          venues={mockVenues}
          error="Venue is required"
        />
      );

      expect(screen.getByText('Venue is required')).toBeInTheDocument();
    });

    it('should apply error styling when error exists', () => {
      render(
        <VenueSearchInput
          value=""
          onChange={vi.fn()}
          onSelect={vi.fn()}
          venues={mockVenues}
          error="Venue is required"
        />
      );

      const input = screen.getByPlaceholderText(/search by venue name/i);
      expect(input).toHaveClass('border-red-500');
    });
  });

  describe('suggestions dropdown', () => {
    it('should show all suggestions on focus when value is empty', async () => {
      render(
        <VenueSearchInput
          value=""
          onChange={vi.fn()}
          onSelect={vi.fn()}
          venues={mockVenues}
        />
      );

      const input = screen.getByPlaceholderText(/search by venue name/i);
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Madison Square Garden')).toBeInTheDocument();
        expect(screen.getByText('Red Rocks Amphitheatre')).toBeInTheDocument();
        expect(screen.getByText('The Fillmore')).toBeInTheDocument();
        expect(screen.getByText('Madison Theater')).toBeInTheDocument();
      });
    });

    it('should filter suggestions based on input value (case-insensitive)', async () => {
      render(
        <VenueSearchInput
          value="madison"
          onChange={vi.fn()}
          onSelect={vi.fn()}
          venues={mockVenues}
        />
      );

      const input = screen.getByPlaceholderText(/search by venue name/i);
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Madison Square Garden')).toBeInTheDocument();
        expect(screen.getByText('Madison Theater')).toBeInTheDocument();
        expect(screen.queryByText('Red Rocks Amphitheatre')).not.toBeInTheDocument();
        expect(screen.queryByText('The Fillmore')).not.toBeInTheDocument();
      });
    });

    it('should hide suggestions when input is blurred', async () => {
      render(
        <VenueSearchInput
          value=""
          onChange={vi.fn()}
          onSelect={vi.fn()}
          venues={mockVenues}
        />
      );

      const input = screen.getByPlaceholderText(/search by venue name/i);
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Madison Square Garden')).toBeInTheDocument();
      });

      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.queryByText('Madison Square Garden')).not.toBeInTheDocument();
      });
    });

    it('should show "No venues found" when no matches', async () => {
      render(
        <VenueSearchInput
          value="xyz nonexistent venue"
          onChange={vi.fn()}
          onSelect={vi.fn()}
          venues={mockVenues}
        />
      );

      const input = screen.getByPlaceholderText(/search by venue name/i);
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText(/no venues found/i)).toBeInTheDocument();
      });
    });

    it('should display city and state for each venue', async () => {
      render(
        <VenueSearchInput
          value=""
          onChange={vi.fn()}
          onSelect={vi.fn()}
          venues={mockVenues}
        />
      );

      const input = screen.getByPlaceholderText(/search by venue name/i);
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('New York, NY')).toBeInTheDocument();
        expect(screen.getByText('Morrison, CO')).toBeInTheDocument();
        expect(screen.getByText('San Francisco, CA')).toBeInTheDocument();
      });
    });

    it('should filter by city as well as venue name', async () => {
      render(
        <VenueSearchInput
          value="san francisco"
          onChange={vi.fn()}
          onSelect={vi.fn()}
          venues={mockVenues}
        />
      );

      const input = screen.getByPlaceholderText(/search by venue name/i);
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('The Fillmore')).toBeInTheDocument();
        expect(screen.queryByText('Madison Square Garden')).not.toBeInTheDocument();
      });
    });
  });

  describe('user interactions', () => {
    it('should call onChange when user types', () => {
      const handleChange = vi.fn();
      render(
        <VenueSearchInput
          value=""
          onChange={handleChange}
          onSelect={vi.fn()}
          venues={mockVenues}
        />
      );

      const input = screen.getByPlaceholderText(/search by venue name/i);
      fireEvent.change(input, { target: { value: 'Madison' } });

      expect(handleChange).toHaveBeenCalledWith('Madison');
    });

    it('should call onSelect when venue is clicked', async () => {
      const handleSelect = vi.fn();
      render(
        <VenueSearchInput
          value=""
          onChange={vi.fn()}
          onSelect={handleSelect}
          venues={mockVenues}
        />
      );

      const input = screen.getByPlaceholderText(/search by venue name/i);
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Madison Square Garden')).toBeInTheDocument();
      });

      fireEvent.mouseDown(screen.getByText('Madison Square Garden'));

      expect(handleSelect).toHaveBeenCalledWith(mockVenues[0]);
    });

    it('should close dropdown after selection', async () => {
      const handleSelect = vi.fn();
      render(
        <VenueSearchInput
          value=""
          onChange={vi.fn()}
          onSelect={handleSelect}
          venues={mockVenues}
        />
      );

      const input = screen.getByPlaceholderText(/search by venue name/i);
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Madison Square Garden')).toBeInTheDocument();
      });

      fireEvent.mouseDown(screen.getByText('Madison Square Garden'));

      await waitFor(() => {
        expect(screen.queryByText('Red Rocks Amphitheatre')).not.toBeInTheDocument();
      });
    });

    it('should prevent blur when mouseDown occurs on dropdown item', async () => {
      const handleSelect = vi.fn();
      render(
        <VenueSearchInput
          value=""
          onChange={vi.fn()}
          onSelect={handleSelect}
          venues={mockVenues}
        />
      );

      const input = screen.getByPlaceholderText(/search by venue name/i);
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Madison Square Garden')).toBeInTheDocument();
      });

      fireEvent.mouseDown(screen.getByText('Madison Square Garden'));

      expect(handleSelect).toHaveBeenCalledWith(mockVenues[0]);
    });
  });

  describe('keyboard navigation', () => {
    it('should navigate down with ArrowDown key', async () => {
      render(
        <VenueSearchInput
          value=""
          onChange={vi.fn()}
          onSelect={vi.fn()}
          venues={mockVenues}
        />
      );

      const input = screen.getByPlaceholderText(/search by venue name/i);
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Madison Square Garden')).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: 'ArrowDown' });

      const firstItem = screen.getByText('Madison Square Garden').closest('[role="option"]');
      expect(firstItem).toHaveClass('bg-blue-50');
    });

    it('should navigate up with ArrowUp key', async () => {
      render(
        <VenueSearchInput
          value=""
          onChange={vi.fn()}
          onSelect={vi.fn()}
          venues={mockVenues}
        />
      );

      const input = screen.getByPlaceholderText(/search by venue name/i);
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Madison Square Garden')).toBeInTheDocument();
      });

      // Navigate down twice
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'ArrowDown' });

      // Navigate up once
      fireEvent.keyDown(input, { key: 'ArrowUp' });

      const firstItem = screen.getByText('Madison Square Garden').closest('[role="option"]');
      expect(firstItem).toHaveClass('bg-blue-50');
    });

    it('should select highlighted venue with Enter key', async () => {
      const handleSelect = vi.fn();
      render(
        <VenueSearchInput
          value=""
          onChange={vi.fn()}
          onSelect={handleSelect}
          venues={mockVenues}
        />
      );

      const input = screen.getByPlaceholderText(/search by venue name/i);
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Madison Square Garden')).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(handleSelect).toHaveBeenCalledWith(mockVenues[0]);
    });

    it('should close dropdown with Escape key', async () => {
      render(
        <VenueSearchInput
          value=""
          onChange={vi.fn()}
          onSelect={vi.fn()}
          venues={mockVenues}
        />
      );

      const input = screen.getByPlaceholderText(/search by venue name/i);
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Madison Square Garden')).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: 'Escape' });

      await waitFor(() => {
        expect(screen.queryByText('Madison Square Garden')).not.toBeInTheDocument();
      });
    });

    it('should wrap to first item when navigating down from last item', async () => {
      render(
        <VenueSearchInput
          value=""
          onChange={vi.fn()}
          onSelect={vi.fn()}
          venues={mockVenues}
        />
      );

      const input = screen.getByPlaceholderText(/search by venue name/i);
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Madison Square Garden')).toBeInTheDocument();
      });

      // Navigate to last item
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'ArrowDown' });

      // Navigate down one more (should wrap to first)
      fireEvent.keyDown(input, { key: 'ArrowDown' });

      const firstItem = screen.getByText('Madison Square Garden').closest('[role="option"]');
      expect(firstItem).toHaveClass('bg-blue-50');
    });

    it('should wrap to last item when navigating up from first item', async () => {
      render(
        <VenueSearchInput
          value=""
          onChange={vi.fn()}
          onSelect={vi.fn()}
          venues={mockVenues}
        />
      );

      const input = screen.getByPlaceholderText(/search by venue name/i);
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Madison Square Garden')).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: 'ArrowDown' }); // Highlight first
      fireEvent.keyDown(input, { key: 'ArrowUp' }); // Should wrap to last

      const lastItem = screen.getByText('Madison Theater').closest('[role="option"]');
      expect(lastItem).toHaveClass('bg-blue-50');
    });
  });

  describe('edge cases', () => {
    it('should handle empty venues array', () => {
      render(
        <VenueSearchInput
          value=""
          onChange={vi.fn()}
          onSelect={vi.fn()}
          venues={[]}
        />
      );

      const input = screen.getByPlaceholderText(/search by venue name/i);
      fireEvent.focus(input);

      expect(screen.getByText(/no venues found/i)).toBeInTheDocument();
    });

    it('should handle undefined venues', () => {
      render(
        <VenueSearchInput
          value=""
          onChange={vi.fn()}
          onSelect={vi.fn()}
          venues={undefined as any}
        />
      );

      const input = screen.getByPlaceholderText(/search by venue name/i);
      expect(input).toBeInTheDocument();
    });

    it('should be case-insensitive in filtering', async () => {
      render(
        <VenueSearchInput
          value="RED ROCKS"
          onChange={vi.fn()}
          onSelect={vi.fn()}
          venues={mockVenues}
        />
      );

      const input = screen.getByPlaceholderText(/search by venue name/i);
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Red Rocks Amphitheatre')).toBeInTheDocument();
      });
    });

    it('should match venues by partial name', async () => {
      render(
        <VenueSearchInput
          value="square"
          onChange={vi.fn()}
          onSelect={vi.fn()}
          venues={mockVenues}
        />
      );

      const input = screen.getByPlaceholderText(/search by venue name/i);
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Madison Square Garden')).toBeInTheDocument();
      });
    });

    it('should not call onSelect when Enter is pressed with no highlight', async () => {
      const handleSelect = vi.fn();
      render(
        <VenueSearchInput
          value=""
          onChange={vi.fn()}
          onSelect={handleSelect}
          venues={mockVenues}
        />
      );

      const input = screen.getByPlaceholderText(/search by venue name/i);
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Madison Square Garden')).toBeInTheDocument();
      });

      // Press Enter without navigating (no highlight)
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(handleSelect).not.toHaveBeenCalled();
    });

    it('should handle venues with null city or state', async () => {
      const venuesWithNulls = [
        { id: 1, name: 'Test Venue', slug: 'test', city: null, state: null },
      ];

      render(
        <VenueSearchInput
          value=""
          onChange={vi.fn()}
          onSelect={vi.fn()}
          venues={venuesWithNulls as any}
        />
      );

      const input = screen.getByPlaceholderText(/search by venue name/i);
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Test Venue')).toBeInTheDocument();
      });
    });
  });

  describe('accessibility', () => {
    it('should have proper aria-label', () => {
      render(
        <VenueSearchInput
          value=""
          onChange={vi.fn()}
          onSelect={vi.fn()}
          venues={mockVenues}
        />
      );

      const input = screen.getByPlaceholderText(/search by venue name/i);
      expect(input).toHaveAttribute('aria-label', 'Search for venue');
    });

    it('should indicate expanded state with aria-expanded', async () => {
      render(
        <VenueSearchInput
          value=""
          onChange={vi.fn()}
          onSelect={vi.fn()}
          venues={mockVenues}
        />
      );

      const input = screen.getByPlaceholderText(/search by venue name/i);

      expect(input).toHaveAttribute('aria-expanded', 'false');

      fireEvent.focus(input);

      await waitFor(() => {
        expect(input).toHaveAttribute('aria-expanded', 'true');
      });
    });

    it('should have proper role for dropdown', async () => {
      render(
        <VenueSearchInput
          value=""
          onChange={vi.fn()}
          onSelect={vi.fn()}
          venues={mockVenues}
        />
      );

      const input = screen.getByPlaceholderText(/search by venue name/i);
      fireEvent.focus(input);

      await waitFor(() => {
        const dropdown = screen.getByRole('listbox');
        expect(dropdown).toBeInTheDocument();
      });
    });

    it('should have proper role for dropdown items', async () => {
      render(
        <VenueSearchInput
          value=""
          onChange={vi.fn()}
          onSelect={vi.fn()}
          venues={mockVenues}
        />
      );

      const input = screen.getByPlaceholderText(/search by venue name/i);
      fireEvent.focus(input);

      await waitFor(() => {
        const options = screen.getAllByRole('option');
        expect(options).toHaveLength(4);
      });
    });
  });
});
