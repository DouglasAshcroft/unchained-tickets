/**
 * StatusSelector Component
 *
 * Generic, reusable component for selecting draft vs published status.
 * Can be used across events, artists, venues, or any entity with
 * a draft/publish workflow.
 *
 * DRY Principle: Reusable component, not specific to events
 */

'use client';

export interface StatusSelectorProps {
  value: 'draft' | 'published';
  onChange: (status: 'draft' | 'published') => void;
  validationState: {
    ready: boolean;
    errors: string[];
    warnings: string[];
  };
  labels?: {
    draft?: {
      title: string;
      description: string;
    };
    published?: {
      title: string;
      description: string;
    };
  };
}

const DEFAULT_LABELS = {
  draft: {
    title: 'Save as draft',
    description: 'Keep working privately. You can preview before going live.',
  },
  published: {
    title: 'Publish now',
    description: 'Event will be visible on the events page and register on blockchain.',
  },
};

export function StatusSelector({
  value,
  onChange,
  validationState,
  labels = DEFAULT_LABELS,
}: StatusSelectorProps) {
  const draftLabel = labels.draft || DEFAULT_LABELS.draft;
  const publishedLabel = labels.published || DEFAULT_LABELS.published;

  return (
    <div className="space-y-6">
      {/* Status Selection Buttons */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Draft Button */}
        <button
          type="button"
          onClick={() => onChange('draft')}
          className={`rounded-lg border px-4 py-3 text-left transition-colors ${
            value === 'draft'
              ? 'border-acid-400 bg-acid-400/10'
              : 'border-grit-500/30 hover:border-grit-500/50'
          }`}
          aria-label={draftLabel.title}
        >
          <div className="font-semibold text-bone-100">{draftLabel.title}</div>
          <div className="text-sm text-grit-400 mt-1">{draftLabel.description}</div>
        </button>

        {/* Publish Button */}
        <button
          type="button"
          onClick={() => onChange('published')}
          disabled={!validationState.ready}
          className={`rounded-lg border px-4 py-3 text-left transition-colors ${
            value === 'published'
              ? 'border-acid-400 bg-acid-400/10'
              : validationState.ready
              ? 'border-grit-500/30 hover:border-grit-500/50'
              : 'border-grit-500/20 bg-grit-500/5 opacity-50 cursor-not-allowed'
          }`}
          aria-label={publishedLabel.title}
        >
          <div className="font-semibold text-bone-100">{publishedLabel.title}</div>
          <div className="text-sm text-grit-400 mt-1">{publishedLabel.description}</div>
        </button>
      </div>

      {/* Validation Errors */}
      {validationState.errors.length > 0 && (
        <div className="rounded-lg border border-signal-500/30 bg-signal-500/10 p-4">
          <div className="flex items-start gap-2">
            <svg
              className="h-5 w-5 flex-shrink-0 text-signal-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="flex-1">
              <div className="font-medium text-signal-500 mb-2">
                Cannot publish until these issues are resolved:
              </div>
              <ul className="space-y-1">
                {validationState.errors.map((error, index) => (
                  <li key={index} className="text-sm text-signal-500">
                    • {error}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Validation Warnings */}
      {validationState.warnings.length > 0 && (
        <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
          <div className="flex items-start gap-2">
            <svg
              className="h-5 w-5 flex-shrink-0 text-yellow-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div className="flex-1">
              <div className="font-medium text-yellow-500 mb-2">Recommendations:</div>
              <ul className="space-y-1">
                {validationState.warnings.map((warning, index) => (
                  <li key={index} className="text-sm text-yellow-500">
                    • {warning}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
