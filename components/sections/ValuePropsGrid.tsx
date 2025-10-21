/**
 * Reusable Value Propositions Grid Component
 * DRY principle: Single component for displaying value props across the app
 * Used on: Home page, About page, Profile page, etc.
 */

import { type ValuePropItem } from '@/lib/content/valueProps';

export interface ValuePropsGridProps {
  items: readonly ValuePropItem[];
  columns?: 2 | 3 | 4;
  className?: string;
  variant?: 'default' | 'compact' | 'detailed';
}

export function ValuePropsGrid({
  items,
  columns = 3,
  className = '',
  variant = 'default',
}: ValuePropsGridProps) {
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  }[columns];

  return (
    <div className={`grid ${gridCols} gap-6 ${className}`}>
      {items.map((item, index) => (
        <ValuePropCard key={index} item={item} variant={variant} />
      ))}
    </div>
  );
}

interface ValuePropCardProps {
  item: ValuePropItem;
  variant: 'default' | 'compact' | 'detailed';
}

function ValuePropCard({ item, variant }: ValuePropCardProps) {
  if (variant === 'compact') {
    return (
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 text-2xl">{item.icon}</div>
        <div>
          <h4 className="font-semibold text-bone-100 mb-1">{item.title}</h4>
          <p className="text-sm text-grit-300">{item.description}</p>
        </div>
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className="bg-ink-800/50 border border-grit-500/30 rounded-lg p-6 hover:border-acid-400/50 transition-all">
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-resistance-500 to-acid-400 flex items-center justify-center text-2xl mb-4">
          {item.icon}
        </div>
        <h3 className="text-xl font-semibold text-bone-100 mb-2">{item.title}</h3>
        <p className="text-grit-300 mb-3">{item.description}</p>
        {item.benefit && (
          <p className="text-sm text-acid-400 border-l-2 border-acid-400 pl-3">
            {item.benefit}
          </p>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div className="bg-ink-800/50 border border-grit-500/30 rounded-lg p-6 hover:border-resistance-500/50 transition-all">
      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-resistance-500/20 flex items-center justify-center text-2xl mb-4">
        {item.icon}
      </div>
      <h3 className="text-lg font-semibold text-bone-100 mb-2">{item.title}</h3>
      <p className="text-sm text-grit-300">{item.description}</p>
    </div>
  );
}

// ============================================================================
// SPECIALIZED GRID VARIANTS
// ============================================================================

/**
 * Feature Highlights Grid - for marketing sections
 */
export interface FeatureHighlightsGridProps {
  features: readonly {
    category: string;
    icon: string;
    title: string;
    points: readonly string[];
  }[];
  className?: string;
}

export function FeatureHighlightsGrid({ features, className = '' }: FeatureHighlightsGridProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 ${className}`}>
      {features.map((feature, index) => (
        <div
          key={index}
          className="bg-gradient-to-br from-ink-800 to-ink-900 border border-grit-500/30 rounded-lg p-6"
        >
          <div className="text-3xl mb-3">{feature.icon}</div>
          <div className="text-xs uppercase tracking-wider text-acid-400 mb-2">
            {feature.category}
          </div>
          <h3 className="text-xl font-bold text-bone-100 mb-4">{feature.title}</h3>
          <ul className="space-y-2">
            {feature.points.map((point, pointIndex) => (
              <li key={pointIndex} className="flex items-start text-sm text-grit-300">
                <span className="text-hack-green mr-2 flex-shrink-0">✓</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

/**
 * User Journey Grid - for step-by-step flows
 */
export interface UserJourneyGridProps {
  steps: readonly {
    step: number;
    icon: string;
    title: string;
    description: string;
  }[];
  className?: string;
}

export function UserJourneyGrid({ steps, className = '' }: UserJourneyGridProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
      {steps.map((stepItem) => (
        <div
          key={stepItem.step}
          className="relative bg-ink-800/50 border border-grit-500/30 rounded-lg p-6 hover:border-hack-green/50 transition-all"
        >
          <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-resistance-500 flex items-center justify-center text-bone-100 font-bold text-sm border-2 border-ink-900">
            {stepItem.step}
          </div>
          <div className="text-4xl mb-3">{stepItem.icon}</div>
          <h3 className="text-lg font-semibold text-bone-100 mb-2">{stepItem.title}</h3>
          <p className="text-sm text-grit-300">{stepItem.description}</p>
        </div>
      ))}
    </div>
  );
}

/**
 * Comparison Grid - Old Way vs New Way
 */
export interface ComparisonGridProps {
  oldWay: {
    title: string;
    icon: string;
    problems: readonly string[];
  };
  newWay: {
    title: string;
    icon: string;
    benefits: readonly string[];
  };
  className?: string;
}

export function ComparisonGrid({ oldWay, newWay, className = '' }: ComparisonGridProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 ${className}`}>
      {/* Old Way */}
      <div className="bg-ink-800/30 border border-grit-500/30 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="text-3xl">{oldWay.icon}</div>
          <h3 className="text-xl font-bold text-grit-300">{oldWay.title}</h3>
        </div>
        <ul className="space-y-3">
          {oldWay.problems.map((problem, index) => (
            <li key={index} className="flex items-start text-sm text-grit-400">
              <span className="text-resistance-500 mr-2 flex-shrink-0">✗</span>
              <span className="line-through">{problem}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* New Way */}
      <div className="bg-gradient-to-br from-hack-green/10 to-acid-400/10 border-2 border-hack-green/30 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="text-3xl">{newWay.icon}</div>
          <h3 className="text-xl font-bold text-bone-100">{newWay.title}</h3>
        </div>
        <ul className="space-y-3">
          {newWay.benefits.map((benefit, index) => (
            <li key={index} className="flex items-start text-sm text-grit-200">
              <span className="text-hack-green mr-2 flex-shrink-0">✓</span>
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
