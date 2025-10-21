'use client';

import { useState } from 'react';
import Link from 'next/link';

interface OnboardingBannerProps {
  email?: string;
  profileComplete: {
    hasName: boolean;
    hasLocation: boolean;
    hasGenres: boolean;
  };
  onDismiss: () => void;
}

export function OnboardingBanner({ email, profileComplete, onDismiss }: OnboardingBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  const completedSteps = Object.values(profileComplete).filter(Boolean).length;
  const totalSteps = Object.keys(profileComplete).length;
  const progress = (completedSteps / totalSteps) * 100;

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss();
  };

  return (
    <div className="bg-gradient-to-r from-resistance-500/20 to-acid-400/20 border-2 border-resistance-500/50 rounded-xl p-6 mb-8">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="brand-heading text-2xl font-bold mb-2 bg-gradient-to-r from-resistance-500 via-hack-green to-acid-400 bg-clip-text text-transparent">
            Welcome to the Resistance! 🎉
          </h2>
          {email && (
            <p className="text-sm text-grit-400 mb-2">
              Signed up as: <span className="text-bone-100">{email}</span>
            </p>
          )}
          <p className="text-grit-300">
            Complete your profile to start advocating for fair ticketing and track your impact
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="text-grit-400 hover:text-bone-100 transition-all text-xl"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-grit-300">Profile Progress</span>
          <span className="text-bone-100 font-semibold">{completedSteps} of {totalSteps} complete</span>
        </div>
        <div className="w-full bg-ink-700 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-resistance-500 to-acid-400 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Checklist */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${profileComplete.hasName ? 'bg-hack-green' : 'bg-ink-700 border border-grit-500'}`}>
            {profileComplete.hasName && <span className="text-ink-900 text-sm">✓</span>}
          </div>
          <span className={profileComplete.hasName ? 'text-bone-100' : 'text-grit-400'}>
            Add your name and contact info
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${profileComplete.hasLocation ? 'bg-hack-green' : 'bg-ink-700 border border-grit-500'}`}>
            {profileComplete.hasLocation && <span className="text-ink-900 text-sm">✓</span>}
          </div>
          <span className={profileComplete.hasLocation ? 'text-bone-100' : 'text-grit-400'}>
            Set your location for event recommendations
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${profileComplete.hasGenres ? 'bg-hack-green' : 'bg-ink-700 border border-grit-500'}`}>
            {profileComplete.hasGenres && <span className="text-ink-900 text-sm">✓</span>}
          </div>
          <span className={profileComplete.hasGenres ? 'text-bone-100' : 'text-grit-400'}>
            Choose your favorite music genres
          </span>
        </div>
      </div>

      {/* CTA */}
      {completedSteps < totalSteps && (
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => {
              // User will naturally complete profile by using the tabs
              handleDismiss();
            }}
            className="px-6 py-2 bg-resistance-500 text-bone-100 rounded-lg hover:brightness-110 transition-all font-medium"
          >
            Complete Profile
          </button>
          <button
            onClick={handleDismiss}
            className="px-6 py-2 bg-ink-700 border border-grit-500/30 text-bone-100 rounded-lg hover:bg-grit-500 transition-all font-medium"
          >
            I&apos;ll do this later
          </button>
        </div>
      )}

      {completedSteps === totalSteps && (
        <div className="p-4 bg-hack-green/20 border border-hack-green/30 rounded-lg">
          <p className="text-hack-green font-semibold mb-2">🎊 Profile Complete!</p>
          <p className="text-sm text-grit-300 mb-3">
            You&apos;re all set! Start advocating for venues and track your impact on the Advocacy tab.
          </p>
          <Link
            href="/events"
            className="inline-block px-6 py-2 bg-hack-green text-ink-900 rounded-lg hover:brightness-110 transition-all font-medium"
          >
            Browse Events →
          </Link>
        </div>
      )}
    </div>
  );
}
