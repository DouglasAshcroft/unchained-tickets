'use client';

/**
 * Waitlist Signup Form Component
 *
 * Simple form for joining the waitlist (without advocacy)
 */

import { useState } from 'react';

interface WaitlistFormProps {
  onSuccess?: (referralCode: string) => void;
}

export function WaitlistForm({ onSuccess }: WaitlistFormProps) {
  const [email, setEmail] = useState('');
  const [referredByCode, setReferredByCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [referralCode, setReferralCode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/waitlist/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          referredByCode: referredByCode || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sign up');
      }

      setSuccess(true);
      setReferralCode(data.referralCode);
      if (onSuccess) {
        onSuccess(data.referralCode);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <div className="text-2xl">✅</div>
          <div className="flex-1">
            <h3 className="font-semibold text-green-900 mb-2">You&apos;re on the list!</h3>
            <p className="text-sm text-green-700 mb-4">
              Check your email for confirmation and next steps.
            </p>

            {referralCode && (
              <div className="bg-white rounded-lg p-4 border border-green-300">
                <p className="text-xs text-gray-600 mb-1">Your referral code:</p>
                <div className="flex items-center gap-2">
                  <code className="text-lg font-mono font-bold text-purple-600">
                    {referralCode}
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(referralCode);
                      alert('Copied to clipboard!');
                    }}
                    className="text-xs text-purple-600 hover:text-purple-700"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Share this code with friends to earn rewards!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email Address *
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="referral" className="block text-sm font-medium text-gray-700 mb-1">
          Referral Code (Optional)
        </label>
        <input
          type="text"
          id="referral"
          value={referredByCode}
          onChange={(e) => setReferredByCode(e.target.value.toUpperCase())}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="ABCD1234"
          maxLength={8}
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        {loading ? 'Joining...' : 'Join Waitlist'}
      </button>

      <p className="text-xs text-gray-500 text-center">
        By joining, you&apos;ll get early access to fair ticketing features and exclusive updates.
      </p>
    </form>
  );
}
