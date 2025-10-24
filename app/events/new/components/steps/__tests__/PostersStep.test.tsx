import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PostersStep } from '../PostersStep';

describe('PostersStep', () => {
  const mockStyles = [
    { id: 'vintage', name: 'Vintage', description: 'Retro style' },
    { id: 'modern', name: 'Modern', description: 'Clean and minimal' },
  ];

  const mockProps = {
    selectedStyle: null,
    styles: mockStyles,
    posterPreview: null,
    isGenerating: false,
    handlers: {
      onStyleSelect: vi.fn(),
      onGeneratePoster: vi.fn(),
      onSkip: vi.fn(),
    },
  };

  describe('rendering', () => {
    it('should render step description', () => {
      render(<PostersStep {...mockProps} />);

      expect(screen.getByText(/choose a poster style/i)).toBeInTheDocument();
    });

    it('should render style selector', () => {
      render(<PostersStep {...mockProps} />);

      expect(screen.getByText('Vintage')).toBeInTheDocument();
      expect(screen.getByText('Modern')).toBeInTheDocument();
    });

    it('should render generate button', () => {
      render(<PostersStep {...mockProps} />);

      expect(screen.getByRole('button', { name: /generate poster/i })).toBeInTheDocument();
    });

    it('should render skip button', () => {
      render(<PostersStep {...mockProps} />);

      expect(screen.getByRole('button', { name: /skip for now/i })).toBeInTheDocument();
    });

    it('should show helper text', () => {
      render(<PostersStep {...mockProps} />);

      expect(screen.getByText(/ai will generate a custom poster/i)).toBeInTheDocument();
    });
  });

  describe('style selection', () => {
    it('should call onStyleSelect when style is clicked', () => {
      render(<PostersStep {...mockProps} />);

      const vintageButton = screen.getByText('Vintage').closest('button');
      if (vintageButton) fireEvent.click(vintageButton);

      expect(mockProps.handlers.onStyleSelect).toHaveBeenCalledWith('vintage');
    });

    it('should show selected style', () => {
      const propsWithSelection = {
        ...mockProps,
        selectedStyle: 'vintage',
      };

      render(<PostersStep {...propsWithSelection} />);

      const vintageButton = screen.getByText('Vintage').closest('button');
      expect(vintageButton).toHaveClass('border-blue-500');
    });

    it('should allow changing selection', () => {
      const propsWithSelection = {
        ...mockProps,
        selectedStyle: 'vintage',
      };

      render(<PostersStep {...propsWithSelection} />);

      const modernButton = screen.getByText('Modern').closest('button');
      if (modernButton) fireEvent.click(modernButton);

      expect(mockProps.handlers.onStyleSelect).toHaveBeenCalledWith('modern');
    });
  });

  describe('poster generation', () => {
    it('should call onGeneratePoster when generate button is clicked', () => {
      const propsWithSelection = {
        ...mockProps,
        selectedStyle: 'vintage',
      };

      render(<PostersStep {...propsWithSelection} />);

      const generateButton = screen.getByRole('button', { name: /generate poster/i });
      fireEvent.click(generateButton);

      expect(mockProps.handlers.onGeneratePoster).toHaveBeenCalled();
    });

    it('should disable generate button when no style selected', () => {
      render(<PostersStep {...mockProps} />);

      const generateButton = screen.getByRole('button', { name: /generate poster/i });
      expect(generateButton).toBeDisabled();
    });

    it('should enable generate button when style selected', () => {
      const propsWithSelection = {
        ...mockProps,
        selectedStyle: 'vintage',
      };

      render(<PostersStep {...propsWithSelection} />);

      const generateButton = screen.getByRole('button', { name: /generate poster/i });
      expect(generateButton).not.toBeDisabled();
    });

    it('should show loading state while generating', () => {
      const propsGenerating = {
        ...mockProps,
        selectedStyle: 'vintage',
        isGenerating: true,
      };

      render(<PostersStep {...propsGenerating} />);

      expect(screen.getByText(/generating/i)).toBeInTheDocument();
    });

    it('should disable buttons while generating', () => {
      const propsGenerating = {
        ...mockProps,
        selectedStyle: 'vintage',
        isGenerating: true,
      };

      render(<PostersStep {...propsGenerating} />);

      const generateButton = screen.getByRole('button', { name: /generating/i });
      expect(generateButton).toBeDisabled();
    });
  });

  describe('poster preview', () => {
    it('should show preview when poster is generated', () => {
      const propsWithPreview = {
        ...mockProps,
        posterPreview: 'https://example.com/poster.jpg',
      };

      render(<PostersStep {...propsWithPreview} />);

      const preview = screen.getByAltText(/generated poster/i);
      expect(preview).toBeInTheDocument();
      expect(preview).toHaveAttribute('src', 'https://example.com/poster.jpg');
    });

    it('should not show preview when no poster generated', () => {
      render(<PostersStep {...mockProps} />);

      expect(screen.queryByAltText(/generated poster/i)).not.toBeInTheDocument();
    });

    it('should show preview section heading when poster exists', () => {
      const propsWithPreview = {
        ...mockProps,
        posterPreview: 'https://example.com/poster.jpg',
      };

      render(<PostersStep {...propsWithPreview} />);

      expect(screen.getByText(/preview/i)).toBeInTheDocument();
    });
  });

  describe('skip functionality', () => {
    it('should call onSkip when skip button is clicked', () => {
      render(<PostersStep {...mockProps} />);

      const skipButton = screen.getByRole('button', { name: /skip for now/i });
      fireEvent.click(skipButton);

      expect(mockProps.handlers.onSkip).toHaveBeenCalled();
    });

    it('should allow skipping even with no selection', () => {
      render(<PostersStep {...mockProps} />);

      const skipButton = screen.getByRole('button', { name: /skip for now/i });
      expect(skipButton).not.toBeDisabled();
    });

    it('should disable skip during generation', () => {
      const propsGenerating = {
        ...mockProps,
        isGenerating: true,
      };

      render(<PostersStep {...propsGenerating} />);

      const skipButton = screen.getByRole('button', { name: /skip for now/i });
      expect(skipButton).toBeDisabled();
    });
  });

  describe('empty state', () => {
    it('should handle empty styles array', () => {
      const propsWithNoStyles = {
        ...mockProps,
        styles: [],
      };

      render(<PostersStep {...propsWithNoStyles} />);

      expect(screen.getByText(/no styles available/i)).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have accessible buttons', () => {
      render(<PostersStep {...mockProps} />);

      expect(screen.getByRole('button', { name: /generate poster/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /skip for now/i })).toBeInTheDocument();
    });

    it('should have alt text for preview image', () => {
      const propsWithPreview = {
        ...mockProps,
        posterPreview: 'https://example.com/poster.jpg',
      };

      render(<PostersStep {...propsWithPreview} />);

      const image = screen.getByAltText(/generated poster/i);
      expect(image).toBeInTheDocument();
    });
  });

  describe('style descriptions', () => {
    it('should show style descriptions', () => {
      render(<PostersStep {...mockProps} />);

      expect(screen.getByText('Retro style')).toBeInTheDocument();
      expect(screen.getByText('Clean and minimal')).toBeInTheDocument();
    });
  });

  describe('user guidance', () => {
    it('should show instruction text', () => {
      render(<PostersStep {...mockProps} />);

      expect(screen.getByText(/select a style below/i)).toBeInTheDocument();
    });

    it('should show what happens on skip', () => {
      render(<PostersStep {...mockProps} />);

      expect(screen.getByText(/you can add a poster later/i)).toBeInTheDocument();
    });
  });
});
