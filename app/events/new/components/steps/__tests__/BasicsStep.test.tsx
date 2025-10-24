import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BasicsStep } from '../BasicsStep';
import type { Artist } from '@/app/events/new/types';

describe('BasicsStep', () => {
  const mockArtists: Artist[] = [
    { id: '1', name: 'Artist One', slug: 'artist-one', genre: 'Rock' },
    { id: '2', name: 'Artist Two', slug: 'artist-two', genre: 'Pop' },
  ];

  const mockProps = {
    formData: {
      title: '',
      posterImageUrl: '',
      externalLink: '',
      primaryArtistId: '',
    },
    errors: {},
    artists: mockArtists,
    selectedArtist: null,
    posterFile: null,
    posterPreview: null,
    handlers: {
      onFieldChange: vi.fn(),
      onArtistSelect: vi.fn(),
      onPosterFileChange: vi.fn(),
      onPosterDrop: vi.fn(),
      onClearPoster: vi.fn(),
    },
  };

  describe('rendering', () => {
    it('should render all fields', () => {
      render(<BasicsStep {...mockProps} />);

      expect(screen.getByLabelText(/event title/i)).toBeInTheDocument();
      expect(screen.getByRole('combobox', { name: /search for artist/i })).toBeInTheDocument();
      expect(screen.getByText(/poster image file/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/poster image url/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/external event link/i)).toBeInTheDocument();
    });

    it('should display step description', () => {
      render(<BasicsStep {...mockProps} />);

      expect(screen.getByText(/enter the basic information/i)).toBeInTheDocument();
    });

    it('should show all form sections', () => {
      render(<BasicsStep {...mockProps} />);

      expect(screen.getByText(/event details/i)).toBeInTheDocument();
      expect(screen.getByText(/^poster$/i)).toBeInTheDocument();
    });
  });

  describe('field updates', () => {
    it('should call onFieldChange when title is updated', () => {
      render(<BasicsStep {...mockProps} />);

      const titleInput = screen.getByLabelText(/event title/i);
      fireEvent.change(titleInput, { target: { value: 'My Concert' } });

      expect(mockProps.handlers.onFieldChange).toHaveBeenCalledWith('title', 'My Concert');
    });

    it('should call onFieldChange when poster URL is updated', () => {
      render(<BasicsStep {...mockProps} />);

      const urlInput = screen.getByLabelText(/poster image url/i);
      fireEvent.change(urlInput, { target: { value: 'https://example.com/poster.jpg' } });

      expect(mockProps.handlers.onFieldChange).toHaveBeenCalledWith('posterImageUrl', 'https://example.com/poster.jpg');
    });

    it('should call onFieldChange when external link is updated', () => {
      render(<BasicsStep {...mockProps} />);

      const linkInput = screen.getByLabelText(/external event link/i);
      fireEvent.change(linkInput, { target: { value: 'https://eventbrite.com/event' } });

      expect(mockProps.handlers.onFieldChange).toHaveBeenCalledWith('externalLink', 'https://eventbrite.com/event');
    });

    it('should call onArtistSelect when artist is selected', () => {
      render(<BasicsStep {...mockProps} />);

      const artistInput = screen.getByRole('combobox', { name: /search for artist/i });
      fireEvent.change(artistInput, { target: { value: 'Artist' } });
      fireEvent.focus(artistInput);

      const artistOption = screen.getByText('Artist One');
      fireEvent.mouseDown(artistOption);

      expect(mockProps.handlers.onArtistSelect).toHaveBeenCalledWith(mockArtists[0]);
    });
  });

  describe('validation errors', () => {
    it('should display validation errors', () => {
      const propsWithErrors = {
        ...mockProps,
        errors: {
          title: 'Title is required',
          posterImageUrl: 'Invalid URL',
        },
      };

      render(<BasicsStep {...propsWithErrors} />);

      expect(screen.getByText('Title is required')).toBeInTheDocument();
      expect(screen.getByText('Invalid URL')).toBeInTheDocument();
    });

    it('should apply error styling to inputs with errors', () => {
      const propsWithErrors = {
        ...mockProps,
        errors: {
          title: 'Title is required',
        },
      };

      render(<BasicsStep {...propsWithErrors} />);

      const titleInput = screen.getByLabelText(/event title/i);
      expect(titleInput).toHaveClass('border-red-500');
    });

    it('should show multiple errors simultaneously', () => {
      const propsWithErrors = {
        ...mockProps,
        errors: {
          title: 'Title is required',
          primaryArtistId: 'Artist is required',
          externalLink: 'Invalid URL format',
        },
      };

      render(<BasicsStep {...propsWithErrors} />);

      expect(screen.getByText('Title is required')).toBeInTheDocument();
      expect(screen.getByText('Artist is required')).toBeInTheDocument();
      expect(screen.getByText('Invalid URL format')).toBeInTheDocument();
    });
  });

  describe('poster file upload', () => {
    it('should show poster preview when file is uploaded', () => {
      const propsWithPoster = {
        ...mockProps,
        posterPreview: 'data:image/png;base64,iVBORw0KGgo=',
        posterFile: new File([''], 'poster.png', { type: 'image/png' }),
      };

      render(<BasicsStep {...propsWithPoster} />);

      expect(screen.getByAltText(/poster preview/i)).toBeInTheDocument();
    });

    it('should call onPosterFileChange when file is selected', () => {
      render(<BasicsStep {...mockProps} />);

      const fileInput = screen.getByLabelText(/upload poster file/i);
      const file = new File(['poster'], 'poster.png', { type: 'image/png' });

      fireEvent.change(fileInput, { target: { files: [file] } });

      expect(mockProps.handlers.onPosterFileChange).toHaveBeenCalledWith(expect.objectContaining({ target: expect.anything() }));
    });

    it('should show clear button when poster is uploaded', () => {
      const propsWithPoster = {
        ...mockProps,
        posterPreview: 'data:image/png;base64,iVBORw0KGgo=',
        posterFile: new File([''], 'poster.png', { type: 'image/png' }),
      };

      render(<BasicsStep {...propsWithPoster} />);

      expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument();
    });

    it('should call onClearPoster when clear button is clicked', () => {
      const propsWithPoster = {
        ...mockProps,
        posterPreview: 'data:image/png;base64,iVBORw0KGgo=',
        posterFile: new File([''], 'poster.png', { type: 'image/png' }),
      };

      render(<BasicsStep {...propsWithPoster} />);

      const clearButton = screen.getByRole('button', { name: /clear/i });
      fireEvent.click(clearButton);

      expect(mockProps.handlers.onClearPoster).toHaveBeenCalled();
    });

    it('should show file name when poster is uploaded', () => {
      const propsWithPoster = {
        ...mockProps,
        posterFile: new File([''], 'my-poster.png', { type: 'image/png' }),
      };

      render(<BasicsStep {...propsWithPoster} />);

      expect(screen.getByText(/my-poster\.png/i)).toBeInTheDocument();
    });
  });

  describe('artist selection', () => {
    it('should display selected artist name', () => {
      const propsWithArtist = {
        ...mockProps,
        formData: {
          ...mockProps.formData,
          primaryArtistId: '1',
        },
        selectedArtist: mockArtists[0],
      };

      render(<BasicsStep {...propsWithArtist} />);

      const artistInput = screen.getByRole('combobox', { name: /search for artist/i }) as HTMLInputElement;
      expect(artistInput.value).toBe('Artist One');
    });

    it('should show artist search dropdown when focused', () => {
      render(<BasicsStep {...mockProps} />);

      const artistInput = screen.getByRole('combobox', { name: /search for artist/i });
      fireEvent.focus(artistInput);

      expect(screen.getByText('Artist One')).toBeInTheDocument();
      expect(screen.getByText('Artist Two')).toBeInTheDocument();
    });

    it('should show artist search component', () => {
      render(<BasicsStep {...mockProps} />);

      const artistInput = screen.getByRole('combobox', { name: /search for artist/i });
      expect(artistInput).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have proper labels for all inputs', () => {
      render(<BasicsStep {...mockProps} />);

      expect(screen.getByLabelText(/event title/i)).toBeInTheDocument();
      expect(screen.getByRole('combobox', { name: /search for artist/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/poster image url/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/external event link/i)).toBeInTheDocument();
    });

    it('should have required indicators on required fields', () => {
      render(<BasicsStep {...mockProps} />);

      const titleLabel = screen.getByText(/event title/i);
      const artistLabel = screen.getByText(/primary artist/i);

      expect(titleLabel.textContent).toContain('*');
      expect(artistLabel.textContent).toContain('*');
    });

    it('should associate error messages with inputs via aria-describedby', () => {
      const propsWithErrors = {
        ...mockProps,
        errors: {
          title: 'Title is required',
        },
      };

      render(<BasicsStep {...propsWithErrors} />);

      const titleInput = screen.getByLabelText(/event title/i);
      const errorId = titleInput.getAttribute('aria-describedby');

      expect(errorId).toBeTruthy();
      expect(screen.getByText('Title is required')).toHaveAttribute('id', errorId);
    });
  });

  describe('edge cases', () => {
    it('should handle empty artists array', () => {
      const propsWithNoArtists = {
        ...mockProps,
        artists: [],
      };

      render(<BasicsStep {...propsWithNoArtists} />);

      const artistInput = screen.getByRole('combobox', { name: /search for artist/i });
      fireEvent.focus(artistInput);

      expect(screen.getByText(/no artists found/i)).toBeInTheDocument();
    });

    it('should handle very long event title', () => {
      const longTitle = 'A'.repeat(200);
      const propsWithLongTitle = {
        ...mockProps,
        formData: {
          ...mockProps.formData,
          title: longTitle,
        },
      };

      render(<BasicsStep {...propsWithLongTitle} />);

      const titleInput = screen.getByLabelText(/event title/i) as HTMLInputElement;
      expect(titleInput.value).toBe(longTitle);
    });

    it('should handle null posterFile gracefully', () => {
      const propsWithNullPoster = {
        ...mockProps,
        posterFile: null,
        posterPreview: null,
      };

      render(<BasicsStep {...propsWithNullPoster} />);

      expect(screen.queryByAltText(/poster preview/i)).not.toBeInTheDocument();
    });

    it('should handle undefined errors object', () => {
      const propsWithUndefinedErrors = {
        ...mockProps,
        errors: undefined as any,
      };

      render(<BasicsStep {...propsWithUndefinedErrors} />);

      expect(screen.getByLabelText(/event title/i)).toBeInTheDocument();
    });
  });

  describe('help text', () => {
    it('should show helper text for poster URL field', () => {
      render(<BasicsStep {...mockProps} />);

      expect(screen.getByText(/enter a direct url to a poster image/i)).toBeInTheDocument();
    });

    it('should show helper text for external link field', () => {
      render(<BasicsStep {...mockProps} />);

      expect(screen.getByText(/optional link to external event page/i)).toBeInTheDocument();
    });
  });
});
