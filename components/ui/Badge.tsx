import { ReactNode, HTMLAttributes } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: 'success' | 'error' | 'info';
  className?: string;
  children: ReactNode;
}

export function Badge({
  tone = 'info',
  className = '',
  children,
  ...rest
}: BadgeProps) {
  const toneStyles = {
    success: {
      background: 'linear-gradient(135deg, rgba(166,255,71,0.22), rgba(12,12,12,0.0))',
      borderColor: '#a6ff47', // acid-400
      color: '#f2f0ea', // bone-100
    },
    error: {
      background: 'linear-gradient(135deg, rgba(227,59,59,0.22), rgba(12,12,12,0.0))',
      borderColor: '#e33b3b', // signal-500
      color: '#f2f0ea', // bone-100
    },
    info: {
      background: 'linear-gradient(135deg, rgba(63,115,255,0.22), rgba(12,12,12,0.0))',
      borderColor: '#3f73ff', // cobalt-500
      color: '#f2f0ea', // bone-100
    },
  };

  const styles = toneStyles[tone];

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm backdrop-blur-sm ${className}`}
      style={{
        background: styles.background,
        borderColor: styles.borderColor,
        color: styles.color,
      }}
      {...rest}
    >
      {children}
    </span>
  );
}
