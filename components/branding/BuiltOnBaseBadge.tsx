/**
 * Built on Base Badge Component
 * Follows Base brand guidelines for proper attribution
 * Reference: docs/base_docs/base_brand_guide.md
 */

import Link from 'next/link';

export interface BuiltOnBaseBadgeProps {
  variant?: 'light' | 'dark' | 'color';
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  linkToBase?: boolean;
  className?: string;
}

export function BuiltOnBaseBadge({
  variant = 'dark',
  size = 'md',
  showText = true,
  linkToBase = true,
  className = '',
}: BuiltOnBaseBadgeProps) {
  const sizes = {
    sm: { icon: 'w-4 h-4', text: 'text-xs' },
    md: { icon: 'w-6 h-6', text: 'text-sm' },
    lg: { icon: 'w-8 h-8', text: 'text-base' },
  }[size];

  const colors = {
    light: {
      bg: 'bg-white',
      text: 'text-gray-900',
      icon: '#0000FF', // Blue on light
    },
    dark: {
      bg: 'bg-transparent',
      text: 'text-bone-100',
      icon: '#FFFFFF', // White on dark
    },
    color: {
      bg: 'bg-gradient-to-r from-indigo-500 to-blue-600',
      text: 'text-white',
      icon: '#FFFFFF',
    },
  }[variant];

  const content = (
    <div className={`inline-flex items-center gap-2 ${colors.bg} ${colors.text} ${className}`}>
      {/* Base Logo - Using SVG for proper brand compliance */}
      <div className={sizes.icon}>
        <BaseLogoSquare color={colors.icon} />
      </div>

      {/* Text */}
      {showText && (
        <span className={`font-medium ${sizes.text}`}>
          Built on Base
        </span>
      )}
    </div>
  );

  if (linkToBase) {
    return (
      <Link
        href="https://base.org"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:opacity-80 transition-opacity"
        aria-label="Built on Base - Learn more about Base"
      >
        {content}
      </Link>
    );
  }

  return content;
}

/**
 * Base Logo Square (official brand asset)
 * Per brand guidelines: Always #0000FF (blue) on light, #FFFFFF (white) on dark
 * Never use gradients on the Base square
 */
function BaseLogoSquare({ color }: { color: string }) {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 111 111"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Base logo"
    >
      <path
        d="M54.921 110.034C85.359 110.034 110.034 85.402 110.034 55.017C110.034 24.6319 85.359 0 54.921 0C26.0432 0 2.35281 22.1714 0 50.3923H72.8467V59.6416H3.9565e-07C2.35281 87.8625 26.0432 110.034 54.921 110.034Z"
        fill={color}
      />
    </svg>
  );
}

// ============================================================================
// SPECIALIZED BADGE VARIANTS
// ============================================================================

/**
 * Footer badge - compact version for footer
 */
export function FooterBaseBadge() {
  return (
    <BuiltOnBaseBadge
      variant="dark"
      size="sm"
      showText={true}
      linkToBase={true}
      className="px-3 py-1.5 border border-grit-500/30 rounded-full hover:border-acid-400/50 transition-all"
    />
  );
}

/**
 * Hero badge - large prominent version
 */
export function HeroBaseBadge() {
  return (
    <BuiltOnBaseBadge
      variant="dark"
      size="lg"
      showText={true}
      linkToBase={true}
      className="px-6 py-3 border-2 border-grit-500/30 rounded-lg hover:border-resistance-500/50 transition-all"
    />
  );
}

/**
 * Inline text badge - for use in paragraphs
 */
export function InlineBaseBadge() {
  return (
    <BuiltOnBaseBadge
      variant="dark"
      size="sm"
      showText={false}
      linkToBase={true}
      className="inline-flex align-middle mx-1"
    />
  );
}

/**
 * Powered by Base banner - full width attribution
 */
export interface PoweredByBaseBannerProps {
  className?: string;
}

export function PoweredByBaseBanner({ className = '' }: PoweredByBaseBannerProps) {
  return (
    <div className={`bg-ink-800/50 border border-grit-500/30 rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12">
            <BaseLogoSquare color="#FFFFFF" />
          </div>
          <div>
            <h3 className="font-semibold text-bone-100 text-lg">Built on Base</h3>
            <p className="text-sm text-grit-300">
              Bringing the world onchain with secure, affordable transactions
            </p>
          </div>
        </div>
        <Link
          href="https://base.org"
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-2 bg-resistance-500 hover:brightness-110 text-bone-100 rounded-lg font-medium transition-all text-sm"
        >
          Learn About Base
        </Link>
      </div>
    </div>
  );
}

/**
 * Compact Base attribution - minimal footer version
 */
export interface CompactBaseAttributionProps {
  className?: string;
}

export function CompactBaseAttribution({ className = '' }: CompactBaseAttributionProps) {
  return (
    <Link
      href="https://base.org"
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 text-grit-400 hover:text-bone-100 transition-colors ${className}`}
    >
      <div className="w-4 h-4">
        <BaseLogoSquare color="currentColor" />
      </div>
      <span className="text-xs">Built on Base</span>
    </Link>
  );
}
