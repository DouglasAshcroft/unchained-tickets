import { InputHTMLAttributes, forwardRef, useId } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', ...rest }, ref) => {
    const generatedId = useId();
    const inputId = rest.id ?? generatedId;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block mb-2 text-sm font-medium text-bone-100"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full rounded-md bg-ink-800 border ${
            error ? 'border-signal-500' : 'border-grit-500/30'
          } px-3 py-2 text-bone-100 placeholder-grit-400 focus:outline-none focus:ring-2 ${
            error ? 'focus:ring-signal-500/50' : 'focus:ring-acid-400/50'
          } focus:border-${
            error ? 'signal-500' : 'acid-400'
          } transition-colors ${className}`}
          {...rest}
        />
        {error && (
          <p className="mt-1 text-sm text-signal-500">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-grit-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
