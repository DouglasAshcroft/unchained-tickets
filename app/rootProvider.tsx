"use client";
import { ReactNode } from "react";
import { base, baseSepolia } from "wagmi/chains";
import { WagmiProvider, type State } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import { wagmiConfig } from "./wagmi.config";
import "@coinbase/onchainkit/styles.css";

// Determine which chain based on environment
const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID) || 8453;
const selectedChain = chainId === 84532 ? baseSepolia : base;

// Create QueryClient for Wagmi (required)
const queryClient = new QueryClient();

type RootProviderProps = {
  children: ReactNode;
  initialState?: State;
};

export function RootProvider({ children, initialState }: RootProviderProps) {
  return (
    <WagmiProvider config={wagmiConfig} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider
          apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
          chain={selectedChain}
          config={{
            appearance: {
              mode: "dark",
            },
            wallet: {
              /**
               * Base Featured App Strategy:
               * - 'all': Shows both Smart Wallet (recommended) and EOA options
               * - Users get Coinbase Smart Wallet (gasless, no extension)
               * - Also supports Coinbase Wallet Extension/Mobile (EOA)
               * - Aligns with Base ecosystem best practices
               */
              preference: 'all',
              /**
               * Modal display provides better UX for wallet selection
               */
              display: 'modal',
            },
          }}
        >
          {children}
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
