import { InputHTMLAttributes, forwardRef, useId, ReactNode } from 'react';

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: ReactNode;
  required?: boolean;
}

/**
 * Enhanced FormInput with brand styling
 *
 * Features:
 * - Dark/light theme support
 * - Monospace font for consistency
 * - Larger, more comfortable padding
 * - Icon support
 * - Hover states and transitions
 * - Error states with warning icons
 * - Uppercase labels with tracking
 */
export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, helperText, icon, required, className = '', ...rest }, ref) => {
    const generatedId = useId();
    const inputId = rest.id ?? generatedId;

    return (
      <div className="group w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-2 block text-sm font-medium uppercase tracking-wide text-grit-300 dark:text-grit-300 light:text-grit-500"
          >
            {label} {required && <span className="text-resistance-500">*</span>}
          </label>
        )}

        <div className="relative">
          {icon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <div className="h-5 w-5 text-grit-400">
                {icon}
              </div>
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={`w-full rounded-lg border bg-ink-900/50 py-3.5 font-mono text-bone-100 placeholder-grit-400 backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-ink-900 [color-scheme:dark] dark:bg-ink-900/50 dark:text-bone-100 dark:[color-scheme:dark] light:bg-white/50 light:text-ink-900 light:ring-offset-bone-100 light:[color-scheme:light] ${
              icon ? 'pl-12 pr-4' : 'px-4'
            } ${
              error
                ? 'border-resistance-500/50 focus:border-resistance-500 focus:ring-resistance-500/50'
                : 'border-grit-500/30 hover:border-acid-400/50 focus:border-acid-400 focus:ring-acid-400/50'
            } ${className}`}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-help` : undefined}
            {...rest}
          />
        </div>

        {error && (
          <div className="mt-2 flex items-start gap-2">
            <span className="text-resistance-500">⚠</span>
            <p id={`${inputId}-error`} className="text-sm text-resistance-400">
              {error}
            </p>
          </div>
        )}

        {helperText && !error && (
          <p id={`${inputId}-help`} className="mt-2 text-xs text-grit-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';
