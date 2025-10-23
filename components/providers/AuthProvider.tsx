'use client';

import { useEffect, ReactNode } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';

/**
 * AuthProvider - Hydrates authentication state on app load
 *
 * Critical component that solves the auth state hydration issue:
 * - On app load/refresh, checks if auth token exists in localStorage
 * - If token exists, calls fetchUser() to populate Zustand store
 * - If token is invalid/expired, clears it from localStorage
 *
 * This ensures:
 * - Navbar shows correct auth state after page refresh
 * - Profile page works immediately without manual reload
 * - Auth state is consistent across all components
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const { fetchUser } = useAuth();

  useEffect(() => {
    // Hydrate auth state on mount if token exists
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');

      if (token) {
        console.log('🔄 AuthProvider: Token found, hydrating auth state...');

        fetchUser().catch((error) => {
          // Token invalid/expired, clear it
          console.error('❌ AuthProvider: Token validation failed, clearing:', error);
          localStorage.removeItem('auth_token');
        });
      } else {
        console.log('ℹ️ AuthProvider: No token found, user not authenticated');
      }
    }
  }, [fetchUser]);

  // Don't block rendering, auth state will hydrate asynchronously
  return <>{children}</>;
}
