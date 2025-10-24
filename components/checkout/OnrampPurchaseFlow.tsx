'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { FundCard } from '@coinbase/onchainkit/fund';
import { toast } from 'react-hot-toast';
import { EmailInput } from './EmailInput';
import { FundingAmountDisplay } from './FundingAmountDisplay';
import { getUSDCBalance, pollForBalance } from '@/lib/utils/balanceChecker';

interface OnrampPurchaseFlowProps {
  eventId: number;
  eventTitle: string;
  ticketTier: string;
  quantity: number;
  totalPrice: number;
  onSuccess: (transactionId: string, metadata?: { email?: string; walletAddress?: string; isNewUser?: boolean; tokenId?: string; txHash?: string }) => void;
  onClose: () => void;
}

/**
 * OnrampPurchaseFlow Component
 *
 * Smart checkout component that:
 * 1. Detects wallet connection status
 * 2. Checks USDC balance
 * 3. Shows appropriate flow:
 *    - Connected + sufficient funds → Direct purchase (existing wallet flow)
 *    - Connected + insufficient funds → FundCard to add funds
 *    - Not connected → Guest onramp flow
 */
export function OnrampPurchaseFlow({
  eventId,
  ticketTier,
  quantity,
  totalPrice,
  onSuccess,
}: OnrampPurchaseFlowProps) {
  const { address, isConnected } = useAccount();
  const [email, setEmail] = useState('');
  const [balance, setBalance] = useState<number>(0);
  const [isCheckingBalance, setIsCheckingBalance] = useState(false);
  const [fundingFlow, setFundingFlow] = useState<'checking' | 'direct' | 'funding' | 'guest'>(
    'checking'
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [mintingHealthy, setMintingHealthy] = useState<boolean | null>(null);
  const [mintingError, setMintingError] = useState<string | null>(null);

  const minimumOnramp = parseFloat(process.env.NEXT_PUBLIC_COINBASE_ONRAMP_MINIMUM_USD || '10.00');

  // Check minting health when component mounts
  useEffect(() => {
    async function checkMintingHealth() {
      try {
        const response = await fetch('/api/checkout/minting-health');
        const data = await response.json();

        if (data.healthy && data.ready) {
          console.log('[OnrampPurchaseFlow] ✅ Minting is operational');
          setMintingHealthy(true);
          setMintingError(null);
        } else {
          console.warn('[OnrampPurchaseFlow] ⚠️ Minting not operational:', data.message);
          setMintingHealthy(false);
          setMintingError(data.message || 'Minting service unavailable');
        }
      } catch (error) {
        console.error('[OnrampPurchaseFlow] Failed to check minting health:', error);
        setMintingHealthy(false);
        setMintingError('Unable to verify minting status');
      }
    }

    checkMintingHealth();
  }, []);

  // Check balance when wallet connects
  useEffect(() => {
    async function checkBalance() {
      console.log('[OnrampPurchaseFlow] Wallet state:', { isConnected, address: address?.slice(0, 10) + '...' });

      if (!isConnected || !address) {
        console.log('[OnrampPurchaseFlow] No wallet connected → guest flow');
        setFundingFlow('guest');
        return;
      }

      setIsCheckingBalance(true);
      try {
        console.log('[OnrampPurchaseFlow] Checking USDC balance...');
        const currentBalance = await getUSDCBalance(address);
        setBalance(currentBalance);
        console.log('[OnrampPurchaseFlow] Balance:', currentBalance, 'USDC | Required:', totalPrice, 'USDC');

        if (currentBalance >= totalPrice) {
          console.log('[OnrampPurchaseFlow] ✅ Sufficient balance → direct purchase');
          setFundingFlow('direct');
        } else {
          console.log('[OnrampPurchaseFlow] ⚠️ Insufficient balance → funding flow');
          setFundingFlow('funding');
        }
      } catch (error) {
        console.error('[OnrampPurchaseFlow] Error checking balance:', error);
        setFundingFlow('funding'); // Assume funding needed on error
      } finally {
        setIsCheckingBalance(false);
      }
    }

    checkBalance();
  }, [isConnected, address, totalPrice]);

  // Calculate funding amount (handle minimum requirement)
  const shortfall = totalPrice - balance;
  const fundingAmount = Math.max(shortfall, minimumOnramp);
  const isBelowMinimum = totalPrice < minimumOnramp;

  // Handle direct purchase (wallet has sufficient funds)
  const handleDirectPurchase = async () => {
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    if (!address) {
      toast.error('Please connect your wallet');
      return;
    }

    setIsProcessing(true);

    // Show minting in progress toast
    const mintingToast = toast.loading('🎫 Minting your NFT ticket on-chain...');

    try {
      const response = await fetch('/api/checkout/create-charge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId,
          ticketTier,
          quantity,
          totalPrice,
          walletAddress: address,
          email,
          paymentMethod: 'wallet',
        }),
      });

      const data = await response.json();

      // Dismiss the loading toast
      toast.dismiss(mintingToast);

      if (!response.ok || !data.success) {
        // Minting failed - show clear error
        console.error('[OnrampPurchaseFlow] Minting failed:', data.error);
        toast.error(
          data.message || 'NFT minting failed. Please contact support with your charge ID: ' + data.chargeId,
          { duration: 8000 }
        );
        return;
      }

      // Success! Show transaction hash and success message
      console.log('[OnrampPurchaseFlow] ✅ NFT minted successfully!');
      console.log('[OnrampPurchaseFlow] Token ID:', data.tokenId);
      console.log('[OnrampPurchaseFlow] TX Hash:', data.txHash);

      toast.success(
        `🎉 NFT Ticket Minted! Token ID: ${data.tokenId}`,
        { duration: 6000 }
      );

      // Show transaction link
      const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID) || 84532;
      const explorerUrl = chainId === 84532
        ? `https://sepolia.basescan.org/tx/${data.txHash}`
        : `https://basescan.org/tx/${data.txHash}`;

      toast.success(
        <div>
          View on Block Explorer: <a href={explorerUrl} target="_blank" rel="noopener noreferrer" className="underline">
            {data.txHash.slice(0, 10)}...
          </a>
        </div>,
        { duration: 10000 }
      );

      onSuccess(data.chargeId, {
        email,
        walletAddress: address,
        isNewUser: false,
        tokenId: data.tokenId,
        txHash: data.txHash,
      });
    } catch (error) {
      console.error('[OnrampPurchaseFlow] Purchase error:', error);
      toast.dismiss(mintingToast);
      toast.error(
        error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.',
        { duration: 6000 }
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle funding completion
  const handleFundingComplete = async () => {
    if (!address) return;

    toast.success('Funding complete! Verifying balance...');
    setIsProcessing(true);

    try {
      // Poll for balance to update
      const newBalance = await pollForBalance(address, totalPrice, 15, 3000); // 45 seconds max
      setBalance(newBalance);

      // Automatically proceed to purchase
      toast.success('Balance confirmed! Processing purchase...');
      await handleDirectPurchase();
    } catch (error) {
      console.error('Balance polling error:', error);
      toast.error(
        'Funds received but verification delayed. Please refresh and try again in a moment.',
        { duration: 5000 }
      );
      setIsProcessing(false);
    }
  };

  // Render loading state
  if (fundingFlow === 'checking' || isCheckingBalance) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="w-12 h-12 border-4 border-acid-400 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-grit-300">Checking wallet balance...</p>
      </div>
    );
  }

  // Render direct purchase flow (sufficient balance)
  if (fundingFlow === 'direct') {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-hack-green/10 border border-hack-green/30 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">✅</span>
            <span className="font-semibold text-hack-green">Wallet Ready</span>
          </div>
          <p className="text-sm text-grit-300">
            Your wallet has sufficient USDC balance ({balance.toFixed(2)} USDC)
          </p>
        </div>

        {mintingHealthy === false && (
          <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">⚠️</span>
              <span className="font-semibold text-orange-400">NFT Minting Unavailable</span>
            </div>
            <p className="text-sm text-grit-300">
              {mintingError || 'NFT minting service is currently unavailable. Please try again later or contact support.'}
            </p>
          </div>
        )}

        <EmailInput
          value={email}
          onChange={setEmail}
          required
          helperText="Required for ticket confirmation"
        />

        <button
          onClick={handleDirectPurchase}
          disabled={isProcessing || !email || mintingHealthy === false}
          className="w-full py-4 px-6 rounded-lg bg-gradient-to-r from-acid-400 to-hack-green text-ink-900 font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          {isProcessing ? (
            <>
              <div className="w-5 h-5 border-2 border-ink-900 border-t-transparent rounded-full animate-spin" />
              Minting NFT Ticket...
            </>
          ) : (
            <>🎫 Purchase NFT Ticket - ${totalPrice.toFixed(2)}</>
          )}
        </button>
      </div>
    );
  }

  // Render funding flow (connected but needs more funds)
  if (fundingFlow === 'funding' && isConnected && address) {
    return (
      <div className="space-y-4">
        <EmailInput
          value={email}
          onChange={setEmail}
          required
          helperText="Required for ticket confirmation and wallet recovery"
        />

        <FundingAmountDisplay
          ticketPrice={totalPrice}
          fundingAmount={fundingAmount}
          minimumRequired={minimumOnramp}
          currentBalance={balance}
          showBreakdown
        />

        <div className="border border-grit-500/30 rounded-lg p-4 bg-ink-800/40">
          <p className="text-sm text-grit-300 mb-4">
            Add funds to your wallet using credit card or Apple Pay via Coinbase Onramp.
            Your purchase will proceed automatically once funds arrive.
          </p>

          <FundCard
            assetSymbol="USDC"
            country="US"
            currency="USD"
            presetAmountInputs={[
              String(fundingAmount),
              String(fundingAmount * 1.5),
              String(fundingAmount * 2),
            ]}
            onSuccess={handleFundingComplete}
            onError={(error) => {
              // Silently ignore FundCard initialization errors (empty objects)
              // These are internal OnchainKit config/validation checks, not payment failures
              if (error && Object.keys(error).length > 0) {
                console.warn('[OnrampPurchaseFlow] Funding error:', error);
              }
            }}
          />
          <p className="text-xs text-grit-400 mt-2">
            ℹ️ Funds will be added to your connected wallet: {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
        </div>
      </div>
    );
  }

  // Render guest onramp flow (no wallet connected)
  return (
    <div className="space-y-4">
      <div className="p-3 bg-cobalt-500/10 border border-cobalt-500/30 rounded-lg">
        <p className="text-sm text-cobalt-300">
          <strong>No crypto wallet needed!</strong> Pay with credit card or Apple Pay.
          Coinbase will create a secure wallet for you automatically.
        </p>
      </div>

      <EmailInput
        value={email}
        onChange={setEmail}
        required
        helperText="Required for wallet recovery and ticket confirmation"
      />

      {isBelowMinimum && (
        <FundingAmountDisplay
          ticketPrice={totalPrice}
          fundingAmount={fundingAmount}
          minimumRequired={minimumOnramp}
          showBreakdown
        />
      )}

      <div className="border border-grit-500/30 rounded-lg p-4 bg-ink-800/40">
        <p className="text-sm text-grit-300 mb-4">
          Complete your purchase with credit card or Apple Pay. Coinbase will create a secure
          Smart Wallet and deliver your NFT ticket automatically.
        </p>

        <FundCard
          assetSymbol="USDC"
          country="US"
          currency="USD"
          presetAmountInputs={[
            String(isBelowMinimum ? fundingAmount : totalPrice),
            String((isBelowMinimum ? fundingAmount : totalPrice) * 1.5),
            String((isBelowMinimum ? fundingAmount : totalPrice) * 2),
          ]}
          onSuccess={async (transaction) => {
            toast.success('Payment successful! Creating your account...');

            try {
              // Create charge with onramp payment method
              const response = await fetch('/api/checkout/create-charge', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  eventId,
                  ticketTier,
                  quantity,
                  totalPrice,
                  walletAddress: (transaction as any)?.destinationAddress || 'pending',
                  email,
                  paymentMethod: 'onramp',
                }),
              });

              if (!response.ok) {
                throw new Error('Failed to create charge');
              }

              const data = await response.json();
              const newWalletAddress = (transaction as any)?.destinationAddress || 'pending';
              toast.success('NFT ticket will be minted to your new wallet!', { duration: 4000 });
              onSuccess(data.chargeId, { email, walletAddress: newWalletAddress, isNewUser: true });
            } catch (error) {
              console.error('Post-funding error:', error);
              toast.error('Payment received but ticket creation failed. Please contact support.');
            }
          }}
          onError={(error) => {
            // Silently ignore FundCard initialization errors (empty objects)
            // These are internal OnchainKit config/validation checks, not payment failures
            if (error && Object.keys(error).length > 0) {
              console.warn('[OnrampPurchaseFlow] Onramp error:', error);
            }
          }}
        />
      </div>

      <div className="p-3 bg-ink-800/40 border border-grit-500/30 rounded-lg">
        <p className="text-xs text-grit-500">
          🔒 Secure payment powered by Coinbase. Your wallet details will be sent to your email.
          No technical crypto knowledge required.
        </p>
      </div>
    </div>
  );
}
