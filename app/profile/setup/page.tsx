'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api/client';
import { WalletSavePrompt } from '@/components/checkout/WalletSavePrompt';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export default function ProfileSetupPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Query params from purchase flow
  const fromPurchase = searchParams?.get('from') === 'purchase';
  const walletAddress = searchParams?.get('wallet');
  const email = searchParams?.get('email');

  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [favoriteGenres, setFavoriteGenres] = useState<string[]>([]);
  const [bio, setBio] = useState('');

  // UI state
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showWalletPrompt, setShowWalletPrompt] = useState(false);
  const [walletSaved, setWalletSaved] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    // Show wallet save prompt if coming from purchase
    if (fromPurchase && walletAddress && !walletSaved) {
      setShowWalletPrompt(true);
    }
  }, [fromPurchase, walletAddress, walletSaved]);

  const genreOptions = [
    'Rock', 'Pop', 'Hip Hop', 'Electronic', 'Jazz', 'Classical',
    'Country', 'R&B', 'Metal', 'Indie', 'Folk', 'Blues',
    'Reggae', 'Latin', 'K-Pop', 'Punk', 'Soul', 'Funk'
  ];

  const steps: OnboardingStep[] = [
    {
      id: 'wallet',
      title: 'Save Your Wallet',
      description: 'Securely link your wallet for future purchases',
      completed: walletSaved || !fromPurchase,
    },
    {
      id: 'personal',
      title: 'Personal Information',
      description: 'Tell us a bit about yourself',
      completed: !!name,
    },
    {
      id: 'preferences',
      title: 'Music Preferences',
      description: 'What genres do you love?',
      completed: favoriteGenres.length > 0,
    },
    {
      id: 'location',
      title: 'Location (Optional)',
      description: 'Help us recommend nearby events',
      completed: !!location,
    },
  ];

  const handleWalletSaved = () => {
    setWalletSaved(true);
    setShowWalletPrompt(false);
    setCurrentStep(1); // Move to next step
  };

  const handleSkipWallet = () => {
    setShowWalletPrompt(false);
    setCurrentStep(1);
  };

  const toggleGenre = (genre: string) => {
    setFavoriteGenres(prev =>
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      // Update profile
      await api.updateProfile({
        name: name || undefined,
        phone: phone || undefined,
        location: location || undefined,
        favoriteGenres: favoriteGenres.length > 0 ? favoriteGenres : undefined,
        bio: bio || undefined,
      });

      // Mark onboarding as complete
      await api.post('/api/user/onboarding/complete', {});

      // Redirect to profile or events page
      router.push('/profile?setup=complete');
    } catch (err) {
      console.error('Error completing profile setup:', err);
      setError('Failed to save your profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return walletSaved || !fromPurchase;
      case 1: return !!name;
      case 2: return favoriteGenres.length > 0;
      case 3: return true; // Location is optional
      default: return false;
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-ink-900 to-ink-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-resistance-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-ink-900 to-ink-800 text-bone-100">
      {/* Wallet Save Prompt Modal */}
      {showWalletPrompt && walletAddress && (
        <WalletSavePrompt
          walletAddress={walletAddress}
          email={email || undefined}
          onSaved={handleWalletSaved}
          onSkip={handleSkipWallet}
        />
      )}

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="brand-heading text-4xl font-bold mb-4 bg-gradient-to-r from-resistance-500 via-hack-green to-acid-400 bg-clip-text text-transparent">
            Welcome to Unchained Tickets!
          </h1>
          <p className="text-grit-300 text-lg">
            Let&apos;s set up your profile to get you started
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                      index === currentStep
                        ? 'border-resistance-500 bg-resistance-500 text-white'
                        : index < currentStep || step.completed
                        ? 'border-hack-green bg-hack-green text-ink-900'
                        : 'border-grit-500 bg-transparent text-grit-400'
                    }`}
                  >
                    {index < currentStep || step.completed ? (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </div>
                  <span className={`mt-2 text-xs text-center max-w-[100px] ${
                    index === currentStep ? 'text-bone-100 font-medium' : 'text-grit-400'
                  }`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-0.5 w-12 mx-2 ${
                    index < currentStep ? 'bg-hack-green' : 'bg-grit-500'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-ink-800/50 border border-grit-500/30 rounded-lg p-8 mb-8">
          {/* Step 0: Wallet (handled by modal) */}
          {currentStep === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-hack-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-hack-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">Wallet Setup</h2>
              <p className="text-grit-300">
                {fromPurchase
                  ? 'Save your wallet for easy future purchases'
                  : 'You can connect a wallet later from your profile'
                }
              </p>
            </div>
          )}

          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">{steps[1].title}</h2>
              <div className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-bone-100 mb-2">
                    Full Name <span className="text-resistance-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-ink-900 border border-grit-500/30 rounded-lg text-bone-100 placeholder-grit-400 focus:outline-none focus:ring-2 focus:ring-resistance-500 focus:border-transparent"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-bone-100 mb-2">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 bg-ink-900 border border-grit-500/30 rounded-lg text-bone-100 placeholder-grit-400 focus:outline-none focus:ring-2 focus:ring-resistance-500 focus:border-transparent"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>

                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-bone-100 mb-2">
                    Bio (Optional)
                  </label>
                  <textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-ink-900 border border-grit-500/30 rounded-lg text-bone-100 placeholder-grit-400 focus:outline-none focus:ring-2 focus:ring-resistance-500 focus:border-transparent resize-none"
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Music Preferences */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl font-bold mb-2">{steps[2].title}</h2>
              <p className="text-grit-300 mb-6">Select at least one genre you enjoy</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {genreOptions.map((genre) => (
                  <button
                    key={genre}
                    onClick={() => toggleGenre(genre)}
                    className={`px-4 py-3 rounded-lg border-2 transition-all font-medium ${
                      favoriteGenres.includes(genre)
                        ? 'border-resistance-500 bg-resistance-500/20 text-resistance-500'
                        : 'border-grit-500/30 bg-ink-900 text-grit-300 hover:border-grit-500 hover:text-bone-100'
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
              <div className="mt-4 text-sm text-grit-400">
                Selected: {favoriteGenres.length} genre{favoriteGenres.length !== 1 ? 's' : ''}
              </div>
            </div>
          )}

          {/* Step 3: Location */}
          {currentStep === 3 && (
            <div>
              <h2 className="text-2xl font-bold mb-2">{steps[3].title}</h2>
              <p className="text-grit-300 mb-6">Help us recommend events near you</p>
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-bone-100 mb-2">
                  City, State or ZIP Code
                </label>
                <input
                  type="text"
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-3 bg-ink-900 border border-grit-500/30 rounded-lg text-bone-100 placeholder-grit-400 focus:outline-none focus:ring-2 focus:ring-resistance-500 focus:border-transparent"
                  placeholder="e.g., Austin, TX or 78701"
                />
                <p className="mt-2 text-sm text-grit-400">
                  This is optional but helps us show you relevant events in your area
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-resistance-500/10 border border-resistance-500/30 rounded-lg text-resistance-500">
            {error}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              currentStep === 0
                ? 'text-grit-500 cursor-not-allowed'
                : 'text-bone-100 hover:bg-ink-700 border border-grit-500/30'
            }`}
          >
            Back
          </button>

          <div className="flex items-center gap-4">
            {currentStep < steps.length - 1 && (
              <button
                onClick={() => router.push('/profile')}
                className="px-6 py-3 text-grit-300 hover:text-bone-100 transition-all"
              >
                Skip for now
              </button>
            )}

            <button
              onClick={handleNext}
              disabled={!canProceed() || loading}
              className={`px-8 py-3 rounded-lg font-medium transition-all ${
                canProceed() && !loading
                  ? 'bg-gradient-to-r from-resistance-500 to-hack-green text-white hover:shadow-lg hover:shadow-resistance-500/50'
                  : 'bg-grit-500 text-grit-300 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  Saving...
                </div>
              ) : currentStep === steps.length - 1 ? (
                'Complete Setup'
              ) : (
                'Next'
              )}
            </button>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-8 text-center text-sm text-grit-400">
          You can always update your profile later from your account settings
        </div>
      </div>
    </div>
  );
}
