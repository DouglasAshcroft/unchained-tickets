/**
 * Auth Helpers - DRY utilities for authentication
 *
 * Centralized authentication utilities to ensure consistent behavior
 * across all auth flows and components.
 */

import type { UserRoleValue } from '@/lib/constants/roles';

/**
 * Centralized token management
 * Single source of truth for auth token operations
 */
export const authTokenManager = {
  /**
   * Get auth token from localStorage
   */
  get: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  },

  /**
   * Set auth token in localStorage
   */
  set: (token: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  },

  /**
   * Clear auth token from localStorage
   */
  clear: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  },

  /**
   * Check if auth token exists
   */
  exists: (): boolean => {
    return !!authTokenManager.get();
  },
};

/**
 * Get redirect target based on user role
 * Venues, admins, and devs → dashboard
 * Everyone else → events page
 */
export const getAuthRedirectTarget = (userRole: UserRoleValue): string => {
  const dashboardRoles: UserRoleValue[] = ['venue', 'admin', 'dev'];
  return dashboardRoles.includes(userRole) ? '/dashboard/venue' : '/events';
};

/**
 * Check if user is authenticated (has valid token)
 * Useful for protecting routes and components
 */
export const isUserAuthenticated = (): boolean => {
  return authTokenManager.exists();
};

/**
 * Validate auth state before making authenticated requests
 * Returns true if authenticated, false otherwise
 */
export const validateAuthState = (): {
  isAuthenticated: boolean;
  token: string | null;
} => {
  const token = authTokenManager.get();
  return {
    isAuthenticated: !!token,
    token,
  };
};
