'use client';

import { useTheme } from './providers/ThemeProvider';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-lg border border-grit-500/30 bg-ink-800/50" />
    );
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const icon = theme === 'dark' ? '🌙' : '☀️';
  const label = theme === 'dark' ? 'Dark' : 'Light';

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-2 px-3 py-2 rounded-lg border border-grit-500/30 bg-ink-800/50 hover:bg-ink-700/50 hover:border-acid-400/50 transition-all"
      aria-label={`Theme: ${label}. Click to switch to ${theme === 'dark' ? 'light' : 'dark'} mode.`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <span className="text-lg leading-none" aria-hidden="true">
        {icon}
      </span>
      <span className="text-sm text-grit-300 hidden sm:inline">{label}</span>
    </button>
  );
}
