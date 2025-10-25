import { render, screen, fireEvent } from '@testing-library/react';
import { StatusSelector } from '../StatusSelector';
import { describe, it, expect, vi } from 'vitest';

describe('StatusSelector', () => {
  const mockOnChange = vi.fn();

  const defaultProps = {
    value: 'draft' as 'draft' | 'published',
    onChange: mockOnChange,
    validationState: {
      ready: true,
      errors: [],
      warnings: [],
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders draft and publish buttons', () => {
    render(<StatusSelector {...defaultProps} />);

    expect(screen.getByText(/Save as draft/i)).toBeInTheDocument();
    expect(screen.getByText(/Publish now/i)).toBeInTheDocument();
  });

  it('highlights the selected status', () => {
    const { rerender } = render(<StatusSelector {...defaultProps} value="draft" />);

    const draftButton = screen.getByRole('button', { name: /Save as draft/i });
    const publishButton = screen.getByRole('button', { name: /Publish now/i });

    expect(draftButton).toHaveClass('border-acid-400');
    expect(publishButton).not.toHaveClass('border-acid-400');

    rerender(<StatusSelector {...defaultProps} value="published" />);

    expect(draftButton).not.toHaveClass('border-acid-400');
    expect(publishButton).toHaveClass('border-acid-400');
  });

  it('calls onChange with draft when draft button clicked', () => {
    render(<StatusSelector {...defaultProps} value="published" />);

    const draftButton = screen.getByRole('button', { name: /Save as draft/i });
    fireEvent.click(draftButton);

    expect(mockOnChange).toHaveBeenCalledWith('draft');
  });

  it('calls onChange with published when publish button clicked', () => {
    render(<StatusSelector {...defaultProps} value="draft" />);

    const publishButton = screen.getByRole('button', { name: /Publish now/i });
    fireEvent.click(publishButton);

    expect(mockOnChange).toHaveBeenCalledWith('published');
  });

  it('shows validation warnings when not ready to publish', () => {
    const propsWithErrors = {
      ...defaultProps,
      validationState: {
        ready: false,
        errors: ['Event must have a venue', 'Event must have a primary artist'],
        warnings: [],
      },
    };

    render(<StatusSelector {...propsWithErrors} />);

    expect(screen.getByText(/Event must have a venue/i)).toBeInTheDocument();
    expect(screen.getByText(/Event must have a primary artist/i)).toBeInTheDocument();
  });

  it('disables publish button when validation fails', () => {
    const propsWithErrors = {
      ...defaultProps,
      validationState: {
        ready: false,
        errors: ['Event must have a venue'],
        warnings: [],
      },
    };

    render(<StatusSelector {...propsWithErrors} />);

    const publishButton = screen.getByRole('button', { name: /Publish now/i });
    expect(publishButton).toBeDisabled();
  });

  it('allows publish button when validation passes', () => {
    render(<StatusSelector {...defaultProps} />);

    const publishButton = screen.getByRole('button', { name: /Publish now/i });
    expect(publishButton).not.toBeDisabled();
  });

  it('shows custom labels when provided', () => {
    const customProps = {
      ...defaultProps,
      labels: {
        draft: {
          title: 'Keep Private',
          description: 'Only you can see this',
        },
        published: {
          title: 'Make Public',
          description: 'Everyone can see this',
        },
      },
    };

    render(<StatusSelector {...customProps} />);

    expect(screen.getByText('Keep Private')).toBeInTheDocument();
    expect(screen.getByText('Only you can see this')).toBeInTheDocument();
    expect(screen.getByText('Make Public')).toBeInTheDocument();
    expect(screen.getByText('Everyone can see this')).toBeInTheDocument();
  });

  it('uses default labels when not provided', () => {
    render(<StatusSelector {...defaultProps} />);

    expect(screen.getByText(/Save as draft/i)).toBeInTheDocument();
    expect(screen.getByText(/Publish now/i)).toBeInTheDocument();
  });

  it('displays warnings even when ready to publish', () => {
    const propsWithWarnings = {
      ...defaultProps,
      validationState: {
        ready: true,
        errors: [],
        warnings: ['Event has no poster image'],
      },
    };

    render(<StatusSelector {...propsWithWarnings} />);

    expect(screen.getByText(/Event has no poster image/i)).toBeInTheDocument();
  });

  it('distinguishes between errors and warnings visually', () => {
    const propsWithBoth = {
      ...defaultProps,
      validationState: {
        ready: false,
        errors: ['Event must have a venue'],
        warnings: ['Event has no poster image'],
      },
    };

    render(<StatusSelector {...propsWithBoth} />);

    // Errors should have error styling (text-signal-500 is on the li element)
    const errorElement = screen.getByText(/Event must have a venue/i);
    expect(errorElement).toHaveClass('text-signal-500');

    // Warnings should have warning styling (text-yellow-500 is on the li element)
    const warningElement = screen.getByText(/Event has no poster image/i);
    expect(warningElement).toHaveClass('text-yellow-500');
  });

  it('handles empty validation state gracefully', () => {
    const propsWithEmptyValidation = {
      ...defaultProps,
      validationState: {
        ready: true,
        errors: [],
        warnings: [],
      },
    };

    render(<StatusSelector {...propsWithEmptyValidation} />);

    // Should render without errors
    expect(screen.getByText(/Save as draft/i)).toBeInTheDocument();
  });
});
