'use client';

/**
 * Advocacy Interstitial Modal
 *
 * Shows before redirecting to external ticketing platform
 * Prompts user to sign waitlist and send advocacy email
 */

import { useState } from 'react';
import { X } from 'lucide-react';
import { isDemoMode } from '@/lib/config/eventMode';

interface AdvocacyInterstitialProps {
  event: {
    id: number;
    title: string;
    venue: {
      name: string;
    };
    originalTicketUrl: string;
    impressions: number;
    advocacyCount: number;
  };
  onClose: () => void;
}

export function AdvocacyInterstitial({ event, onClose }: AdvocacyInterstitialProps) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'success' | 'skip'>('form');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/advocacy/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          eventId: event.id,
          userMessage: message || undefined,
          agreeToTerms: agreedToTerms,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit');
      }

      setStep('success');
    } catch (error: any) {
      alert(error.message || 'Failed to submit advocacy');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    setStep('skip');
    // Redirect to original ticket URL
    window.location.href = `/api/events/${event.id}/redirect`;
  };

  const handleContinue = () => {
    // Redirect after successful advocacy
    window.location.href = `/api/events/${event.id}/redirect`;
  };

  if (step === 'success') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h2 className="text-2xl font-bold mb-2">Thank You! 🎉</h2>
            <p className="text-gray-600 mb-6">
              Your voice has been heard! We&apos;ve sent an email to {event.venue.name} on your behalf.
              {isDemoMode() && ' (Demo mode - no actual email sent)'}
            </p>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-purple-900 font-medium mb-2">
                You&apos;re now part of the movement! 🌱
              </p>
              <p className="text-xs text-purple-700">
                Check your email for your advocacy stats and next steps.
              </p>
            </div>

            <button
              onClick={handleContinue}
              className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Continue to Tickets
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 relative my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Before You Go...</h2>
          <p className="text-gray-600">
            Help us bring fair ticketing to {event.venue.name}
          </p>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="text-3xl">💡</div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Why Fair Ticketing Matters</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• No hidden fees (save 20-30% on ticket prices)</li>
                <li>• NFT tickets = fraud protection + resale rights</li>
                <li>• Fan rewards instead of corporate profits</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-600">{event.impressions.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Impressions on this event</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-600">{event.advocacyCount}</div>
            <div className="text-sm text-gray-600">Advocates already</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Your Email *
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="fan@example.com"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
              Personal Message (Optional)
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Tell the venue why fair ticketing matters to you..."
            />
          </div>

          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="terms"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              required
              className="mt-1"
            />
            <label htmlFor="terms" className="text-sm text-gray-600">
              I agree to send an advocacy email to {event.venue.name} and join the Unchained waitlist
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleSkip}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Skip for Now
            </button>
            <button
              type="submit"
              disabled={loading || !agreedToTerms}
              className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send Advocacy Email'}
            </button>
          </div>
        </form>

        <p className="text-xs text-gray-500 text-center mt-4">
          Your email will only be used for advocacy and Unchained updates. No spam, ever.
        </p>
      </div>
    </div>
  );
}
