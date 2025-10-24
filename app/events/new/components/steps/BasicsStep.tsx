'use client';

import { ArtistSearchInput } from '../form/ArtistSearchInput';
import type { Artist } from '../../types';

interface BasicsStepProps {
  formData: {
    title: string;
    posterImageUrl: string;
    externalLink: string;
    primaryArtistId: string;
  };
  errors: Record<string, string>;
  artists: Artist[];
  selectedArtist: Artist | null;
  posterFile: File | null;
  posterPreview: string | null;
  handlers: {
    onFieldChange: (field: string, value: string) => void;
    onArtistSelect: (artist: Artist) => void;
    onPosterFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onPosterDrop: (event: React.DragEvent<HTMLDivElement>) => void;
    onClearPoster: () => void;
  };
}

export function BasicsStep({
  formData,
  errors,
  artists,
  selectedArtist,
  posterFile,
  posterPreview,
  handlers,
}: BasicsStepProps) {
  const { onFieldChange, onArtistSelect, onPosterFileChange, onClearPoster } = handlers;

  return (
    <div className="space-y-10">
      {/* Step Description */}
      <div className="rounded-xl border border-grit-500/30 bg-ink-800/50 p-6 backdrop-blur-sm dark:bg-ink-800/50 light:border-grit-400/30 light:bg-bone-100/5">
        <p className="brand-heading text-sm uppercase tracking-widest text-acid-400 dark:text-acid-400 light:text-cobalt-500">
          Step 01 · The Essentials
        </p>
        <p className="mt-2 text-bone-100/80 dark:text-bone-100/80 light:text-ink-800/80">
          Set the stage. Every legendary show starts with a killer title and the artist who brings the energy.
        </p>
      </div>

      {/* Event Details Section */}
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-resistance-500/50 to-transparent" />
          <h3 className="brand-heading text-lg uppercase tracking-wider text-bone-100 dark:text-bone-100 light:text-ink-900">
            Event Details
          </h3>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-resistance-500/50 to-transparent" />
        </div>

        {/* Event Title */}
        <div className="group">
          <label htmlFor="event-title" className="mb-2 block text-sm font-medium uppercase tracking-wide text-grit-300 dark:text-grit-300 light:text-grit-500">
            Event Title <span className="text-resistance-500">*</span>
          </label>
          <input
            id="event-title"
            type="text"
            value={formData.title}
            onChange={(e) => onFieldChange('title', e.target.value)}
            className={`w-full rounded-lg border bg-ink-900/50 px-4 py-3.5 font-mono text-bone-100 placeholder-grit-400 backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-ink-900 dark:bg-ink-900/50 dark:text-bone-100 light:bg-white/50 light:text-ink-900 light:ring-offset-bone-100 ${
              errors?.title
                ? 'border-resistance-500/50 focus:border-resistance-500 focus:ring-resistance-500/50'
                : 'border-grit-500/30 hover:border-acid-400/50 focus:border-acid-400 focus:ring-acid-400/50'
            }`}
            placeholder="Neon Nights • Circuit Ritual • Frequency Wars"
            aria-describedby={errors?.title ? 'title-error' : undefined}
          />
          {errors?.title && (
            <div className="mt-2 flex items-start gap-2">
              <span className="text-resistance-500">⚠</span>
              <p id="title-error" className="text-sm text-resistance-400">
                {errors.title}
              </p>
            </div>
          )}
        </div>

        {/* Primary Artist */}
        <div>
          <ArtistSearchInput
            value={selectedArtist?.name || ''}
            onChange={(value) => {
              if (!value) {
                onFieldChange('primaryArtistId', '');
              }
            }}
            onSelect={onArtistSelect}
            artists={artists}
            label="Primary Artist *"
            error={errors?.primaryArtistId}
            placeholder="Search for artists or bands..."
          />
        </div>

        {/* External Event Link */}
        <div className="group">
          <label htmlFor="external-link" className="mb-2 block text-sm font-medium uppercase tracking-wide text-grit-300 dark:text-grit-300 light:text-grit-500">
            External Link <span className="text-xs normal-case text-grit-400">(optional)</span>
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <svg className="h-5 w-5 text-grit-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <input
              id="external-link"
              type="url"
              value={formData.externalLink}
              onChange={(e) => onFieldChange('externalLink', e.target.value)}
              className={`w-full rounded-lg border bg-ink-900/50 py-3.5 pl-12 pr-4 font-mono text-sm text-bone-100 placeholder-grit-400 backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-ink-900 dark:bg-ink-900/50 dark:text-bone-100 light:bg-white/50 light:text-ink-900 light:ring-offset-bone-100 ${
                errors?.externalLink
                  ? 'border-resistance-500/50 focus:border-resistance-500 focus:ring-resistance-500/50'
                  : 'border-grit-500/30 hover:border-acid-400/50 focus:border-acid-400 focus:ring-acid-400/50'
              }`}
              placeholder="https://eventbrite.com/your-event"
              aria-describedby="external-link-help"
            />
          </div>
          <p id="external-link-help" className="mt-2 text-xs text-grit-400">
            Link to Eventbrite, Ticketmaster, or your venue's site
          </p>
          {errors?.externalLink && (
            <div className="mt-2 flex items-start gap-2">
              <span className="text-resistance-500">⚠</span>
              <p className="text-sm text-resistance-400">{errors.externalLink}</p>
            </div>
          )}
        </div>
      </div>

      {/* Poster Section */}
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-acid-400/50 to-transparent" />
          <h3 className="brand-heading text-lg uppercase tracking-wider text-bone-100 dark:text-bone-100 light:text-ink-900">
            Visual Identity
          </h3>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-acid-400/50 to-transparent" />
        </div>

        {/* Poster Upload Area */}
        <div className="space-y-6">
          <div>
            <label className="mb-3 block text-sm font-medium uppercase tracking-wide text-grit-300 dark:text-grit-300 light:text-grit-500">
              Poster Image
            </label>

            <div className="space-y-4">
              {/* File Upload Button */}
              <div className="relative">
                <input
                  id="poster-file-upload"
                  type="file"
                  accept="image/*"
                  onChange={onPosterFileChange}
                  className="sr-only"
                />
                <label
                  htmlFor="poster-file-upload"
                  className="group inline-flex cursor-pointer items-center gap-3 rounded-lg border border-acid-400/30 bg-acid-400/5 px-6 py-3 font-mono text-sm font-medium text-acid-400 transition-all hover:border-acid-400/50 hover:bg-acid-400/10 hover:shadow-lg hover:shadow-acid-400/20 focus:outline-none focus:ring-2 focus:ring-acid-400/50 dark:border-acid-400/30 dark:bg-acid-400/5 dark:text-acid-400 light:border-cobalt-500/30 light:bg-cobalt-500/5 light:text-cobalt-500 light:hover:border-cobalt-500/50 light:hover:bg-cobalt-500/10"
                >
                  <svg className="h-5 w-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span className="brand-heading uppercase tracking-wider">Upload Poster</span>
                </label>
              </div>

              {/* Preview + File Name */}
              {posterPreview && (
                <div className="relative overflow-hidden rounded-xl border border-grit-500/30 bg-ink-800/50 p-6 dark:border-grit-500/30 dark:bg-ink-800/50 light:border-grit-400/30 light:bg-bone-100/30">
                  <div className="absolute right-4 top-4 z-10">
                    <button
                      type="button"
                      onClick={onClearPoster}
                      className="rounded-lg border border-resistance-500/30 bg-resistance-500/10 px-4 py-2 text-sm font-medium text-resistance-400 backdrop-blur-sm transition-all hover:border-resistance-500 hover:bg-resistance-500/20 hover:text-resistance-300 focus:outline-none focus:ring-2 focus:ring-resistance-500/50"
                    >
                      Clear
                    </button>
                  </div>

                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={posterPreview}
                    alt="Poster preview"
                    className="mx-auto h-64 w-auto rounded-lg border border-grit-500/20 object-contain shadow-2xl"
                  />

                  {posterFile && (
                    <p className="mt-4 text-center font-mono text-sm text-grit-300">
                      {posterFile.name} <span className="text-grit-500">•</span> {(posterFile.size / 1024).toFixed(1)} KB
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* OR Divider */}
          <div className="relative flex items-center justify-center py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-grit-500/30" />
            </div>
            <div className="relative bg-ink-900 px-4 font-mono text-xs uppercase tracking-wider text-grit-400 dark:bg-ink-900 light:bg-bone-100">
              Or use URL
            </div>
          </div>

          {/* Poster URL */}
          <div className="group">
            <label htmlFor="poster-url" className="mb-2 block text-sm font-medium uppercase tracking-wide text-grit-300 dark:text-grit-300 light:text-grit-500">
              Poster Image URL <span className="text-xs normal-case text-grit-400">(alternative)</span>
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <svg className="h-5 w-5 text-grit-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <input
                id="poster-url"
                type="url"
                value={formData.posterImageUrl}
                onChange={(e) => onFieldChange('posterImageUrl', e.target.value)}
                className={`w-full rounded-lg border bg-ink-900/50 py-3.5 pl-12 pr-4 font-mono text-sm text-bone-100 placeholder-grit-400 backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-ink-900 dark:bg-ink-900/50 dark:text-bone-100 light:bg-white/50 light:text-ink-900 light:ring-offset-bone-100 ${
                  errors?.posterImageUrl
                    ? 'border-resistance-500/50 focus:border-resistance-500 focus:ring-resistance-500/50'
                    : 'border-grit-500/30 hover:border-acid-400/50 focus:border-acid-400 focus:ring-acid-400/50'
                }`}
                placeholder="https://cdn.example.com/poster.jpg"
                aria-describedby="poster-url-help"
              />
            </div>
            <p id="poster-url-help" className="mt-2 text-xs text-grit-400">
              Direct link to your poster image
            </p>
            {errors?.posterImageUrl && (
              <div className="mt-2 flex items-start gap-2">
                <span className="text-resistance-500">⚠</span>
                <p className="text-sm text-resistance-400">{errors.posterImageUrl}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
