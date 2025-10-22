'use client';

import { create } from 'zustand';
import { api } from '@/lib/api/client';
import type { UserRoleValue } from '@/lib/constants/roles';

interface User {
  id: number;
  email: string;
  name: string | null;
  role: UserRoleValue;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithWallet: (walletAddress: string) => Promise<{ isNewUser?: boolean }>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
  hasRole: (role: UserRoleValue) => boolean;
  hasAnyRole: (roles: UserRoleValue[]) => boolean;
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const { user } = await api.login({ email, password });
      set({ user, isAuthenticated: true, isLoading: false });
      if (typeof window !== 'undefined') {
        const target =
          user.role === 'venue' || user.role === 'admin' || user.role === 'dev'
            ? '/dashboard/venue'
            : '/events';
        window.location.replace(target);
      }
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  loginWithWallet: async (walletAddress: string) => {
    set({ isLoading: true });
    try {
      const response = await fetch('/api/auth/wallet-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletAddress }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Wallet login failed');
      }

      const { token, user, isNewUser } = await response.json();

      // Store token in localStorage (same as email/password login)
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', token);
      }

      set({ user, isAuthenticated: true, isLoading: false });

      return { isNewUser };
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (email: string, password: string, name?: string) => {
    set({ isLoading: true });
    try {
      const { user } = await api.register({ email, password, name });
      set({ user, isAuthenticated: true, isLoading: false });
      if (typeof window !== 'undefined') {
        const target =
          user.role === 'venue' || user.role === 'admin' || user.role === 'dev'
            ? '/dashboard/venue'
            : '/events';
        window.location.replace(target);
      }
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    api.logout();
    set({ user: null, isAuthenticated: false });
  },

  fetchUser: async () => {
    set({ isLoading: true });
    try {
      const { user } = await api.getCurrentUser();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  hasRole: (role: UserRoleValue) => {
    const { user } = get();
    return Boolean(user && user.role === role);
  },

  hasAnyRole: (roles: UserRoleValue[]) => {
    const { user } = get();
    if (!user) return false;
    return roles.includes(user.role);
  },
}));
