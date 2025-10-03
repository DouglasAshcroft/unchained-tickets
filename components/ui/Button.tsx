import { ReactNode, ButtonHTMLAttributes, CSSProperties } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  className = '',
  style = {},
  children,
  ...rest
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm border transition-colors';

  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600',
    secondary: 'bg-transparent text-purple-400 border-purple-400/60 hover:bg-purple-400/10',
    ghost: 'bg-transparent text-gray-300 border-gray-600 hover:bg-gray-800'
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      style={style}
      {...rest}
    >
      {children}
    </button>
  );
}
