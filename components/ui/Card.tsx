import { ReactNode, CSSProperties } from 'react';

interface CardProps {
  className?: string;
  accentLeft?: boolean;
  children: ReactNode;
  style?: CSSProperties;
  [key: string]: any;
}

export function Card({ className = '', accentLeft = false, children, style = {}, ...rest }: CardProps) {
  return (
    <div
      className={`relative rounded-lg border border-white/10 bg-zinc-900 p-4 text-left shadow-lg md:p-6 ${className}`}
      style={style}
      {...rest}
    >
      {accentLeft && (
        <div className="absolute top-0 bottom-0 left-0 w-[3px] bg-blue-500" />
      )}
      {children}
    </div>
  );
}
