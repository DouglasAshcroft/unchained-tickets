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
    <div className="space-y-8">
      {/* Step Description */}
      <div className="mb-6">
        <p className="text-gray-600">
          Enter the basic information about your event including title, artist, and poster.
        </p>
      </div>

      {/* Event Details Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">Event Details</h3>

        {/* Event Title */}
        <div>
          <label htmlFor="event-title" className="mb-1 block text-sm font-medium text-gray-700">
            Event Title *
          </label>
          <input
            id="event-title"
            type="text"
            value={formData.title}
            onChange={(e) => onFieldChange('title', e.target.value)}
            className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 ${
              errors?.title
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
            placeholder="Enter event title"
            aria-describedby={errors?.title ? 'title-error' : undefined}
          />
          {errors?.title && (
            <p id="title-error" className="mt-1 text-sm text-red-600">
              {errors.title}
            </p>
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
            placeholder="Search by artist name..."
          />
        </div>

        {/* External Event Link */}
        <div>
          <label htmlFor="external-link" className="mb-1 block text-sm font-medium text-gray-700">
            External Event Link
          </label>
          <input
            id="external-link"
            type="url"
            value={formData.externalLink}
            onChange={(e) => onFieldChange('externalLink', e.target.value)}
            className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 ${
              errors?.externalLink
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
            placeholder="https://example.com/event"
            aria-describedby="external-link-help"
          />
          <p id="external-link-help" className="mt-1 text-xs text-gray-500">
            Optional link to external event page (e.g., Eventbrite, Ticketmaster)
          </p>
          {errors?.externalLink && (
            <p className="mt-1 text-sm text-red-600">{errors.externalLink}</p>
          )}
        </div>
      </div>

      {/* Poster Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">Poster</h3>

        {/* Poster File Upload */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Poster Image File
          </label>

          <div className="space-y-4">
            {/* File Input */}
            <div>
              <label
                htmlFor="poster-file-upload"
                className="inline-flex cursor-pointer items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Upload Poster File
              </label>
              <input
                id="poster-file-upload"
                type="file"
                accept="image/*"
                onChange={onPosterFileChange}
                className="sr-only"
              />
            </div>

            {/* File Preview */}
            {posterPreview && (
              <div className="relative inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={posterPreview}
                  alt="Poster preview"
                  className="h-48 w-auto rounded-md border border-gray-300 object-contain"
                />
                <button
                  type="button"
                  onClick={onClearPoster}
                  className="absolute right-2 top-2 rounded-full bg-red-500 px-3 py-1 text-sm font-medium text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Clear
                </button>
              </div>
            )}

            {/* File Name Display */}
            {posterFile && (
              <p className="text-sm text-gray-600">
                Selected file: <span className="font-medium">{posterFile.name}</span>
              </p>
            )}
          </div>
        </div>

        {/* Poster URL */}
        <div>
          <label htmlFor="poster-url" className="mb-1 block text-sm font-medium text-gray-700">
            Poster Image URL
          </label>
          <input
            id="poster-url"
            type="url"
            value={formData.posterImageUrl}
            onChange={(e) => onFieldChange('posterImageUrl', e.target.value)}
            className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 ${
              errors?.posterImageUrl
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
            placeholder="https://example.com/poster.jpg"
            aria-describedby="poster-url-help"
          />
          <p id="poster-url-help" className="mt-1 text-xs text-gray-500">
            Enter a direct URL to a poster image (alternative to file upload)
          </p>
          {errors?.posterImageUrl && (
            <p className="mt-1 text-sm text-red-600">{errors.posterImageUrl}</p>
          )}
        </div>
      </div>
    </div>
  );
}
