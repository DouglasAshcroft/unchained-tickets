import { ReactNode, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  className?: string;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  className = '',
  children,
  ...rest
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors font-heading text-sm border uppercase tracking-wider';

  const variants = {
    primary: 'bg-resistance-500 hover:brightness-110 text-ink-900 border-resistance-500',
    secondary: 'bg-transparent text-acid-400 border-acid-400/60 hover:bg-acid-400/10',
    ghost: 'bg-transparent text-bone-100 border-grit-500 hover:bg-white/5'
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
