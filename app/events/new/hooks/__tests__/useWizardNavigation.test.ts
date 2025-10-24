import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWizardNavigation } from '../useWizardNavigation';
import { WIZARD_STEPS } from '../../types';

// Mock validation hook
const createMockValidation = (errors = {}) => ({
  errors,
  validateStep: vi.fn((_stepId) => errors),
  clearErrors: vi.fn(),
});

describe('useWizardNavigation', () => {
  describe('initialization', () => {
    it('should start at step 0 (basics)', () => {
      const mockValidation = createMockValidation();
      const { result } = renderHook(() => useWizardNavigation(mockValidation));

      expect(result.current.currentStepIndex).toBe(0);
      expect(result.current.currentStep.id).toBe('basics');
    });

    it('should expose all wizard steps', () => {
      const mockValidation = createMockValidation();
      const { result } = renderHook(() => useWizardNavigation(mockValidation));

      expect(result.current.steps).toEqual(WIZARD_STEPS);
      expect(result.current.steps).toHaveLength(5);
    });

    it('should calculate total steps correctly', () => {
      const mockValidation = createMockValidation();
      const { result } = renderHook(() => useWizardNavigation(mockValidation));

      expect(result.current.totalSteps).toBe(5);
    });
  });

  describe('step information', () => {
    it('should provide current step details', () => {
      const mockValidation = createMockValidation();
      const { result } = renderHook(() => useWizardNavigation(mockValidation));

      expect(result.current.currentStep).toEqual({
        id: 'basics',
        title: 'Basics',
        description: 'Name your event and add optional branding links.',
      });
    });

    it('should update current step when navigating', () => {
      const mockValidation = createMockValidation();
      const { result } = renderHook(() => useWizardNavigation(mockValidation));

      act(() => {
        result.current.goToStep(2);
      });

      expect(result.current.currentStep.id).toBe('tickets');
      expect(result.current.currentStep.title).toBe('Tickets & Seating');
    });

    it('should indicate if on first step', () => {
      const mockValidation = createMockValidation();
      const { result } = renderHook(() => useWizardNavigation(mockValidation));

      expect(result.current.isFirstStep).toBe(true);

      act(() => {
        result.current.goToStep(1);
      });

      expect(result.current.isFirstStep).toBe(false);
    });

    it('should indicate if on last step', () => {
      const mockValidation = createMockValidation();
      const { result } = renderHook(() => useWizardNavigation(mockValidation));

      expect(result.current.isLastStep).toBe(false);

      act(() => {
        result.current.goToStep(4); // Review step
      });

      expect(result.current.isLastStep).toBe(true);
    });
  });

  describe('goToStep', () => {
    it('should navigate to specific step by index', () => {
      const mockValidation = createMockValidation();
      const { result } = renderHook(() => useWizardNavigation(mockValidation));

      act(() => {
        result.current.goToStep(3);
      });

      expect(result.current.currentStepIndex).toBe(3);
      expect(result.current.currentStep.id).toBe('posters');
    });

    it('should not navigate below 0', () => {
      const mockValidation = createMockValidation();
      const { result } = renderHook(() => useWizardNavigation(mockValidation));

      act(() => {
        result.current.goToStep(-1);
      });

      expect(result.current.currentStepIndex).toBe(0);
    });

    it('should not navigate beyond last step', () => {
      const mockValidation = createMockValidation();
      const { result } = renderHook(() => useWizardNavigation(mockValidation));

      act(() => {
        result.current.goToStep(10);
      });

      expect(result.current.currentStepIndex).toBe(0);
    });

    it('should clear errors when navigating', () => {
      const mockValidation = createMockValidation();
      const { result } = renderHook(() => useWizardNavigation(mockValidation));

      act(() => {
        result.current.goToStep(1);
      });

      expect(mockValidation.clearErrors).toHaveBeenCalled();
    });
  });

  describe('handleNext', () => {
    it('should advance to next step when validation passes', () => {
      const mockValidation = createMockValidation({}); // No errors
      mockValidation.validateStep.mockReturnValue({});

      const { result } = renderHook(() => useWizardNavigation(mockValidation));

      act(() => {
        result.current.handleNext();
      });

      expect(result.current.currentStepIndex).toBe(1);
      expect(mockValidation.validateStep).toHaveBeenCalledWith('basics');
    });

    it('should not advance when validation fails', () => {
      const mockValidation = createMockValidation({ title: 'Required' });
      mockValidation.validateStep.mockReturnValue({ title: 'Required' });

      const { result } = renderHook(() => useWizardNavigation(mockValidation));

      act(() => {
        result.current.handleNext();
      });

      expect(result.current.currentStepIndex).toBe(0);
    });

    it('should not advance beyond last step', () => {
      const mockValidation = createMockValidation();
      mockValidation.validateStep.mockReturnValue({});

      const { result } = renderHook(() => useWizardNavigation(mockValidation));

      // Go to last step
      act(() => {
        result.current.goToStep(4);
      });

      expect(result.current.isLastStep).toBe(true);

      // Try to advance
      act(() => {
        result.current.handleNext();
      });

      expect(result.current.currentStepIndex).toBe(4);
    });

    it('should validate current step before advancing', () => {
      const mockValidation = createMockValidation();
      mockValidation.validateStep.mockReturnValue({});

      const { result } = renderHook(() => useWizardNavigation(mockValidation));

      act(() => {
        result.current.goToStep(2); // Tickets step
      });

      act(() => {
        result.current.handleNext();
      });

      expect(mockValidation.validateStep).toHaveBeenCalledWith('tickets');
    });
  });

  describe('handleBack', () => {
    it('should go back to previous step', () => {
      const mockValidation = createMockValidation();
      const { result } = renderHook(() => useWizardNavigation(mockValidation));

      // Go to step 2
      act(() => {
        result.current.goToStep(2);
      });

      expect(result.current.currentStepIndex).toBe(2);

      // Go back
      act(() => {
        result.current.handleBack();
      });

      expect(result.current.currentStepIndex).toBe(1);
    });

    it('should not go back from first step', () => {
      const mockValidation = createMockValidation();
      const { result } = renderHook(() => useWizardNavigation(mockValidation));

      expect(result.current.currentStepIndex).toBe(0);

      act(() => {
        result.current.handleBack();
      });

      expect(result.current.currentStepIndex).toBe(0);
    });

    it('should not validate when going back', () => {
      const mockValidation = createMockValidation();
      const { result } = renderHook(() => useWizardNavigation(mockValidation));

      act(() => {
        result.current.goToStep(2);
      });

      mockValidation.validateStep.mockClear();

      act(() => {
        result.current.handleBack();
      });

      expect(mockValidation.validateStep).not.toHaveBeenCalled();
    });

    it('should clear errors when going back', () => {
      const mockValidation = createMockValidation();
      const { result } = renderHook(() => useWizardNavigation(mockValidation));

      act(() => {
        result.current.goToStep(2);
      });

      mockValidation.clearErrors.mockClear();

      act(() => {
        result.current.handleBack();
      });

      expect(mockValidation.clearErrors).toHaveBeenCalled();
    });
  });

  describe('canProceed', () => {
    it('should return true when validation passes', () => {
      const mockValidation = createMockValidation({});
      mockValidation.validateStep.mockReturnValue({});

      const { result } = renderHook(() => useWizardNavigation(mockValidation));

      let canProceed = false;
      act(() => {
        canProceed = result.current.canProceed();
      });

      expect(canProceed).toBe(true);
      expect(mockValidation.validateStep).toHaveBeenCalledWith('basics');
    });

    it('should return false when validation fails', () => {
      const mockValidation = createMockValidation({ title: 'Required' });
      mockValidation.validateStep.mockReturnValue({ title: 'Required' });

      const { result } = renderHook(() => useWizardNavigation(mockValidation));

      let canProceed = true;
      act(() => {
        canProceed = result.current.canProceed();
      });

      expect(canProceed).toBe(false);
    });

    it('should validate current step', () => {
      const mockValidation = createMockValidation();
      mockValidation.validateStep.mockReturnValue({});

      const { result } = renderHook(() => useWizardNavigation(mockValidation));

      act(() => {
        result.current.goToStep(3); // Posters step
      });

      mockValidation.validateStep.mockClear();

      act(() => {
        result.current.canProceed();
      });

      expect(mockValidation.validateStep).toHaveBeenCalledWith('posters');
    });
  });

  describe('step progression tracking', () => {
    it('should calculate progress percentage', () => {
      const mockValidation = createMockValidation();
      const { result } = renderHook(() => useWizardNavigation(mockValidation));

      // Step 0 of 5
      expect(result.current.progressPercentage).toBe(0);

      act(() => {
        result.current.goToStep(2);
      });

      // Step 2 of 5 = 40%
      expect(result.current.progressPercentage).toBe(40);

      act(() => {
        result.current.goToStep(4);
      });

      // Step 4 of 5 = 80%
      expect(result.current.progressPercentage).toBe(80);
    });

    it('should show 100% on last step', () => {
      const mockValidation = createMockValidation();
      const { result } = renderHook(() => useWizardNavigation(mockValidation));

      act(() => {
        result.current.goToStep(4); // Last step
      });

      expect(result.current.progressPercentage).toBe(80);
    });
  });

  describe('step navigation helpers', () => {
    it('should provide hasNext when not on last step', () => {
      const mockValidation = createMockValidation();
      const { result } = renderHook(() => useWizardNavigation(mockValidation));

      expect(result.current.hasNext).toBe(true);

      act(() => {
        result.current.goToStep(4);
      });

      expect(result.current.hasNext).toBe(false);
    });

    it('should provide hasPrevious when not on first step', () => {
      const mockValidation = createMockValidation();
      const { result } = renderHook(() => useWizardNavigation(mockValidation));

      expect(result.current.hasPrevious).toBe(false);

      act(() => {
        result.current.goToStep(1);
      });

      expect(result.current.hasPrevious).toBe(true);
    });
  });

  describe('step validation without navigation', () => {
    it('should validate without changing step', () => {
      const mockValidation = createMockValidation({ title: 'Required' });
      mockValidation.validateStep.mockReturnValue({ title: 'Required' });

      const { result } = renderHook(() => useWizardNavigation(mockValidation));

      let isValid = true;
      act(() => {
        isValid = result.current.canProceed();
      });

      expect(isValid).toBe(false);
      expect(result.current.currentStepIndex).toBe(0); // Still on first step
    });
  });

  describe('edge cases', () => {
    it('should handle rapid navigation', () => {
      const mockValidation = createMockValidation();
      const { result } = renderHook(() => useWizardNavigation(mockValidation));

      act(() => {
        result.current.goToStep(1);
        result.current.goToStep(2);
        result.current.goToStep(3);
      });

      expect(result.current.currentStepIndex).toBe(3);
    });

    it('should handle navigation to same step', () => {
      const mockValidation = createMockValidation();
      const { result } = renderHook(() => useWizardNavigation(mockValidation));

      act(() => {
        result.current.goToStep(2);
      });

      mockValidation.clearErrors.mockClear();

      act(() => {
        result.current.goToStep(2);
      });

      expect(result.current.currentStepIndex).toBe(2);
      expect(mockValidation.clearErrors).toHaveBeenCalled();
    });

    it('should handle multiple validation calls', () => {
      const mockValidation = createMockValidation();
      mockValidation.validateStep.mockReturnValue({});

      const { result } = renderHook(() => useWizardNavigation(mockValidation));

      act(() => {
        result.current.canProceed();
        result.current.canProceed();
        result.current.canProceed();
      });

      expect(mockValidation.validateStep).toHaveBeenCalledTimes(3);
    });
  });

  describe('integration with validation hook', () => {
    it('should use validation results for navigation decisions', () => {
      const mockValidation = createMockValidation();

      // First call passes, second call fails
      mockValidation.validateStep
        .mockReturnValueOnce({})
        .mockReturnValueOnce({ error: 'Failed' });

      const { result } = renderHook(() => useWizardNavigation(mockValidation));

      // First next should succeed
      act(() => {
        result.current.handleNext();
      });

      expect(result.current.currentStepIndex).toBe(1);

      // Second next should fail
      act(() => {
        result.current.handleNext();
      });

      expect(result.current.currentStepIndex).toBe(1); // Still on step 1
    });

    it('should clear validation errors on step change', () => {
      const mockValidation = createMockValidation();
      const { result } = renderHook(() => useWizardNavigation(mockValidation));

      mockValidation.clearErrors.mockClear();

      act(() => {
        result.current.goToStep(3);
      });

      expect(mockValidation.clearErrors).toHaveBeenCalledTimes(1);

      act(() => {
        result.current.goToStep(1);
      });

      expect(mockValidation.clearErrors).toHaveBeenCalledTimes(2);
    });
  });
});
