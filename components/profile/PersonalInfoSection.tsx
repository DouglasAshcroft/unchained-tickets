'use client';

import { useState } from 'react';

interface PersonalInfoSectionProps {
  profile: {
    name: string | null;
    email: string;
    phone: string | null;
    bio: string | null;
    avatarUrl: string | null;
  };
  onUpdate: (updates: any) => Promise<boolean>;
}

export function PersonalInfoSection({ profile, onUpdate }: PersonalInfoSectionProps) {
  const [editing, setEditing] = useState(false);

  // Check if email is a placeholder (wallet-only or dev user)
  const isPlaceholderEmail = profile.email.endsWith('@wallet.unchained') ||
                             profile.email.endsWith('@unchained.local');

  const [formData, setFormData] = useState({
    name: profile.name || '',
    email: profile.email,
    phone: profile.phone || '',
    bio: profile.bio || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const success = await onUpdate(formData);
    setSaving(false);
    if (success) {
      setEditing(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: profile.name || '',
      email: profile.email,
      phone: profile.phone || '',
      bio: profile.bio || '',
    });
    setEditing(false);
  };

  return (
    <div className="bg-ink-800/50 border border-grit-500/30 rounded-lg p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-semibold mb-1 text-bone-100">Personal Information</h2>
          <p className="text-sm text-grit-300">Update your personal details</p>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="px-4 py-2 bg-resistance-500 hover:brightness-110 rounded-lg text-sm font-medium transition-all text-bone-100"
          >
            Edit
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Avatar */}
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-resistance-500 to-acid-400 flex items-center justify-center text-2xl font-bold text-bone-100">
            {profile.name
              ? profile.name.charAt(0).toUpperCase()
              : profile.email.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm text-grit-300">Profile Picture</p>
            <p className="text-xs text-grit-400 mt-1">
              Avatar generated from your wallet address
            </p>
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-bone-100 mb-2">Email</label>
          {editing && isPlaceholderEmail ? (
            <>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 bg-ink-700 border border-grit-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-resistance-500 text-bone-100"
                placeholder="your.email@example.com"
              />
              <p className="text-xs text-acid-400 mt-1">
                Please set your real email address (wallet-only accounts use placeholder emails)
              </p>
            </>
          ) : (
            <input
              type="email"
              value={profile.email}
              disabled
              className="w-full px-4 py-2 bg-ink-700 border border-grit-500/30 rounded-lg text-grit-400 cursor-not-allowed"
            />
          )}
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-bone-100 mb-2">Name</label>
          {editing ? (
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-ink-700 border border-grit-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-resistance-500 text-bone-100"
              placeholder="Your name"
            />
          ) : (
            <p className="text-bone-100">{profile.name || 'Not set'}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-bone-100 mb-2">
            Phone Number
          </label>
          {editing ? (
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 bg-ink-700 border border-grit-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-resistance-500 text-bone-100"
              placeholder="+1 (555) 123-4567"
            />
          ) : (
            <p className="text-bone-100">{profile.phone || 'Not set'}</p>
          )}
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-bone-100 mb-2">Bio</label>
          {editing ? (
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 bg-ink-700 border border-grit-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-resistance-500 text-bone-100"
              placeholder="Tell us about yourself..."
            />
          ) : (
            <p className="text-bone-100">{profile.bio || 'Not set'}</p>
          )}
        </div>

        {/* Action Buttons */}
        {editing && (
          <div className="flex space-x-3 pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-resistance-500 hover:brightness-110 disabled:bg-grit-500 rounded-lg font-medium transition-all text-bone-100"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={handleCancel}
              disabled={saving}
              className="px-6 py-2 bg-ink-700 hover:bg-grit-500 border border-grit-500/30 rounded-lg font-medium transition-all text-bone-100"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
