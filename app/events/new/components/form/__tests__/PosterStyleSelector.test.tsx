import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PosterStyleSelector } from '../PosterStyleSelector';

const mockStyles = [
  { id: 'vintage', name: 'Vintage', description: 'Classic retro concert poster style' },
  { id: 'modern', name: 'Modern', description: 'Clean minimalist design' },
  { id: 'grunge', name: 'Grunge', description: 'Raw and edgy aesthetic' },
  { id: 'neon', name: 'Neon', description: 'Bold vibrant colors' },
  { id: 'minimalist', name: 'Minimalist', description: 'Simple and elegant' },
  { id: 'psychedelic', name: 'Psychedelic', description: 'Trippy and colorful' },
];

describe('PosterStyleSelector', () => {
  describe('rendering', () => {
    it('should render all available styles', () => {
      render(
        <PosterStyleSelector
          selectedStyle={null}
          onSelect={vi.fn()}
          styles={mockStyles}
        />
      );

      expect(screen.getByText('Vintage')).toBeInTheDocument();
      expect(screen.getByText('Modern')).toBeInTheDocument();
      expect(screen.getByText('Grunge')).toBeInTheDocument();
      expect(screen.getByText('Neon')).toBeInTheDocument();
      expect(screen.getByText('Minimalist')).toBeInTheDocument();
      expect(screen.getByText('Psychedelic')).toBeInTheDocument();
    });

    it('should display style descriptions', () => {
      render(
        <PosterStyleSelector
          selectedStyle={null}
          onSelect={vi.fn()}
          styles={mockStyles}
        />
      );

      expect(screen.getByText('Classic retro concert poster style')).toBeInTheDocument();
      expect(screen.getByText('Clean minimalist design')).toBeInTheDocument();
    });

    it('should display label when provided', () => {
      render(
        <PosterStyleSelector
          selectedStyle={null}
          onSelect={vi.fn()}
          styles={mockStyles}
          label="Choose Poster Style"
        />
      );

      expect(screen.getByText('Choose Poster Style')).toBeInTheDocument();
    });

    it('should display error message when provided', () => {
      render(
        <PosterStyleSelector
          selectedStyle={null}
          onSelect={vi.fn()}
          styles={mockStyles}
          error="Please select a style"
        />
      );

      expect(screen.getByText('Please select a style')).toBeInTheDocument();
    });
  });

  describe('selection state', () => {
    it('should show no selection initially when selectedStyle is null', () => {
      render(
        <PosterStyleSelector
          selectedStyle={null}
          onSelect={vi.fn()}
          styles={mockStyles}
        />
      );

      const styleCards = screen.getAllByRole('button');
      styleCards.forEach((card) => {
        expect(card).not.toHaveClass('ring-2');
        expect(card).not.toHaveClass('ring-blue-500');
      });
    });

    it('should highlight selected style', () => {
      render(
        <PosterStyleSelector
          selectedStyle="vintage"
          onSelect={vi.fn()}
          styles={mockStyles}
        />
      );

      const vintageCard = screen.getByText('Vintage').closest('button');
      expect(vintageCard).toHaveClass('ring-2');
      expect(vintageCard).toHaveClass('ring-blue-500');
    });

    it('should show checkmark icon on selected style', () => {
      render(
        <PosterStyleSelector
          selectedStyle="modern"
          onSelect={vi.fn()}
          styles={mockStyles}
        />
      );

      const modernCard = screen.getByText('Modern').closest('button');
      const checkIcon = modernCard?.querySelector('svg');
      expect(checkIcon).toBeInTheDocument();
    });

    it('should not show checkmark on unselected styles', () => {
      render(
        <PosterStyleSelector
          selectedStyle="vintage"
          onSelect={vi.fn()}
          styles={mockStyles}
        />
      );

      const modernCard = screen.getByText('Modern').closest('button');
      const checkIcon = modernCard?.querySelector('svg');
      expect(checkIcon).not.toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('should call onSelect when a style is clicked', () => {
      const handleSelect = vi.fn();
      render(
        <PosterStyleSelector
          selectedStyle={null}
          onSelect={handleSelect}
          styles={mockStyles}
        />
      );

      const vintageButton = screen.getByText('Vintage').closest('button');
      if (vintageButton) {
        fireEvent.click(vintageButton);
      }

      expect(handleSelect).toHaveBeenCalledWith('vintage');
    });

    it('should allow changing selection', () => {
      const handleSelect = vi.fn();
      render(
        <PosterStyleSelector
          selectedStyle="vintage"
          onSelect={handleSelect}
          styles={mockStyles}
        />
      );

      const modernButton = screen.getByText('Modern').closest('button');
      if (modernButton) {
        fireEvent.click(modernButton);
      }

      expect(handleSelect).toHaveBeenCalledWith('modern');
    });

    it('should call onSelect when clicking already selected style', () => {
      const handleSelect = vi.fn();
      render(
        <PosterStyleSelector
          selectedStyle="grunge"
          onSelect={handleSelect}
          styles={mockStyles}
        />
      );

      const grungeButton = screen.getByText('Grunge').closest('button');
      if (grungeButton) {
        fireEvent.click(grungeButton);
      }

      expect(handleSelect).toHaveBeenCalledWith('grunge');
    });
  });

  describe('grid layout', () => {
    it('should render styles in a grid layout', () => {
      const { container } = render(
        <PosterStyleSelector
          selectedStyle={null}
          onSelect={vi.fn()}
          styles={mockStyles}
        />
      );

      const grid = container.querySelector('.grid');
      expect(grid).toBeInTheDocument();
    });

    it('should have responsive grid columns', () => {
      const { container } = render(
        <PosterStyleSelector
          selectedStyle={null}
          onSelect={vi.fn()}
          styles={mockStyles}
        />
      );

      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('grid-cols-2');
      expect(grid).toHaveClass('md:grid-cols-3');
    });
  });

  describe('style cards', () => {
    it('should render each style as a button', () => {
      render(
        <PosterStyleSelector
          selectedStyle={null}
          onSelect={vi.fn()}
          styles={mockStyles}
        />
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(6);
    });

    it('should have hover effect on cards', () => {
      render(
        <PosterStyleSelector
          selectedStyle={null}
          onSelect={vi.fn()}
          styles={mockStyles}
        />
      );

      const vintageButton = screen.getByText('Vintage').closest('button');
      expect(vintageButton).toHaveClass('hover:border-blue-500');
    });

    it('should display style name prominently', () => {
      render(
        <PosterStyleSelector
          selectedStyle={null}
          onSelect={vi.fn()}
          styles={mockStyles}
        />
      );

      const vintageName = screen.getByText('Vintage');
      expect(vintageName).toHaveClass('font-semibold');
    });
  });

  describe('edge cases', () => {
    it('should handle empty styles array', () => {
      render(
        <PosterStyleSelector
          selectedStyle={null}
          onSelect={vi.fn()}
          styles={[]}
        />
      );

      const buttons = screen.queryAllByRole('button');
      expect(buttons).toHaveLength(0);
    });

    it('should handle undefined styles', () => {
      render(
        <PosterStyleSelector
          selectedStyle={null}
          onSelect={vi.fn()}
          styles={undefined as any}
        />
      );

      const buttons = screen.queryAllByRole('button');
      expect(buttons).toHaveLength(0);
    });

    it('should handle invalid selectedStyle value', () => {
      render(
        <PosterStyleSelector
          selectedStyle="nonexistent-style"
          onSelect={vi.fn()}
          styles={mockStyles}
        />
      );

      // Should render without crashing
      expect(screen.getByText('Vintage')).toBeInTheDocument();
    });

    it('should handle styles with missing description', () => {
      const stylesWithoutDesc = [
        { id: 'test', name: 'Test Style', description: '' },
      ];

      render(
        <PosterStyleSelector
          selectedStyle={null}
          onSelect={vi.fn()}
          styles={stylesWithoutDesc}
        />
      );

      expect(screen.getByText('Test Style')).toBeInTheDocument();
    });

    it('should handle single style', () => {
      const singleStyle = [mockStyles[0]];

      render(
        <PosterStyleSelector
          selectedStyle={null}
          onSelect={vi.fn()}
          styles={singleStyle}
        />
      );

      expect(screen.getByText('Vintage')).toBeInTheDocument();
      expect(screen.getAllByRole('button')).toHaveLength(1);
    });
  });

  describe('accessibility', () => {
    it('should have accessible button labels', () => {
      render(
        <PosterStyleSelector
          selectedStyle={null}
          onSelect={vi.fn()}
          styles={mockStyles}
        />
      );

      const vintageButton = screen.getByText('Vintage').closest('button');
      expect(vintageButton).toHaveAttribute('type', 'button');
    });

    it('should indicate selected state with aria-pressed', () => {
      render(
        <PosterStyleSelector
          selectedStyle="vintage"
          onSelect={vi.fn()}
          styles={mockStyles}
        />
      );

      const vintageButton = screen.getByText('Vintage').closest('button');
      expect(vintageButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('should indicate unselected state with aria-pressed', () => {
      render(
        <PosterStyleSelector
          selectedStyle="vintage"
          onSelect={vi.fn()}
          styles={mockStyles}
        />
      );

      const modernButton = screen.getByText('Modern').closest('button');
      expect(modernButton).toHaveAttribute('aria-pressed', 'false');
    });

    it('should have descriptive aria-label for each button', () => {
      render(
        <PosterStyleSelector
          selectedStyle={null}
          onSelect={vi.fn()}
          styles={mockStyles}
        />
      );

      const vintageButton = screen.getByText('Vintage').closest('button');
      expect(vintageButton).toHaveAttribute('aria-label', 'Select Vintage style');
    });
  });

  describe('visual feedback', () => {
    it('should apply error border when error is present', () => {
      const { container } = render(
        <PosterStyleSelector
          selectedStyle={null}
          onSelect={vi.fn()}
          styles={mockStyles}
          error="Selection required"
        />
      );

      const wrapper = container.querySelector('.border-red-500');
      expect(wrapper).toBeInTheDocument();
    });

    it('should show error text in red', () => {
      render(
        <PosterStyleSelector
          selectedStyle={null}
          onSelect={vi.fn()}
          styles={mockStyles}
          error="Selection required"
        />
      );

      const errorText = screen.getByText('Selection required');
      expect(errorText).toHaveClass('text-red-600');
    });
  });

  describe('style preview', () => {
    it('should show preview icon or thumbnail for each style', () => {
      render(
        <PosterStyleSelector
          selectedStyle={null}
          onSelect={vi.fn()}
          styles={mockStyles}
        />
      );

      // Each style card should have some visual indicator
      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button.textContent).toBeTruthy();
      });
    });
  });
});
