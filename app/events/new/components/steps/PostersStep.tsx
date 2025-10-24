'use client';

import { PosterStyleSelector } from '../form/PosterStyleSelector';

interface PosterStyle {
  id: string;
  name: string;
  description: string;
}

interface PostersStepProps {
  selectedStyle: string | null;
  styles: PosterStyle[];
  posterPreview: string | null;
  isGenerating: boolean;
  handlers: {
    onStyleSelect: (styleId: string) => void;
    onGeneratePoster: () => void;
    onSkip: () => void;
  };
}

export function PostersStep({
  selectedStyle,
  styles,
  posterPreview,
  isGenerating,
  handlers,
}: PostersStepProps) {
  const { onStyleSelect, onGeneratePoster, onSkip } = handlers;

  return (
    <div className="space-y-8">
      {/* Step Description */}
      <div className="mb-6">
        <p className="text-gray-600">
          Choose a poster style and let AI generate a custom poster for your event. You can also skip this step and add a poster later.
        </p>
      </div>

      {/* Poster Preview */}
      {posterPreview && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Preview</h3>
          <div className="flex justify-center rounded-lg border border-gray-300 bg-gray-50 p-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={posterPreview}
              alt="Generated poster preview"
              className="max-h-96 w-auto rounded-md shadow-lg"
            />
          </div>
        </div>
      )}

      {/* Style Selection */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Poster Style</h3>
          <p className="mt-1 text-sm text-gray-600">
            Select a style below to generate your event poster.
          </p>
        </div>

        {styles.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
            <p className="text-gray-500">No styles available at the moment.</p>
          </div>
        ) : (
          <PosterStyleSelector
            selectedStyle={selectedStyle}
            onSelect={onStyleSelect}
            styles={styles}
          />
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between border-t border-gray-200 pt-6">
        <button
          type="button"
          onClick={onSkip}
          disabled={isGenerating}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Skip for Now
        </button>

        <button
          type="button"
          onClick={onGeneratePoster}
          disabled={!selectedStyle || isGenerating}
          className="rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {isGenerating ? 'Generating...' : 'Generate Poster'}
        </button>
      </div>

      {/* Helper Text */}
      <div className="rounded-lg bg-blue-50 p-4">
        <p className="text-sm text-blue-800">
          💡 <strong>Tip:</strong> AI will generate a custom poster based on your event details and selected style.
          You can add a poster later if you skip this step.
        </p>
      </div>
    </div>
  );
}
