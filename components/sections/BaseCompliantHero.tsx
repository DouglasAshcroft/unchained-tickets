/**
 * Base-Compliant Hero Component
 * DRY principle: Reusable hero section for home, about, and landing pages
 * Follows Base messaging guidelines: active voice, benefits first, clear CTAs
 */

import Link from 'next/link';
import { type HeroMessage } from '@/lib/content/baseMessaging';

export interface BaseCompliantHeroProps {
  message: HeroMessage;
  variant?: 'default' | 'centered' | 'split';
  background?: 'gradient' | 'solid' | 'image';
  className?: string;
  children?: React.ReactNode;
}

export function BaseCompliantHero({
  message,
  variant = 'default',
  background = 'gradient',
  className = '',
  children,
}: BaseCompliantHeroProps) {
  const backgroundClasses = {
    gradient: 'bg-gradient-to-br from-ink-900 via-indigo-900/20 to-ink-900',
    solid: 'bg-ink-900',
    image: 'bg-ink-900 bg-cover bg-center',
  }[background];

  if (variant === 'centered') {
    return (
      <section className={`${backgroundClasses} border-b border-grit-500/30 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-bone-100 mb-6 leading-tight">
            {message.headline}
          </h1>
          <p className="text-xl text-grit-300 mb-10 max-w-3xl mx-auto">
            {message.subheadline}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/events"
              className="px-8 py-4 bg-resistance-500 hover:brightness-110 text-bone-100 rounded-lg font-semibold transition-all text-lg"
            >
              {message.cta.primary}
            </Link>
            <Link
              href="/about"
              className="px-8 py-4 bg-transparent hover:bg-grit-500/20 text-bone-100 rounded-lg font-semibold border-2 border-grit-500 hover:border-acid-400 transition-all text-lg"
            >
              {message.cta.secondary}
            </Link>
          </div>
          {children && <div className="mt-12">{children}</div>}
        </div>
      </section>
    );
  }

  if (variant === 'split') {
    return (
      <section className={`${backgroundClasses} border-b border-grit-500/30 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-bone-100 mb-6 leading-tight">
                {message.headline}
              </h1>
              <p className="text-xl text-grit-300 mb-10">
                {message.subheadline}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/events"
                  className="px-8 py-4 bg-resistance-500 hover:brightness-110 text-bone-100 rounded-lg font-semibold transition-all text-lg text-center"
                >
                  {message.cta.primary}
                </Link>
                <Link
                  href="/about"
                  className="px-8 py-4 bg-transparent hover:bg-grit-500/20 text-bone-100 rounded-lg font-semibold border-2 border-grit-500 hover:border-acid-400 transition-all text-lg text-center"
                >
                  {message.cta.secondary}
                </Link>
              </div>
            </div>
            <div className="flex items-center justify-center">
              {children || <HeroPlaceholder />}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Default variant
  return (
    <section className={`${backgroundClasses} border-b border-grit-500/30 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-bold text-bone-100 mb-6 leading-tight">
            {message.headline}
          </h1>
          <p className="text-xl md:text-2xl text-grit-300 mb-10 max-w-2xl">
            {message.subheadline}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/events"
              className="px-8 py-4 bg-resistance-500 hover:brightness-110 text-bone-100 rounded-lg font-semibold transition-all text-lg text-center"
            >
              {message.cta.primary}
            </Link>
            <Link
              href="/about"
              className="px-8 py-4 bg-transparent hover:bg-grit-500/20 text-bone-100 rounded-lg font-semibold border-2 border-grit-500 hover:border-acid-400 transition-all text-lg text-center"
            >
              {message.cta.secondary}
            </Link>
          </div>
        </div>
        {children && <div className="mt-16">{children}</div>}
      </div>
    </section>
  );
}

/**
 * Placeholder for hero visual content (illustrations, images, etc.)
 */
function HeroPlaceholder() {
  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-resistance-500/20 to-acid-400/20 rounded-lg border border-grit-500/30 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="text-6xl">🎫</div>
        <p className="text-grit-400 text-sm">Visual content goes here</p>
      </div>
    </div>
  );
}

// ============================================================================
// SPECIALIZED HERO VARIANTS
// ============================================================================

/**
 * Minimal hero for internal pages (profile, my-tickets, etc.)
 */
export interface MinimalHeroProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    href: string;
  };
  className?: string;
}

export function MinimalHero({ title, description, action, className = '' }: MinimalHeroProps) {
  return (
    <section className={`bg-ink-900 border-b border-grit-500/30 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-bone-100 mb-2">
              {title}
            </h1>
            {description && (
              <p className="text-grit-300 text-lg">
                {description}
              </p>
            )}
          </div>
          {action && (
            <Link
              href={action.href}
              className="px-6 py-3 bg-resistance-500 hover:brightness-110 text-bone-100 rounded-lg font-semibold transition-all whitespace-nowrap"
            >
              {action.label}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

/**
 * Mission statement hero (for about page, etc.)
 */
export interface MissionHeroProps {
  tagline: string;
  mission: string;
  vision: string;
  className?: string;
}

export function MissionHero({ tagline, mission, vision, className = '' }: MissionHeroProps) {
  return (
    <section className={`bg-gradient-to-br from-ink-900 via-indigo-900/20 to-ink-900 border-b border-grit-500/30 ${className}`}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <div className="text-sm uppercase tracking-widest text-acid-400 mb-6">
          {tagline}
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-bone-100 mb-8 leading-tight">
          {mission}
        </h1>
        <p className="text-xl text-grit-300 max-w-3xl mx-auto">
          {vision}
        </p>
      </div>
    </section>
  );
}
