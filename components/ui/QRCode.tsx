'use client';

import QRCodeSVG from 'react-qr-code';

interface QRCodeProps {
  value: string;
  size?: number;
  level?: 'L' | 'M' | 'Q' | 'H';
  fgColor?: string;
  bgColor?: string;
  caption?: string;
  className?: string;
}

export function QRCode({
  value,
  size = 180,
  level = 'M',
  fgColor = '#a6ff47', // Unchained acid-400 green
  bgColor = '#121316', // Unchained ink-800
  caption,
  className = '',
}: QRCodeProps) {
  if (!value) return null;

  return (
    <div className={`inline-flex w-full flex-col items-center gap-2 ${className}`}>
      <h4 className="brand-heading text-sm text-grit-300">Scan this QR Code</h4>
      <div
        className="qr-container inline-flex items-center justify-center rounded-md border border-grit-500/30 p-3 shadow-sm"
        style={{ backgroundColor: bgColor }}
      >
        <QRCodeSVG
          value={value}
          size={size}
          level={level}
          fgColor={fgColor}
          bgColor={bgColor}
        />
      </div>
      {caption && <p className="text-xs text-grit-400">{caption}</p>}
    </div>
  );
}
