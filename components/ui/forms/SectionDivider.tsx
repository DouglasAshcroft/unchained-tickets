import { ReactNode } from 'react';

interface SectionDividerProps {
  children: ReactNode;
  variant?: 'resistance' | 'acid' | 'hack';
}

/**
 * Branded section divider with gradient lines
 *
 * Variants:
 * - resistance: Red gradient (for important sections)
 * - acid: Neon green gradient (for creative sections)
 * - hack: Green gradient (for tech sections)
 */
export function SectionDivider({ children, variant = 'resistance' }: SectionDividerProps) {
  const gradientClass = {
    resistance: 'via-resistance-500/50',
    acid: 'via-acid-400/50',
    hack: 'via-hack-green/50',
  }[variant];

  return (
    <div className="flex items-center gap-3">
      <div className={`h-px flex-1 bg-gradient-to-r from-transparent ${gradientClass} to-transparent`} />
      <h3 className="brand-heading text-lg uppercase tracking-wider text-bone-100 dark:text-bone-100 light:text-ink-900">
        {children}
      </h3>
      <div className={`h-px flex-1 bg-gradient-to-r from-transparent ${gradientClass} to-transparent`} />
    </div>
  );
}
