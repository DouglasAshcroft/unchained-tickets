'use client';

import type { ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { AuthProvider } from '@/components/providers/AuthProvider';

// Lazy load Toaster - only loads when toast is triggered
const Toaster = dynamic(
  () => import('react-hot-toast').then((mod) => mod.Toaster),
  { ssr: false }
);

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'var(--background)',
              color: 'var(--foreground)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            },
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  );
}
