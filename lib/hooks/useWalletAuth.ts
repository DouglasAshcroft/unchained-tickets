'use client';

import { useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';
import { useAuth } from './useAuth';
import { useRouter } from 'next/navigation';

/**
 * Auto-authenticate wallet connections (Base-style one-wallet sign-in)
 *
 * When a wallet connects:
 * 1. Auto-login if wallet exists in database
 * 2. Auto-create user if new wallet
 * 3. Redirect new users to profile page to complete setup
 *
 * This provides seamless authentication without requiring manual login.
 */
export function useWalletAuth() {
  const { address, isConnected } = useAccount();
  const { loginWithWallet, isAuthenticated } = useAuth();
  const hasAuthenticatedRef = useRef(false);
  const router = useRouter();

  useEffect(() => {
    // Only run once per session when wallet connects
    if (!isConnected || !address || hasAuthenticatedRef.current || isAuthenticated) {
      return;
    }

    const authenticateWallet = async () => {
      try {
        hasAuthenticatedRef.current = true;
        console.log('🔐 Auto-authenticating wallet:', address);

        const response = await loginWithWallet(address);
        console.log('✅ Token set, isAuthenticated:', isAuthenticated);

        // Verify token is available before redirect
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
        if (!token) {
          console.error('❌ Token not in localStorage after login!');
          throw new Error('Authentication failed - no token');
        }
        console.log('✅ Token verified in localStorage');

        // If new user, redirect to profile to complete setup
        if (response?.isNewUser) {
          console.log('✨ New user created, redirecting to profile setup');
          router.push('/profile?new=true');
        } else {
          console.log('✅ Existing user authenticated');
        }
      } catch (error) {
        console.error('❌ Wallet authentication failed:', error);
        hasAuthenticatedRef.current = false; // Allow retry on next connect
      }
    };

    authenticateWallet();
  }, [isConnected, address, isAuthenticated, loginWithWallet, router]);
}
