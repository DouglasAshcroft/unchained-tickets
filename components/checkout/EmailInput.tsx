'use client';

import { useState } from 'react';

interface EmailInputProps {
  value: string;
  onChange: (email: string) => void;
  required?: boolean;
  label?: string;
  helperText?: string;
  error?: string;
  className?: string;
}

/**
 * EmailInput Component
 *
 * Required email field with validation for checkout flows.
 * Ensures valid email format and provides clear user feedback.
 */
export function EmailInput({
  value,
  onChange,
  required = true,
  label = 'Email Address',
  helperText = 'Required for wallet recovery and ticket confirmation',
  error,
  className = '',
}: EmailInputProps) {
  const [touched, setTouched] = useState(false);
  const [validationError, setValidationError] = useState<string>('');

  const validateEmail = (email: string): boolean => {
    if (!email) {
      setValidationError(required ? 'Email is required' : '');
      return !required;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setValidationError('Please enter a valid email address');
      return false;
    }

    setValidationError('');
    return true;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    if (touched) {
      validateEmail(newValue);
    }
  };

  const handleBlur = () => {
    setTouched(true);
    validateEmail(value);
  };

  const displayError = error || (touched && validationError);

  return (
    <div className={className}>
      <label htmlFor="email-input" className="block text-sm font-medium text-grit-300 mb-2">
        {label}
        {required && <span className="text-signal-500 ml-1">*</span>}
      </label>

      <input
        id="email-input"
        type="email"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        required={required}
        autoComplete="email"
        className={`
          w-full rounded-lg border px-4 py-3 text-bone-100 placeholder-grit-500
          bg-ink-800
          focus:outline-none focus:ring-2
          transition-colors
          ${
            displayError
              ? 'border-signal-500 focus:ring-signal-500/50'
              : 'border-grit-500/30 focus:ring-acid-400/50'
          }
        `}
        placeholder="you@example.com"
        aria-label={label}
        aria-required={required}
        aria-invalid={!!displayError}
        aria-describedby={displayError ? 'email-error' : 'email-helper'}
      />

      {displayError ? (
        <p id="email-error" className="mt-2 text-xs text-signal-500" role="alert">
          {displayError}
        </p>
      ) : helperText ? (
        <p id="email-helper" className="mt-2 text-xs text-grit-500">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
