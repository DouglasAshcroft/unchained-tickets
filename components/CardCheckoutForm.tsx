'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useAccount } from 'wagmi';
import { Buy } from '@coinbase/onchainkit/buy';
import type { TransactionReceipt } from 'viem';

interface CardCheckoutFormProps {
  eventId: number;
  eventTitle: string;
  ticketTier: string;
  quantity: number;
  totalPrice: number;
  onClose: () => void;
  onSuccess: (transactionId: string) => void;
}

const BASE_USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as `0x${string}`;
const BASE_SEPOLIA_USDC_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e' as `0x${string}`;

export function CardCheckoutForm({
  eventId,
  eventTitle,
  ticketTier,
  quantity,
  totalPrice,
  onClose,
  onSuccess,
}: CardCheckoutFormProps) {
  const { address } = useAccount();
  const [email, setEmail] = useState('');
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID) || 8453;

  const toToken = useMemo(
    () => ({
      name: 'USDC',
      symbol: 'USDC',
      decimals: 6,
      chainId,
      address: chainId === 84532 ? BASE_SEPOLIA_USDC_ADDRESS : BASE_USDC_ADDRESS,
      image:
        'https://d3r81g40ycuhqg.cloudfront.net/wallet/wais/44/2b/442b80bd16af0c0d9b22e03a16753823fe826e5bfd457292b55fa0ba8c1ba213-ZWUzYjJmZGUtMDYxNy00NDcyLTg0NjQtMWI4OGEwYjBiODE2',
    }),
    [chainId]
  );

  useEffect(() => {
    let isCancelled = false;

    if (!address) {
      setSessionToken(null);
      setIsLoadingSession(false);
      return;
    }

    async function createSession() {
      setIsLoadingSession(true);
      setError(null);

      try {
        const response = await fetch('/api/coinbase-pay/session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            walletAddress: address,
            eventId,
            ticketTier,
            quantity,
            totalPrice,
          }),
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.error || 'Unable to initialize Coinbase Pay session.');
        }

        const { sessionToken: token } = await response.json();
        if (!isCancelled) {
          setSessionToken(token);
        }
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Unexpected error creating Coinbase Pay session.';
        if (!isCancelled) {
          setError(message);
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingSession(false);
        }
      }
    }

    createSession();

    return () => {
      isCancelled = true;
    };
  }, [address, eventId, ticketTier, quantity, totalPrice]);

  const handleMint = async (transactionReceipt?: TransactionReceipt) => {
    if (!address) {
      toast.error('Connect a wallet before completing checkout.');
      return;
    }

    setIsMinting(true);
    setError(null);

    try {
      const response = await fetch('/api/checkout/card-charge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId,
          ticketTier,
          quantity,
          totalPrice,
          email,
          walletAddress: address,
          transactionReference:
            transactionReceipt?.transactionHash ??
            (typeof crypto !== 'undefined' && 'randomUUID' in crypto
              ? crypto.randomUUID()
              : `${Date.now()}`),
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || 'Payment captured, but mint failed.');
      }

      const data = await response.json();
      toast.success('Payment captured and NFT minted!', { duration: 3500 });
      onSuccess(data.transactionId);
      onClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unexpected error minting ticket.';
      setError(message);
      toast.error(message, { duration: 4000 });
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-ink-800/40 border border-grit-500/30 rounded-lg p-4">
        <p className="text-sm font-medium text-bone-100">{eventTitle}</p>
        <p className="text-xs text-grit-400 mt-1">
          {quantity} ticket{quantity === 1 ? '' : 's'} • {ticketTier}
        </p>
      </div>

      <div>
        <label htmlFor="card-email" className="block text-sm font-medium text-grit-300 mb-2">
          Email Address (optional)
        </label>
        <input
          id="card-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-lg border border-grit-500/30 bg-ink-800 px-4 py-3 text-bone-100 placeholder-grit-500 focus:outline-none focus:ring-2 focus:ring-acid-400/50"
          placeholder="you@example.com"
        />
        <p className="text-xs text-grit-500 mt-2">
          We&apos;ll send your receipt and ticket confirmation here.
        </p>
      </div>

      {!address && (
        <p className="text-sm text-signal-500 bg-signal-500/10 border border-signal-500/30 rounded-md px-3 py-2">
          Connect a Base smart wallet to continue. Coinbase Pay will fund your wallet via card, and we&apos;ll mint the
          ticket automatically once the purchase completes.
        </p>
      )}

      {error && (
        <p className="text-sm text-signal-500 bg-signal-500/10 border border-signal-500/40 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      <div className="border border-dashed border-grit-500/40 rounded-lg p-4 bg-ink-800/40 space-y-3">
        <p className="text-sm text-grit-300">
          Use Coinbase Pay to top up your wallet with USDC via credit or debit card. Once the onramp completes, we
          mint your NFT ticket using Base&apos;s Paymaster so you never pay gas.
        </p>

        {isLoadingSession && (
          <p className="text-xs text-grit-500">Preparing Coinbase Pay checkout…</p>
        )}

        {sessionToken && (
          <Buy
            toToken={toToken}
            sessionToken={sessionToken}
            isSponsored
            disabled={!address || isMinting}
            onSuccess={(receipt) => {
              handleMint(receipt);
            }}
            onError={(swapError) => {
              const message = swapError?.error || 'Coinbase Pay checkout failed.';
              setError(message);
              toast.error(message, { duration: 4000 });
            }}
          />
        )}

        {isMinting && (
          <p className="text-xs text-grit-500">Minting NFT ticket…</p>
        )}
      </div>
    </div>
  );
}
