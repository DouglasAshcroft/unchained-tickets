'use client';

import { useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';

interface PosterVariant {
  id: number;
  variantName: string;
  imageUrl: string;
  rarityMultiplier: number;
  isApproved: boolean;
  ticketType: {
    id: number;
    name: string;
  } | null;
  generationPrompt?: string;
}

interface PosterRefinementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  variant: PosterVariant | null;
  onRefinementComplete: (newVariant: any) => void;
}

const REFINEMENT_SUGGESTIONS = [
  'Make it darker and more moody',
  'Add more vibrant colors',
  'Include electric guitars in the foreground',
  'Change to warmer tones, sunset vibes',
  'Add stage lighting effects',
  'Make it more minimalist and clean',
  'Increase the psychedelic elements',
  'Add city skyline in the background',
];

export default function PosterRefinementDialog({
  isOpen,
  onClose,
  variant,
  onRefinementComplete,
}: PosterRefinementDialogProps) {
  const [refinementInstructions, setRefinementInstructions] = useState('');
  const [strength, setStrength] = useState<number | undefined>(undefined);
  const [model, setModel] = useState<'ultra' | 'core'>('core');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  if (!isOpen || !variant) return null;

  const handleRefine = async () => {
    if (!refinementInstructions.trim()) {
      toast.error('Please provide refinement instructions');
      return;
    }

    try {
      setIsGenerating(true);

      const response = await fetch('/api/posters/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variantId: variant.id,
          refinementInstructions: refinementInstructions.trim(),
          strength: showAdvanced ? strength : undefined,
          model,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to refine poster');
      }

      toast.success('Poster refined successfully!');
      onRefinementComplete(data.variant);

      // Reset form
      setRefinementInstructions('');
      setStrength(undefined);
      setShowAdvanced(false);
      onClose();
    } catch (error) {
      console.error('Refinement error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to refine poster');
    } finally {
      setIsGenerating(false);
    }
  };

  const insertSuggestion = (suggestion: string) => {
    setRefinementInstructions(prev =>
      prev ? `${prev}, ${suggestion.toLowerCase()}` : suggestion
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Refine Poster</h2>
            <p className="text-sm text-gray-400 mt-1">
              {variant.ticketType?.name || 'All Tiers'} - {variant.variantName}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="text-gray-400 hover:text-white text-2xl disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Original poster preview */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Original Poster
            </label>
            <div className="relative w-64 h-64 mx-auto bg-gray-800 rounded-lg overflow-hidden">
              <Image
                src={variant.imageUrl}
                alt={variant.variantName}
                fill
                className="object-cover"
                unoptimized={variant.imageUrl.startsWith('data:')}
              />
            </div>
          </div>

          {/* Refinement instructions */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              What would you like to change?
            </label>
            <textarea
              value={refinementInstructions}
              onChange={(e) => setRefinementInstructions(e.target.value)}
              placeholder="Describe what you'd like to change in plain English (e.g., 'make it darker and add more purple', 'include guitars in the foreground')"
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 min-h-[120px]"
              disabled={isGenerating}
            />
            <p className="text-xs text-gray-400 mt-2">
              Be specific! The AI will combine your instructions with the original prompt to create a refined version.
            </p>
          </div>

          {/* Quick suggestions */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Quick Suggestions
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {REFINEMENT_SUGGESTIONS.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => insertSuggestion(suggestion)}
                  disabled={isGenerating}
                  className="text-xs text-left bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Model selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Model Quality
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setModel('core')}
                disabled={isGenerating}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  model === 'core'
                    ? 'border-indigo-500 bg-indigo-500/10'
                    : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="font-medium text-white">Core (Recommended)</div>
                <div className="text-xs text-gray-400 mt-1">
                  Balanced quality • ~10 seconds • $0.03
                </div>
              </button>
              <button
                onClick={() => setModel('ultra')}
                disabled={isGenerating}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  model === 'ultra'
                    ? 'border-indigo-500 bg-indigo-500/10'
                    : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="font-medium text-white">Ultra</div>
                <div className="text-xs text-gray-400 mt-1">
                  Highest quality • ~30 seconds • $0.04
                </div>
              </button>
            </div>
          </div>

          {/* Advanced controls */}
          <div>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              {showAdvanced ? '▼' : '▶'} Advanced Options
            </button>

            {showAdvanced && (
              <div className="mt-4 bg-gray-800/50 rounded-lg p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Refinement Strength: {strength !== undefined ? strength.toFixed(2) : 'Auto'}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={strength !== undefined ? strength : 0.5}
                    onChange={(e) => setStrength(parseFloat(e.target.value))}
                    disabled={isGenerating}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0.0 - Subtle tweaks</span>
                    <span>0.5 - Balanced</span>
                    <span>1.0 - Major changes</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Leave at "Auto" to let the AI calculate the best strength based on your instructions.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-900 border-t border-gray-700 px-6 py-4 flex items-center justify-between">
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleRefine}
            disabled={isGenerating || !refinementInstructions.trim()}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
          >
            {isGenerating ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⚙️</span>
                Generating...
              </span>
            ) : (
              'Generate Refined Version'
            )}
          </button>
        </div>

        {/* Loading overlay */}
        {isGenerating && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-2xl">
            <div className="bg-gray-800 border border-gray-600 rounded-xl p-6 text-center">
              <div className="animate-spin text-4xl mb-3">⚙️</div>
              <p className="text-white font-medium">Generating refined poster...</p>
              <p className="text-sm text-gray-400 mt-2">
                This may take 10-30 seconds depending on the model selected.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
