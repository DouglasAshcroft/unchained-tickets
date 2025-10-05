import { ReactNode, HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  accentLeft?: boolean;
  children: ReactNode;
}

export function Card({ className = '', accentLeft = false, children, ...rest }: CardProps) {
  return (
    <div
      className={`noise-overlay relative rounded-lg border border-grit-500/30 bg-bg-1 p-4 text-left shadow-ink md:p-6 ${className}`}
      {...rest}
    >
      {accentLeft && (
        <div className="absolute top-0 bottom-0 left-0 w-[3px] bg-resistance-500" />
      )}
      {children}
    </div>
  );
}
