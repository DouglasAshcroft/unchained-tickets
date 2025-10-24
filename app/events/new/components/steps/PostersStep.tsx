'use client';

import { PosterStyleSelector } from '../form/PosterStyleSelector';
import { StepHeader, SectionDivider } from '@/components/ui/forms';

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
    <div className="space-y-10">
      {/* Step Description */}
      <StepHeader
        stepNumber="04"
        title="Visual Impact"
        description="Generate the artwork. Let AI design a poster that matches your event's vibe, or skip and add your own later."
      />

      {/* Poster Preview */}
      {posterPreview && (
        <div className="space-y-8">
          <SectionDivider variant="acid">Preview</SectionDivider>
          <div className="flex justify-center rounded-xl border border-grit-500/30 bg-ink-800/50 p-8 backdrop-blur-sm dark:border-grit-500/30 dark:bg-ink-800/50 light:border-grit-400/30 light:bg-bone-100/5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={posterPreview}
              alt="Generated poster preview"
              className="max-h-96 w-auto rounded-lg border border-grit-500/20 shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* Style Selection */}
      <div className="space-y-8">
        <SectionDivider variant="resistance">Poster Style</SectionDivider>

        {styles.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-grit-500/30 bg-ink-900/20 p-12 text-center backdrop-blur-sm dark:border-grit-500/30 dark:bg-ink-900/20 light:border-grit-400/30 light:bg-bone-100/10">
            <p className="font-mono text-grit-400">No styles available at the moment.</p>
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
      <div className="flex items-center justify-between border-t border-grit-500/30 pt-8 dark:border-grit-500/30 light:border-grit-400/30">
        <button
          type="button"
          onClick={onSkip}
          disabled={isGenerating}
          className="rounded-lg border border-grit-500/30 bg-ink-900/50 px-6 py-3 font-mono text-sm font-medium text-grit-300 backdrop-blur-sm transition-all hover:border-grit-400 hover:bg-ink-900/70 focus:outline-none focus:ring-2 focus:ring-grit-400/50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-grit-500/30 dark:bg-ink-900/50 dark:text-grit-300 light:border-grit-400/30 light:bg-bone-100/50 light:text-grit-600"
        >
          Skip for Now
        </button>

        <button
          type="button"
          onClick={onGeneratePoster}
          disabled={!selectedStyle || isGenerating}
          className="group inline-flex items-center gap-3 rounded-lg border border-acid-400/30 bg-acid-400/10 px-6 py-3 font-mono text-sm font-medium text-acid-400 transition-all hover:border-acid-400/50 hover:bg-acid-400/20 hover:shadow-lg hover:shadow-acid-400/20 focus:outline-none focus:ring-2 focus:ring-acid-400/50 disabled:cursor-not-allowed disabled:opacity-50 disabled:grayscale dark:border-acid-400/30 dark:bg-acid-400/10 dark:text-acid-400 light:border-cobalt-500/30 light:bg-cobalt-500/10 light:text-cobalt-500"
        >
          {isGenerating ? (
            <>
              <svg className="h-5 w-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="uppercase tracking-wider">Generating...</span>
            </>
          ) : (
            <>
              <svg className="h-5 w-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="uppercase tracking-wider">Generate Poster</span>
            </>
          )}
        </button>
      </div>

      {/* Helper Text */}
      <div className="rounded-xl border border-hack-green/30 bg-hack-green/5 p-6 backdrop-blur-sm dark:border-hack-green/30 dark:bg-hack-green/5 light:border-cobalt-500/30 light:bg-cobalt-500/5">
        <p className="flex items-start gap-3 font-mono text-sm text-hack-green dark:text-hack-green light:text-cobalt-600">
          <svg className="mt-0.5 h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>
            <strong className="uppercase tracking-wider">Tip:</strong> AI will generate a custom poster based on your event details and selected style.
            You can add a poster later if you skip this step.
          </span>
        </p>
      </div>
    </div>
  );
}
