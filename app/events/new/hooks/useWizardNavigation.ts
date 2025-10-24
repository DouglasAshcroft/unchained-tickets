import { useState, useCallback, useMemo } from 'react';
import { WIZARD_STEPS, type WizardStep, type StepDefinition, type FormErrors } from '../types';

interface ValidationHook {
  errors: FormErrors;
  validateStep: (stepId: WizardStep) => FormErrors;
  clearErrors: () => void;
}

/**
 * Custom hook to manage wizard navigation
 *
 * Handles step progression, validation before navigation,
 * and provides utilities for wizard UI state.
 *
 * @param validation - Validation hook instance for step validation
 * @returns Wizard navigation state and methods
 */
export function useWizardNavigation(validation: ValidationHook) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Current step details
  const currentStep = useMemo<StepDefinition>(() => {
    return WIZARD_STEPS[currentStepIndex];
  }, [currentStepIndex]);

  // Total number of steps
  const totalSteps = WIZARD_STEPS.length;

  // Check if on first/last step
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === totalSteps - 1;

  // Check if has next/previous steps
  const hasNext = !isLastStep;
  const hasPrevious = !isFirstStep;

  // Progress percentage (0-100)
  const progressPercentage = useMemo(() => {
    return Math.round((currentStepIndex / totalSteps) * 100);
  }, [currentStepIndex, totalSteps]);

  /**
   * Navigate to a specific step by index
   * Clears validation errors and updates current step
   *
   * @param index - Step index to navigate to (0-based)
   */
  const goToStep = useCallback(
    (index: number) => {
      // Validate bounds
      if (index < 0 || index >= totalSteps) {
        return;
      }

      // Clear errors
      validation.clearErrors();

      // Update step
      setCurrentStepIndex(index);
    },
    [validation, totalSteps]
  );

  /**
   * Check if can proceed from current step
   * Validates current step without navigating
   *
   * @returns true if validation passes, false otherwise
   */
  const canProceed = useCallback(() => {
    const errors = validation.validateStep(currentStep.id);
    return Object.keys(errors).length === 0;
  }, [validation, currentStep.id]);

  /**
   * Advance to next step if validation passes
   * Does nothing if already on last step
   */
  const handleNext = useCallback(() => {
    // Don't go beyond last step
    if (isLastStep) {
      return;
    }

    // Validate current step
    const errors = validation.validateStep(currentStep.id);

    // Only proceed if validation passes
    if (Object.keys(errors).length === 0) {
      goToStep(currentStepIndex + 1);
    }
  }, [isLastStep, validation, currentStep.id, goToStep, currentStepIndex]);

  /**
   * Go back to previous step
   * Does not validate - allows going back with invalid data
   * Does nothing if already on first step
   */
  const handleBack = useCallback(() => {
    // Don't go before first step
    if (isFirstStep) {
      return;
    }

    goToStep(currentStepIndex - 1);
  }, [isFirstStep, goToStep, currentStepIndex]);

  return {
    // Current state
    currentStep,
    currentStepIndex,
    steps: WIZARD_STEPS,
    totalSteps,

    // Position checks
    isFirstStep,
    isLastStep,
    hasNext,
    hasPrevious,

    // Progress
    progressPercentage,

    // Navigation methods
    goToStep,
    handleNext,
    handleBack,
    canProceed,
  };
}
