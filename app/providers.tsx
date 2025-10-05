'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { ThemeProvider } from '@/components/providers/ThemeProvider';

// Lazy load Toaster - only loads when toast is triggered
const Toaster = dynamic(
  () => import('react-hot-toast').then((mod) => mod.Toaster),
  { ssr: false }
);

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
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
      </QueryClientProvider>
    </ThemeProvider>
  );
}
