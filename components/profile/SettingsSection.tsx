'use client';

import { useState } from 'react';

interface SettingsSectionProps {
  profile: {
    profile: {
      notificationsEnabled: boolean;
      emailMarketing: boolean;
      theme: string;
      language: string;
      timezone: string | null;
    } | null;
  };
  onUpdate: (settings: any) => Promise<boolean>;
}

const THEMES = [
  { value: 'dark', label: 'Dark', icon: '🌙' },
  { value: 'light', label: 'Light', icon: '☀️' },
  { value: 'auto', label: 'Auto', icon: '🔄' },
];

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
  { value: 'ja', label: '日本語' },
];

export function SettingsSection({ profile, onUpdate }: SettingsSectionProps) {
  const settings = profile.profile || {
    notificationsEnabled: true,
    emailMarketing: false,
    theme: 'dark',
    language: 'en',
    timezone: null,
  };

  const [formData, setFormData] = useState(settings);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (key: string, value: any) => {
    setFormData({ ...formData, [key]: value });
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const success = await onUpdate(formData);
    setSaving(false);
    if (success) {
      setHasChanges(false);
    }
  };

  const handleReset = () => {
    setFormData(settings);
    setHasChanges(false);
  };

  return (
    <div className="space-y-6">
      {/* Notifications */}
      <div className="bg-ink-800/50 border border-grit-500/30 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-6 text-bone-100">Notifications</h2>

        <div className="space-y-4">
          {/* Push Notifications */}
          <div className="flex items-center justify-between py-3 border-b border-grit-500/30">
            <div className="flex-1">
              <p className="font-medium text-bone-100">Push Notifications</p>
              <p className="text-sm text-grit-400 mt-1">
                Receive alerts for event updates and ticket confirmations
              </p>
            </div>
            <button
              onClick={() =>
                handleChange('notificationsEnabled', !formData.notificationsEnabled)
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.notificationsEnabled ? 'bg-resistance-500' : 'bg-grit-500'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Email Marketing */}
          <div className="flex items-center justify-between py-3">
            <div className="flex-1">
              <p className="font-medium text-bone-100">Marketing Emails</p>
              <p className="text-sm text-grit-400 mt-1">
                Receive updates about new features and special offers
              </p>
            </div>
            <button
              onClick={() => handleChange('emailMarketing', !formData.emailMarketing)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.emailMarketing ? 'bg-resistance-500' : 'bg-grit-500'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.emailMarketing ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-ink-800/50 border border-grit-500/30 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-6 text-bone-100">Appearance</h2>

        <div className="space-y-4">
          {/* Theme */}
          <div>
            <label className="block text-sm font-medium text-bone-100 mb-3">Theme</label>
            <div className="grid grid-cols-3 gap-3">
              {THEMES.map((theme) => (
                <button
                  key={theme.value}
                  onClick={() => handleChange('theme', theme.value)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.theme === theme.value
                      ? 'border-resistance-500 bg-resistance-500/10'
                      : 'border-grit-500 bg-ink-700 hover:border-grit-400'
                  }`}
                >
                  <div className="text-2xl mb-2">{theme.icon}</div>
                  <div className="text-sm font-medium text-bone-100">{theme.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Language */}
          <div>
            <label className="block text-sm font-medium text-bone-100 mb-3">
              Language
            </label>
            <select
              value={formData.language}
              onChange={(e) => handleChange('language', e.target.value)}
              className="w-full px-4 py-2 bg-ink-700 border border-grit-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-resistance-500 text-bone-100"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          {/* Timezone */}
          <div>
            <label className="block text-sm font-medium text-bone-100 mb-3">
              Timezone
            </label>
            <select
              value={formData.timezone || 'America/New_York'}
              onChange={(e) => handleChange('timezone', e.target.value)}
              className="w-full px-4 py-2 bg-ink-700 border border-grit-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-resistance-500 text-bone-100"
            >
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
              <option value="America/Anchorage">Alaska Time (AKT)</option>
              <option value="Pacific/Honolulu">Hawaii Time (HT)</option>
              <option value="Europe/London">London (GMT)</option>
              <option value="Europe/Paris">Paris (CET)</option>
              <option value="Asia/Tokyo">Tokyo (JST)</option>
              <option value="Australia/Sydney">Sydney (AEDT)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Privacy & Security */}
      <div className="bg-ink-800/50 border border-grit-500/30 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-6 text-bone-100">Privacy & Security</h2>

        <div className="space-y-4">
          <div className="p-4 bg-ink-700 border border-grit-500/30 rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-medium mb-1 text-bone-100">Data Privacy</p>
                <p className="text-sm text-grit-400">
                  Your wallet address and transaction data are stored securely. We never share
                  your personal information.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-ink-700 border border-grit-500/30 rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-medium mb-1 text-bone-100">Two-Factor Authentication</p>
                <p className="text-sm text-grit-400">
                  Your wallet signature serves as your authentication method
                </p>
              </div>
              <span className="px-3 py-1 bg-hack-green/20 text-hack-green text-xs rounded-full">
                Active
              </span>
            </div>
          </div>

          <button className="w-full py-3 bg-resistance-500/10 hover:bg-resistance-500/20 text-resistance-500 rounded-lg font-medium transition-all border border-resistance-500/30">
            Delete Account
          </button>
        </div>
      </div>

      {/* Save Changes */}
      {hasChanges && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-ink-800 border border-resistance-500 rounded-lg shadow-xl p-4 flex items-center space-x-4 z-50">
          <p className="text-sm font-medium text-bone-100">You have unsaved changes</p>
          <div className="flex space-x-2">
            <button
              onClick={handleReset}
              disabled={saving}
              className="px-4 py-2 bg-ink-700 hover:bg-grit-500 border border-grit-500/30 rounded-lg text-sm font-medium transition-all text-bone-100"
            >
              Discard
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-resistance-500 hover:brightness-110 disabled:bg-grit-500 rounded-lg text-sm font-medium transition-all text-bone-100"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
