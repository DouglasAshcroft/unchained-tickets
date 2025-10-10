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
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
  hasRole: (role: UserRoleValue) => boolean;
  hasAnyRole: (roles: UserRoleValue[]) => boolean;
}

export const useAuth = create<AuthState>((set) => ({
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
    const { user } = useAuth.getState();
    return Boolean(user && user.role === role);
  },

  hasAnyRole: (roles: UserRoleValue[]) => {
    const { user } = useAuth.getState();
    if (!user) return false;
    return roles.includes(user.role);
  },
}));
