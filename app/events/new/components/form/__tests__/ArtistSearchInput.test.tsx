import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ArtistSearchInput } from '../ArtistSearchInput';

// Mock artist data
const mockArtists = [
  { id: 1, name: 'Taylor Swift', slug: 'taylor-swift', genre: 'Pop' },
  { id: 2, name: 'The Beatles', slug: 'the-beatles', genre: 'Rock' },
  { id: 3, name: 'Billie Eilish', slug: 'billie-eilish', genre: 'Alternative' },
  { id: 4, name: 'Taylor Gang', slug: 'taylor-gang', genre: 'Hip Hop' },
];

describe('ArtistSearchInput', () => {
  describe('rendering', () => {
    it('should render input field', () => {
      render(
        <ArtistSearchInput
          value=""
          onChange={vi.fn()}
          onSelect={vi.fn()}
          artists={mockArtists}
        />
      );

      expect(screen.getByPlaceholderText(/search by artist name/i)).toBeInTheDocument();
    });

    it('should display current value in input', () => {
      render(
        <ArtistSearchInput
          value="Taylor Swift"
          onChange={vi.fn()}
          onSelect={vi.fn()}
          artists={mockArtists}
        />
      );

      const input = screen.getByPlaceholderText(/search by artist name/i) as HTMLInputElement;
      expect(input.value).toBe('Taylor Swift');
    });

    it('should display label', () => {
      render(
        <ArtistSearchInput
          value=""
          onChange={vi.fn()}
          onSelect={vi.fn()}
          artists={mockArtists}
          label="Primary Artist"
        />
      );

      expect(screen.getByText('Primary Artist')).toBeInTheDocument();
    });

    it('should display error message when provided', () => {
      render(
        <ArtistSearchInput
          value=""
          onChange={vi.fn()}
          onSelect={vi.fn()}
          artists={mockArtists}
          error="Artist is required"
        />
      );

      expect(screen.getByText('Artist is required')).toBeInTheDocument();
    });

    it('should apply error styling when error exists', () => {
      render(
        <ArtistSearchInput
          value=""
          onChange={vi.fn()}
          onSelect={vi.fn()}
          artists={mockArtists}
          error="Artist is required"
        />
      );

      const input = screen.getByPlaceholderText(/search by artist name/i);
      expect(input).toHaveClass('border-red-500');
    });
  });

  describe('suggestions dropdown', () => {
    it('should show all suggestions on focus when value is empty', async () => {
      render(
        <ArtistSearchInput
          value=""
          onChange={vi.fn()}
          onSelect={vi.fn()}
          artists={mockArtists}
        />
      );

      const input = screen.getByPlaceholderText(/search by artist name/i);
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Taylor Swift')).toBeInTheDocument();
        expect(screen.getByText('The Beatles')).toBeInTheDocument();
        expect(screen.getByText('Billie Eilish')).toBeInTheDocument();
        expect(screen.getByText('Taylor Gang')).toBeInTheDocument();
      });
    });

    it('should filter suggestions based on input value (case-insensitive)', async () => {
      const handleChange = vi.fn();
      render(
        <ArtistSearchInput
          value="taylor"
          onChange={handleChange}
          onSelect={vi.fn()}
          artists={mockArtists}
        />
      );

      const input = screen.getByPlaceholderText(/search by artist name/i);
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Taylor Swift')).toBeInTheDocument();
        expect(screen.getByText('Taylor Gang')).toBeInTheDocument();
        expect(screen.queryByText('The Beatles')).not.toBeInTheDocument();
        expect(screen.queryByText('Billie Eilish')).not.toBeInTheDocument();
      });
    });

    it('should hide suggestions when input is blurred', async () => {
      render(
        <ArtistSearchInput
          value=""
          onChange={vi.fn()}
          onSelect={vi.fn()}
          artists={mockArtists}
        />
      );

      const input = screen.getByPlaceholderText(/search by artist name/i);
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Taylor Swift')).toBeInTheDocument();
      });

      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.queryByText('Taylor Swift')).not.toBeInTheDocument();
      });
    });

    it('should show "No artists found" when no matches', async () => {
      render(
        <ArtistSearchInput
          value="xyz nonexistent"
          onChange={vi.fn()}
          onSelect={vi.fn()}
          artists={mockArtists}
        />
      );

      const input = screen.getByPlaceholderText(/search by artist name/i);
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText(/no artists found/i)).toBeInTheDocument();
      });
    });

    it('should display genre for each artist', async () => {
      render(
        <ArtistSearchInput
          value=""
          onChange={vi.fn()}
          onSelect={vi.fn()}
          artists={mockArtists}
        />
      );

      const input = screen.getByPlaceholderText(/search by artist name/i);
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Pop')).toBeInTheDocument();
        expect(screen.getByText('Rock')).toBeInTheDocument();
        expect(screen.getByText('Alternative')).toBeInTheDocument();
      });
    });
  });

  describe('user interactions', () => {
    it('should call onChange when user types', () => {
      const handleChange = vi.fn();
      render(
        <ArtistSearchInput
          value=""
          onChange={handleChange}
          onSelect={vi.fn()}
          artists={mockArtists}
        />
      );

      const input = screen.getByPlaceholderText(/search by artist name/i);
      fireEvent.change(input, { target: { value: 'Taylor' } });

      expect(handleChange).toHaveBeenCalledWith('Taylor');
    });

    it('should call onSelect when artist is clicked', async () => {
      const handleSelect = vi.fn();
      render(
        <ArtistSearchInput
          value=""
          onChange={vi.fn()}
          onSelect={handleSelect}
          artists={mockArtists}
        />
      );

      const input = screen.getByPlaceholderText(/search by artist name/i);
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Taylor Swift')).toBeInTheDocument();
      });

      fireEvent.mouseDown(screen.getByText('Taylor Swift'));

      expect(handleSelect).toHaveBeenCalledWith(mockArtists[0]);
    });

    it('should close dropdown after selection', async () => {
      const handleSelect = vi.fn();
      render(
        <ArtistSearchInput
          value=""
          onChange={vi.fn()}
          onSelect={handleSelect}
          artists={mockArtists}
        />
      );

      const input = screen.getByPlaceholderText(/search by artist name/i);
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Taylor Swift')).toBeInTheDocument();
      });

      fireEvent.mouseDown(screen.getByText('Taylor Swift'));

      await waitFor(() => {
        expect(screen.queryByText('The Beatles')).not.toBeInTheDocument();
      });
    });

    it('should prevent blur when mouseDown occurs on dropdown item', async () => {
      const handleSelect = vi.fn();
      render(
        <ArtistSearchInput
          value=""
          onChange={vi.fn()}
          onSelect={handleSelect}
          artists={mockArtists}
        />
      );

      const input = screen.getByPlaceholderText(/search by artist name/i);
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Taylor Swift')).toBeInTheDocument();
      });

      // MouseDown on an item should trigger selection before blur
      fireEvent.mouseDown(screen.getByText('Taylor Swift'));

      expect(handleSelect).toHaveBeenCalledWith(mockArtists[0]);
    });
  });

  describe('keyboard navigation', () => {
    it('should navigate down with ArrowDown key', async () => {
      render(
        <ArtistSearchInput
          value=""
          onChange={vi.fn()}
          onSelect={vi.fn()}
          artists={mockArtists}
        />
      );

      const input = screen.getByPlaceholderText(/search by artist name/i);
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Taylor Swift')).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: 'ArrowDown' });

      const firstItem = screen.getByText('Taylor Swift').closest('[role="option"]');
      expect(firstItem).toHaveClass('bg-blue-50');
    });

    it('should navigate up with ArrowUp key', async () => {
      render(
        <ArtistSearchInput
          value=""
          onChange={vi.fn()}
          onSelect={vi.fn()}
          artists={mockArtists}
        />
      );

      const input = screen.getByPlaceholderText(/search by artist name/i);
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Taylor Swift')).toBeInTheDocument();
      });

      // Navigate down twice
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'ArrowDown' });

      // Navigate up once
      fireEvent.keyDown(input, { key: 'ArrowUp' });

      const firstItem = screen.getByText('Taylor Swift').closest('[role="option"]');
      expect(firstItem).toHaveClass('bg-blue-50');
    });

    it('should select highlighted artist with Enter key', async () => {
      const handleSelect = vi.fn();
      render(
        <ArtistSearchInput
          value=""
          onChange={vi.fn()}
          onSelect={handleSelect}
          artists={mockArtists}
        />
      );

      const input = screen.getByPlaceholderText(/search by artist name/i);
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Taylor Swift')).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(handleSelect).toHaveBeenCalledWith(mockArtists[0]);
    });

    it('should close dropdown with Escape key', async () => {
      render(
        <ArtistSearchInput
          value=""
          onChange={vi.fn()}
          onSelect={vi.fn()}
          artists={mockArtists}
        />
      );

      const input = screen.getByPlaceholderText(/search by artist name/i);
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Taylor Swift')).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: 'Escape' });

      await waitFor(() => {
        expect(screen.queryByText('Taylor Swift')).not.toBeInTheDocument();
      });
    });

    it('should wrap to first item when navigating down from last item', async () => {
      render(
        <ArtistSearchInput
          value=""
          onChange={vi.fn()}
          onSelect={vi.fn()}
          artists={mockArtists}
        />
      );

      const input = screen.getByPlaceholderText(/search by artist name/i);
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Taylor Swift')).toBeInTheDocument();
      });

      // Navigate to last item
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'ArrowDown' });

      // Navigate down one more (should wrap to first)
      fireEvent.keyDown(input, { key: 'ArrowDown' });

      const firstItem = screen.getByText('Taylor Swift').closest('[role="option"]');
      expect(firstItem).toHaveClass('bg-blue-50');
    });

    it('should wrap to last item when navigating up from first item', async () => {
      render(
        <ArtistSearchInput
          value=""
          onChange={vi.fn()}
          onSelect={vi.fn()}
          artists={mockArtists}
        />
      );

      const input = screen.getByPlaceholderText(/search by artist name/i);
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Taylor Swift')).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: 'ArrowDown' }); // Highlight first
      fireEvent.keyDown(input, { key: 'ArrowUp' }); // Should wrap to last

      const lastItem = screen.getByText('Taylor Gang').closest('[role="option"]');
      expect(lastItem).toHaveClass('bg-blue-50');
    });
  });

  describe('edge cases', () => {
    it('should handle empty artists array', () => {
      render(
        <ArtistSearchInput
          value=""
          onChange={vi.fn()}
          onSelect={vi.fn()}
          artists={[]}
        />
      );

      const input = screen.getByPlaceholderText(/search by artist name/i);
      fireEvent.focus(input);

      expect(screen.getByText(/no artists found/i)).toBeInTheDocument();
    });

    it('should handle undefined artists', () => {
      render(
        <ArtistSearchInput
          value=""
          onChange={vi.fn()}
          onSelect={vi.fn()}
          artists={undefined as any}
        />
      );

      const input = screen.getByPlaceholderText(/search by artist name/i);
      expect(input).toBeInTheDocument();
    });

    it('should be case-insensitive in filtering', async () => {
      render(
        <ArtistSearchInput
          value="BEATLES"
          onChange={vi.fn()}
          onSelect={vi.fn()}
          artists={mockArtists}
        />
      );

      const input = screen.getByPlaceholderText(/search by artist name/i);
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('The Beatles')).toBeInTheDocument();
      });
    });

    it('should match artists by partial name', async () => {
      render(
        <ArtistSearchInput
          value="eil"
          onChange={vi.fn()}
          onSelect={vi.fn()}
          artists={mockArtists}
        />
      );

      const input = screen.getByPlaceholderText(/search by artist name/i);
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Billie Eilish')).toBeInTheDocument();
      });
    });

    it('should not call onSelect when Enter is pressed with no highlight', async () => {
      const handleSelect = vi.fn();
      render(
        <ArtistSearchInput
          value=""
          onChange={vi.fn()}
          onSelect={handleSelect}
          artists={mockArtists}
        />
      );

      const input = screen.getByPlaceholderText(/search by artist name/i);
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Taylor Swift')).toBeInTheDocument();
      });

      // Press Enter without navigating (no highlight)
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(handleSelect).not.toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('should have proper aria-label', () => {
      render(
        <ArtistSearchInput
          value=""
          onChange={vi.fn()}
          onSelect={vi.fn()}
          artists={mockArtists}
        />
      );

      const input = screen.getByPlaceholderText(/search by artist name/i);
      expect(input).toHaveAttribute('aria-label', 'Search for artist');
    });

    it('should indicate expanded state with aria-expanded', async () => {
      render(
        <ArtistSearchInput
          value=""
          onChange={vi.fn()}
          onSelect={vi.fn()}
          artists={mockArtists}
        />
      );

      const input = screen.getByPlaceholderText(/search by artist name/i);

      expect(input).toHaveAttribute('aria-expanded', 'false');

      fireEvent.focus(input);

      await waitFor(() => {
        expect(input).toHaveAttribute('aria-expanded', 'true');
      });
    });

    it('should have proper role for dropdown', async () => {
      render(
        <ArtistSearchInput
          value=""
          onChange={vi.fn()}
          onSelect={vi.fn()}
          artists={mockArtists}
        />
      );

      const input = screen.getByPlaceholderText(/search by artist name/i);
      fireEvent.focus(input);

      await waitFor(() => {
        const dropdown = screen.getByRole('listbox');
        expect(dropdown).toBeInTheDocument();
      });
    });

    it('should have proper role for dropdown items', async () => {
      render(
        <ArtistSearchInput
          value=""
          onChange={vi.fn()}
          onSelect={vi.fn()}
          artists={mockArtists}
        />
      );

      const input = screen.getByPlaceholderText(/search by artist name/i);
      fireEvent.focus(input);

      await waitFor(() => {
        const options = screen.getAllByRole('option');
        expect(options).toHaveLength(4);
      });
    });
  });
});
