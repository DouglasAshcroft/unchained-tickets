'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api/client';
import { PersonalInfoSection } from '@/components/profile/PersonalInfoSection';
import { LocationSection } from '@/components/profile/LocationSection';
import { MusicPreferencesSection } from '@/components/profile/MusicPreferencesSection';
import { PaymentMethodsSection } from '@/components/profile/PaymentMethodsSection';
import { AdvocacyStatsSection } from '@/components/profile/AdvocacyStatsSection';
import { VenueStaffSection } from '@/components/profile/VenueStaffSection';
import { ConnectedWalletsSection } from '@/components/profile/ConnectedWalletsSection';
import { SettingsSection } from '@/components/profile/SettingsSection';
import { OnboardingBanner } from '@/components/profile/OnboardingBanner';

interface UserProfile {
  id: number;
  email: string;
  name: string | null;
  role: string;
  phone: string | null;
  avatarUrl: string | null;
  bio: string | null;
  location: string | null;
  favoriteGenres: string[];
  locationEnabled: boolean;
  latitude: number | null;
  longitude: number | null;
  stripeCustomerId: string | null;
  createdAt: string;
  profile: {
    notificationsEnabled: boolean;
    emailMarketing: boolean;
    theme: string;
    language: string;
    timezone: string | null;
  } | null;
  wallets: Array<{
    wallet: {
      address: string;
      chain: string;
    };
    isPrimary: boolean;
  }>;
  favoriteArtists: Array<{
    artist: {
      id: number;
      name: string;
      slug: string;
      imageUrl: string | null;
    };
  }>;
  _count: {
    tickets: number;
  };
}

interface AdvocacyStats {
  advocacyCount: number;
  totalVenuesReached: number;
  currentTier: number;
}

interface VenueStaffMembership {
  id: number;
  role: string;
  venueId: number;
  isActive: boolean;
  createdAt: string;
  venue: {
    id: number;
    name: string;
    slug: string;
    city: string | null;
    state: string | null;
    imageUrl: string | null;
  };
}

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [advocacyStats, setAdvocacyStats] = useState<AdvocacyStats | null>(null);
  const [venueStaff, setVenueStaff] = useState<VenueStaffMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [advocateEmail, setAdvocateEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchProfile();
      fetchAdvocacyStats();
      fetchVenueStaff();

      // Check if this is a new user from advocate flow
      const isNew = searchParams?.get('new') === 'true';
      const email = typeof window !== 'undefined' ? localStorage.getItem('advocate_email') : null;

      if (isNew && email) {
        setShowOnboarding(true);
        setAdvocateEmail(email);
        // Clear the email from localStorage after reading
        if (typeof window !== 'undefined') {
          localStorage.removeItem('advocate_email');
        }
      }
    }
  }, [isAuthenticated, user, searchParams]);

  const fetchProfile = async () => {
    try {
      const data = await api.getProfile();
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdvocacyStats = async () => {
    try {
      const data = await api.getAdvocacyStats();
      setAdvocacyStats(data);
    } catch (error) {
      console.error('Error fetching advocacy stats:', error);
    }
  };

  const fetchVenueStaff = async () => {
    try {
      const data = await api.getVenueStaff();
      setVenueStaff(data);
    } catch (error) {
      console.error('Error fetching venue staff:', error);
    }
  };

  const handleUpdateProfile = async (updates: Partial<UserProfile>) => {
    try {
      // Filter to only include fields that the API accepts
      const profileUpdates: any = {};
      if (updates.name !== undefined) profileUpdates.name = updates.name;
      if (updates.phone !== undefined) profileUpdates.phone = updates.phone;
      if (updates.avatarUrl !== undefined) profileUpdates.avatarUrl = updates.avatarUrl;
      if (updates.bio !== undefined) profileUpdates.bio = updates.bio;
      if (updates.location !== undefined) profileUpdates.location = updates.location;
      if (updates.favoriteGenres !== undefined) profileUpdates.favoriteGenres = updates.favoriteGenres;
      if (updates.locationEnabled !== undefined) profileUpdates.locationEnabled = updates.locationEnabled;
      if (updates.latitude !== undefined) profileUpdates.latitude = updates.latitude;
      if (updates.longitude !== undefined) profileUpdates.longitude = updates.longitude;

      await api.updateProfile(profileUpdates);
      await fetchProfile();
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    }
  };

  const handleUpdateSettings = async (settings: any) => {
    try {
      await api.updateProfileSettings(settings);
      await fetchProfile();
      return true;
    } catch (error) {
      console.error('Error updating settings:', error);
      return false;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-ink-900 to-ink-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-resistance-500"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-ink-900 to-ink-800 flex items-center justify-center">
        <div className="text-bone-100">Failed to load profile</div>
      </div>
    );
  }

  // Check profile completion status
  const profileComplete = {
    hasName: !!profile?.name,
    hasLocation: !!profile?.location,
    hasGenres: (profile?.favoriteGenres?.length || 0) > 0,
  };

  const handleDismissOnboarding = () => {
    setShowOnboarding(false);
  };

  const tabs = [
    { id: 'profile', label: 'Personal Info' },
    { id: 'location-music', label: 'Location & Music' },
    { id: 'wallets', label: 'Connected Wallets' },
    { id: 'payment', label: 'Payment Methods' },
    { id: 'advocacy', label: 'Advocacy' },
    { id: 'venue-staff', label: 'Venue Staff', hidden: venueStaff.length === 0 },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-ink-900 to-ink-800 text-bone-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="brand-heading text-4xl font-bold mb-2 bg-gradient-to-r from-resistance-500 via-hack-green to-acid-400 bg-clip-text text-transparent">
            My Profile
          </h1>
          <p className="text-grit-300">Manage your account settings and preferences</p>
        </div>

        {/* Onboarding Banner for New Users */}
        {showOnboarding && (
          <OnboardingBanner
            email={advocateEmail || undefined}
            profileComplete={profileComplete}
            onDismiss={handleDismissOnboarding}
          />
        )}

        {/* Tabs */}
        <div className="border-b border-grit-500/30 mb-8">
          <nav className="flex space-x-8 overflow-x-auto">
            {tabs
              .filter((tab) => !tab.hidden)
              .map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-resistance-500 text-resistance-500'
                      : 'border-transparent text-grit-300 hover:text-bone-100 hover:border-grit-500'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'profile' && (
            <PersonalInfoSection profile={profile} onUpdate={handleUpdateProfile} />
          )}

          {activeTab === 'location-music' && (
            <>
              <LocationSection profile={profile} onUpdate={handleUpdateProfile} />
              <MusicPreferencesSection
                profile={profile}
                onUpdate={handleUpdateProfile}
                onRefresh={fetchProfile}
              />
            </>
          )}

          {activeTab === 'wallets' && (
            <ConnectedWalletsSection wallets={profile.wallets} />
          )}

          {activeTab === 'payment' && (
            <PaymentMethodsSection
              stripeCustomerId={profile.stripeCustomerId}
              hasWallet={profile.wallets.length > 0}
            />
          )}

          {activeTab === 'advocacy' && advocacyStats && (
            <AdvocacyStatsSection stats={advocacyStats} />
          )}

          {activeTab === 'venue-staff' && venueStaff.length > 0 && (
            <VenueStaffSection memberships={venueStaff} />
          )}

          {activeTab === 'settings' && (
            <SettingsSection profile={profile} onUpdate={handleUpdateSettings} />
          )}
        </div>
      </div>
    </div>
  );
}
