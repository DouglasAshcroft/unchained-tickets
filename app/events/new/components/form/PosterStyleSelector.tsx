'use client';

export interface PosterStyle {
  id: string;
  name: string;
  description: string;
}

export interface PosterStyleSelectorProps {
  selectedStyle: string | null;
  onSelect: (styleId: string) => void;
  styles: PosterStyle[];
  label?: string;
  error?: string;
}

/**
 * Poster style selector component
 *
 * Features:
 * - Grid layout of style cards
 * - Visual selection indicator
 * - Responsive design (2 cols mobile, 3 cols desktop)
 * - Hover effects
 * - Accessibility support
 */
export function PosterStyleSelector({
  selectedStyle,
  onSelect,
  styles = [],
  label,
  error,
}: PosterStyleSelectorProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="mb-2 block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <div
        className={`rounded-lg border p-4 ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      >
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {styles.map((style) => {
            const isSelected = selectedStyle === style.id;

            return (
              <button
                key={style.id}
                type="button"
                onClick={() => onSelect(style.id)}
                aria-label={`Select ${style.name} style`}
                aria-pressed={isSelected}
                className={`relative rounded-lg border-2 p-4 text-left transition-all hover:border-blue-500 ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                    : 'border-gray-300 bg-white'
                }`}
              >
                {/* Checkmark icon for selected state */}
                {isSelected && (
                  <div className="absolute right-2 top-2">
                    <svg
                      className="h-5 w-5 text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}

                <div className="space-y-2">
                  {/* Style name */}
                  <h3 className="text-lg font-semibold text-gray-900">
                    {style.name}
                  </h3>

                  {/* Style description */}
                  {style.description && (
                    <p className="text-sm text-gray-600">
                      {style.description}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
