'use client';

import { useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';
import { useAuth } from './useAuth';

/**
 * Automatically provisions dev role for users with DEV_WALLET_ADDRESS
 * This hook runs when a wallet is connected and checks if the address
 * matches the configured DEV_WALLET_ADDRESS environment variable.
 * If matched, it upgrades the user to dev role in the database.
 */
export function useDevRoleProvisioning() {
  const { address, isConnected } = useAccount();
  const { user, loginWithWallet, isAuthenticated } = useAuth();
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    // Only run once per session when wallet connects
    if (!isConnected || !address || hasCheckedRef.current) {
      return;
    }

    // Check if this wallet should have dev role
    const devWalletAddress = process.env.NEXT_PUBLIC_DEV_WALLET_ADDRESS;

    if (!devWalletAddress) {
      // No dev wallet configured, skip
      return;
    }

    // Normalize addresses for comparison (lowercase)
    const normalizedDevAddress = devWalletAddress.toLowerCase();
    const normalizedUserAddress = address.toLowerCase();

    if (normalizedUserAddress === normalizedDevAddress) {
      // This is the dev wallet! Provision role and auto-login
      provisionDevRole(address).then(async (result) => {
        if (result && !isAuthenticated) {
          // Auto-login with wallet after provisioning
          try {
            await loginWithWallet(address);
            console.log('✅ Auto-authenticated with dev wallet');
          } catch (error) {
            console.error('Failed to auto-login after provisioning:', error);
          }
        }
      });
    }

    hasCheckedRef.current = true;
  }, [isConnected, address, user, loginWithWallet, isAuthenticated]);
}

/**
 * Call API to provision dev role for a wallet address
 * Returns the provisioning result data
 */
async function provisionDevRole(walletAddress: string): Promise<any> {
  try {
    const response = await fetch('/api/auth/provision-dev-role', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ walletAddress }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Failed to provision dev role:', error);
      return null;
    }

    const data = await response.json();

    if (data.upgraded) {
      console.log('✅ Dev role provisioned for wallet:', walletAddress);
    } else if (data.alreadyDev) {
      console.log('✅ User already has dev role');
    } else if (data.created) {
      console.log('✅ Dev user created for wallet:', walletAddress);
    }

    return data;
  } catch (error) {
    console.error('Error provisioning dev role:', error);
    return null;
  }
}
