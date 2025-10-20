import { http, createConfig, createStorage, cookieStorage } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { baseAccount } from 'wagmi/connectors';
import { injected } from 'wagmi/connectors';

/**
 * Custom Wagmi Configuration with SSR Support
 *
 * Why we need this:
 * - OnchainKit's auto-config uses public RPC (rate-limited)
 * - We need to use our authenticated Coinbase RPC URL
 * - Proper connector configuration for multiple wallets
 * - SSR support for Next.js 15 (prevents hydration errors)
 *
 * Base Strategy Alignment:
 * - baseAccount connector (Smart Wallet + EOA)
 * - injected connector (MetaMask, browser wallets)
 * - Smart Wallet is primary, others are fallbacks
 */

/**
 * Get Wagmi Config
 *
 * Must be a function to avoid accessing process.env during module evaluation
 * which causes issues with Next.js SSR
 */
export function getWagmiConfig() {
  // Get RPC URL from environment
  const rpcUrl = process.env.NEXT_PUBLIC_BASE_RPC_URL;

  // Configure both chains with transports
  const config = createConfig({
    chains: [base, baseSepolia] as const,

    connectors: [
      // Primary: Coinbase Smart Wallet + EOA (Base Account)
      baseAccount({
        appName: process.env.NEXT_PUBLIC_PROJECT_NAME || 'Unchained Tickets',
        // Optional: Add app logo URL when you have one
        // appLogoUrl: 'https://yourapp.com/logo.png',
      }),

      // Fallback: Browser extension wallets (MetaMask, Brave, etc.)
      injected({
        target: 'metaMask',
      }),

      // Generic injected for other browser wallets
      injected(),
    ],

    transports: {
      // Configure transports for both chains
      [base.id]: http(
        rpcUrl || base.rpcUrls.default.http[0],
        {
          retryCount: 3,
          timeout: 20_000,
        }
      ),
      [baseSepolia.id]: http(
        // Use same RPC for testnet or fallback to default
        rpcUrl || baseSepolia.rpcUrls.default.http[0],
        {
          retryCount: 3,
          timeout: 20_000,
        }
      ),
    },

    // Enable SSR support for Next.js 15
    ssr: true,

    // Use cookie storage for server/client state synchronization
    // Conditionally use cookieStorage only on the client to avoid SSR issues
    storage: typeof window !== 'undefined'
      ? createStorage({
          storage: cookieStorage,
        })
      : undefined,

    // Enable multi-injected provider discovery (for browser wallets)
    multiInjectedProviderDiscovery: true,
  });

  return config;
}

// Lazy config instance - only instantiated when accessed
let _wagmiConfig: ReturnType<typeof getWagmiConfig> | null = null;

export const wagmiConfig = (() => {
  if (!_wagmiConfig) {
    _wagmiConfig = getWagmiConfig();
  }
  return _wagmiConfig;
})();
