import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ScheduleStep } from '../ScheduleStep';
import type { Venue } from '@/app/events/new/types';

describe('ScheduleStep', () => {
  const mockVenues: Venue[] = [
    { id: '1', name: 'Venue One', slug: 'venue-one', city: 'New York', capacity: 500 },
    { id: '2', name: 'Venue Two', slug: 'venue-two', city: 'Los Angeles', capacity: 1000 },
  ];

  const mockProps = {
    formData: {
      startsAt: '',
      endsAt: '',
      doorsOpen: '',
      venueId: '',
      mapsLink: '',
    },
    errors: {},
    venues: mockVenues,
    selectedVenue: null,
    handlers: {
      onFieldChange: vi.fn(),
      onVenueSelect: vi.fn(),
    },
  };

  describe('rendering', () => {
    it('should render all fields', () => {
      render(<ScheduleStep {...mockProps} />);

      expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/end date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/doors open/i)).toBeInTheDocument();
      expect(screen.getByRole('combobox', { name: /search for venue/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/maps link/i)).toBeInTheDocument();
    });

    it('should display step description', () => {
      render(<ScheduleStep {...mockProps} />);

      expect(screen.getByText(/set the schedule for your event/i)).toBeInTheDocument();
    });

    it('should show form sections', () => {
      render(<ScheduleStep {...mockProps} />);

      expect(screen.getByRole('heading', { name: /date & time/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /^venue$/i })).toBeInTheDocument();
    });

    it('should show helper text for dates', () => {
      render(<ScheduleStep {...mockProps} />);

      expect(screen.getByText(/when does the event start/i)).toBeInTheDocument();
      expect(screen.getByText(/optional: when does the event end/i)).toBeInTheDocument();
      expect(screen.getByText(/optional: when do doors open/i)).toBeInTheDocument();
    });
  });

  describe('field updates', () => {
    it('should call onFieldChange when start date is updated', () => {
      render(<ScheduleStep {...mockProps} />);

      const startInput = screen.getByLabelText(/start date/i);
      fireEvent.change(startInput, { target: { value: '2025-12-01T19:00' } });

      expect(mockProps.handlers.onFieldChange).toHaveBeenCalledWith('startsAt', '2025-12-01T19:00');
    });

    it('should call onFieldChange when end date is updated', () => {
      render(<ScheduleStep {...mockProps} />);

      const endInput = screen.getByLabelText(/end date/i);
      fireEvent.change(endInput, { target: { value: '2025-12-01T23:00' } });

      expect(mockProps.handlers.onFieldChange).toHaveBeenCalledWith('endsAt', '2025-12-01T23:00');
    });

    it('should call onFieldChange when doors open is updated', () => {
      render(<ScheduleStep {...mockProps} />);

      const doorsInput = screen.getByLabelText(/doors open/i);
      fireEvent.change(doorsInput, { target: { value: '2025-12-01T18:00' } });

      expect(mockProps.handlers.onFieldChange).toHaveBeenCalledWith('doorsOpen', '2025-12-01T18:00');
    });

    it('should call onVenueSelect when venue is selected', () => {
      render(<ScheduleStep {...mockProps} />);

      const venueInput = screen.getByRole('combobox', { name: /search for venue/i });
      fireEvent.change(venueInput, { target: { value: 'Venue' } });
      fireEvent.focus(venueInput);

      const venueOption = screen.getByText('Venue One');
      fireEvent.mouseDown(venueOption);

      expect(mockProps.handlers.onVenueSelect).toHaveBeenCalledWith(mockVenues[0]);
    });

    it('should call onFieldChange when maps link is updated', () => {
      render(<ScheduleStep {...mockProps} />);

      const mapsInput = screen.getByLabelText(/maps link/i);
      fireEvent.change(mapsInput, { target: { value: 'https://maps.google.com/venue' } });

      expect(mockProps.handlers.onFieldChange).toHaveBeenCalledWith('mapsLink', 'https://maps.google.com/venue');
    });
  });

  describe('validation errors', () => {
    it('should display validation errors', () => {
      const propsWithErrors = {
        ...mockProps,
        errors: {
          startsAt: 'Start date is required',
          venueId: 'Venue is required',
        },
      };

      render(<ScheduleStep {...propsWithErrors} />);

      expect(screen.getByText('Start date is required')).toBeInTheDocument();
      expect(screen.getByText('Venue is required')).toBeInTheDocument();
    });

    it('should apply error styling to inputs with errors', () => {
      const propsWithErrors = {
        ...mockProps,
        errors: {
          startsAt: 'Start date is required',
        },
      };

      render(<ScheduleStep {...propsWithErrors} />);

      const startInput = screen.getByLabelText(/start date/i);
      expect(startInput).toHaveClass('border-red-500');
    });

    it('should show end date validation error', () => {
      const propsWithErrors = {
        ...mockProps,
        errors: {
          endsAt: 'End date must be after start date',
        },
      };

      render(<ScheduleStep {...propsWithErrors} />);

      expect(screen.getByText('End date must be after start date')).toBeInTheDocument();
    });

    it('should show maps link validation error', () => {
      const propsWithErrors = {
        ...mockProps,
        errors: {
          mapsLink: 'Invalid URL format',
        },
      };

      render(<ScheduleStep {...propsWithErrors} />);

      expect(screen.getByText('Invalid URL format')).toBeInTheDocument();
    });
  });

  describe('venue selection', () => {
    it('should display selected venue name', () => {
      const propsWithVenue = {
        ...mockProps,
        formData: {
          ...mockProps.formData,
          venueId: '1',
        },
        selectedVenue: mockVenues[0],
      };

      render(<ScheduleStep {...propsWithVenue} />);

      const venueInput = screen.getByRole('combobox', { name: /search for venue/i }) as HTMLInputElement;
      expect(venueInput.value).toBe('Venue One');
    });

    it('should show venue search dropdown when focused', () => {
      render(<ScheduleStep {...mockProps} />);

      const venueInput = screen.getByRole('combobox', { name: /search for venue/i });
      fireEvent.focus(venueInput);

      expect(screen.getByText('Venue One')).toBeInTheDocument();
      expect(screen.getByText('Venue Two')).toBeInTheDocument();
    });

    it('should show venue search component', () => {
      render(<ScheduleStep {...mockProps} />);

      const venueInput = screen.getByRole('combobox', { name: /search for venue/i });
      expect(venueInput).toBeInTheDocument();
    });

    it('should show venue city in dropdown', () => {
      render(<ScheduleStep {...mockProps} />);

      const venueInput = screen.getByRole('combobox', { name: /search for venue/i });
      fireEvent.focus(venueInput);

      expect(screen.getByText(/new york/i)).toBeInTheDocument();
      expect(screen.getByText(/los angeles/i)).toBeInTheDocument();
    });
  });

  describe('date/time inputs', () => {
    it('should use datetime-local input type for start date', () => {
      render(<ScheduleStep {...mockProps} />);

      const startInput = screen.getByLabelText(/start date/i);
      expect(startInput).toHaveAttribute('type', 'datetime-local');
    });

    it('should use datetime-local input type for end date', () => {
      render(<ScheduleStep {...mockProps} />);

      const endInput = screen.getByLabelText(/end date/i);
      expect(endInput).toHaveAttribute('type', 'datetime-local');
    });

    it('should use datetime-local input type for doors open', () => {
      render(<ScheduleStep {...mockProps} />);

      const doorsInput = screen.getByLabelText(/doors open/i);
      expect(doorsInput).toHaveAttribute('type', 'datetime-local');
    });

    it('should preserve time values when changed', () => {
      const propsWithTimes = {
        ...mockProps,
        formData: {
          ...mockProps.formData,
          startsAt: '2025-12-01T19:00',
          endsAt: '2025-12-01T23:00',
          doorsOpen: '2025-12-01T18:00',
        },
      };

      render(<ScheduleStep {...propsWithTimes} />);

      expect(screen.getByLabelText(/start date/i)).toHaveValue('2025-12-01T19:00');
      expect(screen.getByLabelText(/end date/i)).toHaveValue('2025-12-01T23:00');
      expect(screen.getByLabelText(/doors open/i)).toHaveValue('2025-12-01T18:00');
    });
  });

  describe('accessibility', () => {
    it('should have proper labels for all inputs', () => {
      render(<ScheduleStep {...mockProps} />);

      expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/end date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/doors open/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/maps link/i)).toBeInTheDocument();
    });

    it('should have required indicators on required fields', () => {
      render(<ScheduleStep {...mockProps} />);

      const startLabel = screen.getByText(/start date & time \*/i);
      const venueLabel = screen.getByText(/^venue \*$/i);

      expect(startLabel.textContent).toContain('*');
      expect(venueLabel.textContent).toContain('*');
    });

    it('should associate error messages with inputs via aria-describedby', () => {
      const propsWithErrors = {
        ...mockProps,
        errors: {
          startsAt: 'Start date is required',
        },
      };

      render(<ScheduleStep {...propsWithErrors} />);

      const startInput = screen.getByLabelText(/start date/i);
      const errorId = startInput.getAttribute('aria-describedby');

      expect(errorId).toBeTruthy();
      expect(screen.getByText('Start date is required')).toHaveAttribute('id', errorId);
    });
  });

  describe('edge cases', () => {
    it('should handle empty venues array', () => {
      const propsWithNoVenues = {
        ...mockProps,
        venues: [],
      };

      render(<ScheduleStep {...propsWithNoVenues} />);

      const venueInput = screen.getByRole('combobox', { name: /search for venue/i });
      fireEvent.focus(venueInput);

      expect(screen.getByText(/no venues found/i)).toBeInTheDocument();
    });

    it('should handle undefined errors object', () => {
      const propsWithUndefinedErrors = {
        ...mockProps,
        errors: undefined as any,
      };

      render(<ScheduleStep {...propsWithUndefinedErrors} />);

      expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
    });

    it('should handle null selectedVenue gracefully', () => {
      const propsWithNullVenue = {
        ...mockProps,
        selectedVenue: null,
      };

      render(<ScheduleStep {...propsWithNullVenue} />);

      const venueInput = screen.getByRole('combobox', { name: /search for venue/i }) as HTMLInputElement;
      expect(venueInput.value).toBe('');
    });

    it('should handle empty date strings', () => {
      render(<ScheduleStep {...mockProps} />);

      expect(screen.getByLabelText(/start date/i)).toHaveValue('');
      expect(screen.getByLabelText(/end date/i)).toHaveValue('');
      expect(screen.getByLabelText(/doors open/i)).toHaveValue('');
    });
  });

  describe('maps link', () => {
    it('should show helper text for maps link', () => {
      render(<ScheduleStep {...mockProps} />);

      expect(screen.getByText(/google maps link to the venue/i)).toBeInTheDocument();
    });

    it('should accept maps link URL format', () => {
      render(<ScheduleStep {...mockProps} />);

      const mapsInput = screen.getByLabelText(/maps link/i);
      expect(mapsInput).toHaveAttribute('type', 'url');
    });

    it('should display maps link value', () => {
      const propsWithMaps = {
        ...mockProps,
        formData: {
          ...mockProps.formData,
          mapsLink: 'https://maps.google.com/venue',
        },
      };

      render(<ScheduleStep {...propsWithMaps} />);

      expect(screen.getByLabelText(/maps link/i)).toHaveValue('https://maps.google.com/venue');
    });
  });
});
