interface StepHeaderProps {
  stepNumber: string;
  title: string;
  description: string;
}

/**
 * Branded step header for wizard flows
 *
 * Displays step number, title, and description with proper theming
 */
export function StepHeader({ stepNumber, title, description }: StepHeaderProps) {
  return (
    <div className="rounded-xl border border-grit-500/30 bg-ink-800/50 p-6 backdrop-blur-sm dark:bg-ink-800/50 light:border-grit-400/30 light:bg-bone-100/5">
      <p className="brand-heading text-sm uppercase tracking-widest text-acid-400 dark:text-acid-400 light:text-cobalt-500">
        Step {stepNumber} · {title}
      </p>
      <p className="mt-2 text-bone-100/80 dark:text-bone-100/80 light:text-ink-800/80">
        {description}
      </p>
    </div>
  );
}
