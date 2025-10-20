'use client';

import { useState } from 'react';
import { api } from '@/lib/api/client';

interface WalletSavePromptProps {
  walletAddress: string;
  email?: string;
  onSaved: () => void;
  onSkip: () => void;
}

export function WalletSavePrompt({ walletAddress, email, onSaved, onSkip }: WalletSavePromptProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savePreference, setSavePreference] = useState(true);

  const handleSaveWallet = async () => {
    setLoading(true);
    setError(null);

    try {
      // Save wallet to user profile
      await api.post('/api/user/wallet/save', {
        walletAddress,
        chain: 'base',
        isPrimary: true,
        provider: 'coinbase_smart_wallet',
      });

      onSaved();
    } catch (err: any) {
      console.error('Error saving wallet:', err);
      setError(err?.message || 'Failed to save wallet. You can add it later from your profile.');
      // Still call onSaved to allow user to continue
      setTimeout(() => onSaved(), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    if (savePreference) {
      // Save preference to skip wallet save prompts
      if (typeof window !== 'undefined') {
        localStorage.setItem('skip_wallet_save', 'true');
      }
    }
    onSkip();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-gradient-to-b from-ink-900 to-ink-800 border border-grit-500/30 rounded-xl shadow-2xl max-w-md w-full mx-4 p-8">
        {/* Icon */}
        <div className="w-16 h-16 bg-hack-green/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-hack-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-bone-100 text-center mb-2">
          Save Your Wallet?
        </h2>

        {/* Description */}
        <p className="text-grit-300 text-center mb-6">
          Your purchase was successful! Would you like to save this wallet to your profile for faster checkouts in the future?
        </p>

        {/* Wallet Address */}
        <div className="bg-ink-900/50 border border-grit-500/30 rounded-lg p-4 mb-6">
          <div className="text-xs text-grit-400 mb-1">Wallet Address</div>
          <div className="text-sm text-bone-100 font-mono break-all">
            {walletAddress}
          </div>
          {email && (
            <div className="mt-3 pt-3 border-t border-grit-500/30">
              <div className="text-xs text-grit-400 mb-1">Associated Email</div>
              <div className="text-sm text-bone-100">
                {email}
              </div>
            </div>
          )}
        </div>

        {/* Benefits */}
        <div className="bg-resistance-500/10 border border-resistance-500/30 rounded-lg p-4 mb-6">
          <div className="text-sm font-medium text-resistance-500 mb-2">Benefits of saving:</div>
          <ul className="space-y-2 text-sm text-grit-300">
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-hack-green flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Faster checkout for future purchases
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-hack-green flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Track all your tickets in one place
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-hack-green flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Earn rewards and perks
            </li>
          </ul>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-resistance-500/10 border border-resistance-500/30 rounded-lg text-sm text-resistance-500">
            {error}
          </div>
        )}

        {/* Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleSaveWallet}
            disabled={loading}
            className={`w-full px-6 py-3 rounded-lg font-medium transition-all ${
              loading
                ? 'bg-grit-500 text-grit-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-resistance-500 to-hack-green text-white hover:shadow-lg hover:shadow-resistance-500/50'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                Saving...
              </div>
            ) : (
              'Save Wallet'
            )}
          </button>

          <button
            onClick={handleSkip}
            disabled={loading}
            className="w-full px-6 py-3 text-grit-300 hover:text-bone-100 transition-all"
          >
            Skip for now
          </button>
        </div>

        {/* Don't ask again checkbox */}
        <label className="flex items-center gap-2 mt-4 cursor-pointer">
          <input
            type="checkbox"
            checked={savePreference}
            onChange={(e) => setSavePreference(e.target.checked)}
            className="w-4 h-4 rounded border-grit-500 bg-ink-900 text-resistance-500 focus:ring-2 focus:ring-resistance-500 focus:ring-offset-0"
          />
          <span className="text-xs text-grit-400">
            Don&apos;t ask me again
          </span>
        </label>

        {/* Security Note */}
        <div className="mt-6 pt-6 border-t border-grit-500/30">
          <div className="flex items-start gap-2 text-xs text-grit-400">
            <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>
              Your wallet is stored securely and can be managed from your profile settings at any time.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
