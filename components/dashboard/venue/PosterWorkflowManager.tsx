'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import PosterRefinementDialog from './PosterRefinementDialog';

interface PosterStyle {
  id: string;
  name: string;
  description: string;
}

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
  createdAt: string;
}

interface TicketType {
  id: number;
  name: string;
  priceCents: number | null;
}

interface Event {
  id: number;
  title: string;
  ticketTypes: TicketType[];
}

interface PosterWorkflowManagerProps {
  eventId: number;
  venueId: number;
  event?: Event;
}

export default function PosterWorkflowManager({
  eventId,
  venueId,
  event,
}: PosterWorkflowManagerProps) {
  const [step, setStep] = useState<'choose' | 'generate' | 'upload' | 'review'>('choose');
  const [styles, setStyles] = useState<PosterStyle[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [variants, setVariants] = useState<PosterVariant[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTiers, setSelectedTiers] = useState<number[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [refiningVariant, setRefiningVariant] = useState<PosterVariant | null>(null);

  // Load available styles
  useEffect(() => {
    async function loadStyles() {
      try {
        const response = await fetch('/api/posters/generate');
        const data = await response.json();
        setStyles(data.styles || []);
        if (data.styles?.length > 0) {
          setSelectedStyle(data.styles[0].id);
        }
      } catch (error) {
        console.error('Failed to load poster styles:', error);
        toast.error('Failed to load poster styles');
      }
    }
    loadStyles();
  }, []);

  // Load existing variants
  useEffect(() => {
    loadVariants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  // Select all tiers by default
  useEffect(() => {
    if (event?.ticketTypes && selectedTiers.length === 0) {
      setSelectedTiers(event.ticketTypes.map(t => t.id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event]);

  async function loadVariants() {
    try {
      setLoading(true);
      const response = await fetch(`/api/posters/variants?eventId=${eventId}`);
      const data = await response.json();
      setVariants(data.variants || []);
    } catch (error) {
      console.error('Failed to load variants:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleGeneratePosters() {
    if (!selectedStyle || selectedTiers.length === 0) {
      toast.error('Please select a style and at least one ticket tier');
      return;
    }

    try {
      setGenerating(true);
      const response = await fetch('/api/posters/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          venueId,
          ticketTypeIds: selectedTiers,
          style: selectedStyle,
          customPrompt: customPrompt.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate posters');
      }

      toast.success(`Generated ${data.variants?.length || 0} poster variants!`);
      await loadVariants();
      setStep('review');
    } catch (error) {
      console.error('Generation error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate posters');
    } finally {
      setGenerating(false);
    }
  }

  async function handleApproveVariant(variantId: number) {
    try {
      const response = await fetch('/api/posters/variants', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variantId,
          action: 'approve',
          eventId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to approve poster');
      }

      toast.success('Poster approved!');
      await loadVariants();
    } catch (error) {
      console.error('Approve error:', error);
      toast.error('Failed to approve poster');
    }
  }

  async function handleRejectVariant(variantId: number) {
    if (!confirm('Are you sure you want to delete this poster variant?')) {
      return;
    }

    try {
      const response = await fetch('/api/posters/variants', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variantId,
          action: 'reject',
          eventId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to reject poster');
      }

      toast.success('Poster variant deleted');
      await loadVariants();
    } catch (error) {
      console.error('Reject error:', error);
      toast.error('Failed to delete poster');
    }
  }

  async function handleUploadImage(file: File, ticketTypeId: number | null) {
    try {
      setUploadingImage(true);

      // Convert to data URI
      const reader = new FileReader();
      const dataUri = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const tierName = ticketTypeId
        ? event?.ticketTypes.find(t => t.id === ticketTypeId)?.name
        : 'All Tiers';

      const response = await fetch('/api/posters/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          venueId,
          ticketTypeId,
          variantName: `${tierName} - Custom Upload`,
          imageDataUri: dataUri,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload poster');
      }

      toast.success('Poster uploaded successfully!');
      await loadVariants();
      setStep('review');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload poster');
    } finally {
      setUploadingImage(false);
    }
  }

  const approvedCount = variants.filter(v => v.isApproved).length;
  const totalTiers = event?.ticketTypes?.length || 0;
  const allTiersHavePosters = totalTiers > 0 && approvedCount >= totalTiers;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Collectible Poster Workflow</h2>
          <p className="text-gray-400 mt-1">
            Create exclusive collectible posters for ticket holders who attend your event
          </p>
        </div>
        {allTiersHavePosters && (
          <div className="flex items-center gap-2 bg-green-500/10 text-green-400 px-4 py-2 rounded-lg">
            <span className="text-xl">✓</span>
            <span className="font-medium">All tiers have approved posters</span>
          </div>
        )}
      </div>

      {/* Progress indicator */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Progress:</span>
          <span className="text-white font-medium">
            {approvedCount} / {totalTiers} tiers with approved posters
          </span>
        </div>
        <div className="mt-2 bg-gray-700 rounded-full h-2 overflow-hidden">
          <div
            className="bg-indigo-500 h-full transition-all duration-500"
            style={{ width: `${totalTiers > 0 ? (approvedCount / totalTiers) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Step 1: Choose method */}
      {step === 'choose' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setStep('generate')}
            className="bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white p-6 rounded-xl text-left transition-all transform hover:scale-105"
          >
            <div className="text-3xl mb-3">🎨</div>
            <h3 className="text-xl font-bold mb-2">AI Generate Posters</h3>
            <p className="text-indigo-100 text-sm">
              Create unique concert posters using AI with pre-configured styles. Fast and easy!
            </p>
            <div className="mt-4 text-xs text-indigo-200">
              Recommended • ~30 seconds per tier
            </div>
          </button>

          <button
            onClick={() => setStep('upload')}
            className="bg-gradient-to-br from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white p-6 rounded-xl text-left transition-all transform hover:scale-105"
          >
            <div className="text-3xl mb-3">📤</div>
            <h3 className="text-xl font-bold mb-2">Upload Custom Images</h3>
            <p className="text-gray-300 text-sm">
              Already have poster artwork? Upload your own custom images for each tier.
            </p>
            <div className="mt-4 text-xs text-gray-400">
              Advanced • Full control
            </div>
          </button>
        </div>
      )}

      {/* Step 2A: AI Generation */}
      {step === 'generate' && (
        <div className="bg-gray-800/50 rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">AI Poster Generation</h3>
            <button
              onClick={() => setStep('choose')}
              className="text-gray-400 hover:text-white"
            >
              ← Back
            </button>
          </div>

          {/* Event info */}
          <div className="bg-gray-700/50 rounded-lg p-4">
            <p className="text-sm text-gray-400">Generating posters for:</p>
            <p className="text-white font-medium mt-1">{event?.title || 'Event'}</p>
          </div>

          {/* Tier selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Select Ticket Tiers
            </label>
            <div className="space-y-2">
              {event?.ticketTypes.map(tier => (
                <label key={tier.id} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedTiers.includes(tier.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTiers([...selectedTiers, tier.id]);
                      } else {
                        setSelectedTiers(selectedTiers.filter(id => id !== tier.id));
                      }
                    }}
                    className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-gray-800"
                  />
                  <span className="text-white">{tier.name}</span>
                  {tier.priceCents && (
                    <span className="text-sm text-gray-400">
                      (${(tier.priceCents / 100).toFixed(2)})
                    </span>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Style picker */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Choose Poster Style
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {styles.map(style => (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    selectedStyle === style.id
                      ? 'border-indigo-500 bg-indigo-500/10'
                      : 'border-gray-700 bg-gray-700/30 hover:border-gray-600'
                  }`}
                >
                  <div className="font-medium text-white mb-1">{style.name}</div>
                  <div className="text-xs text-gray-400">{style.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom prompt */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Custom Prompt (Optional)
            </label>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Add specific details you want in the poster (e.g., 'include guitars', 'sunset colors', 'city skyline')"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              rows={3}
            />
            <p className="text-xs text-gray-400 mt-1">
              The AI will combine your prompt with the selected style and event details
            </p>
          </div>

          {/* Generate button */}
          <button
            onClick={handleGeneratePosters}
            disabled={generating || selectedTiers.length === 0}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            {generating ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⚙️</span>
                Generating Posters...
              </span>
            ) : (
              `Generate ${selectedTiers.length} Poster${selectedTiers.length !== 1 ? 's' : ''}`
            )}
          </button>

          {generating && (
            <div className="text-center text-sm text-gray-400">
              This may take 10-30 seconds per poster. Please wait...
            </div>
          )}
        </div>
      )}

      {/* Step 2B: Upload */}
      {step === 'upload' && (
        <div className="bg-gray-800/50 rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">Upload Custom Posters</h3>
            <button
              onClick={() => setStep('choose')}
              className="text-gray-400 hover:text-white"
            >
              ← Back
            </button>
          </div>

          <div className="space-y-4">
            {event?.ticketTypes.map(tier => (
              <div key={tier.id} className="bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-white">{tier.name}</h4>
                    <p className="text-xs text-gray-400">
                      Recommended: 1024x1024px or larger, PNG/JPG
                    </p>
                  </div>
                </div>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleUploadImage(file, tier.id);
                    }
                  }}
                  disabled={uploadingImage}
                  className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 file:cursor-pointer cursor-pointer"
                />
              </div>
            ))}
          </div>

          {uploadingImage && (
            <div className="text-center text-sm text-gray-400">
              Uploading poster...
            </div>
          )}
        </div>
      )}

      {/* Step 3: Review & Approve */}
      {step === 'review' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">Review & Approve Posters</h3>
            <button
              onClick={() => setStep('choose')}
              className="text-sm text-indigo-400 hover:text-indigo-300"
            >
              + Generate More
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading variants...</div>
          ) : variants.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 mb-4">No poster variants yet</p>
              <button
                onClick={() => setStep('choose')}
                className="text-indigo-400 hover:text-indigo-300"
              >
                Create your first posters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {variants.map(variant => (
                <div
                  key={variant.id}
                  className={`bg-gray-800 rounded-xl overflow-hidden border-2 transition-all ${
                    variant.isApproved
                      ? 'border-green-500'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  {/* Poster image */}
                  <div className="aspect-square bg-gray-900 relative">
                    <Image
                      src={variant.imageUrl}
                      alt={variant.variantName}
                      fill
                      className="object-cover"
                      unoptimized={variant.imageUrl.startsWith('data:')}
                    />
                    {variant.isApproved && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        ✓ Approved
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="p-4">
                    <h4 className="font-medium text-white mb-1">
                      {variant.variantName}
                    </h4>
                    <div className="flex items-center justify-between text-sm mb-3">
                      <span className="text-gray-400">
                        {variant.ticketType?.name || 'All Tiers'}
                      </span>
                      <span className="text-indigo-400 font-medium">
                        {variant.rarityMultiplier}x rarity
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="space-y-2">
                      {/* Primary actions */}
                      <div className="flex gap-2">
                        {!variant.isApproved ? (
                          <>
                            <button
                              onClick={() => handleApproveVariant(variant.id)}
                              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectVariant(variant.id)}
                              className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                            >
                              Delete
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleRejectVariant(variant.id)}
                            className="w-full bg-red-600/20 hover:bg-red-600/30 text-red-400 py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                          >
                            Remove Approval
                          </button>
                        )}
                      </div>

                      {/* Refine button */}
                      <button
                        onClick={() => setRefiningVariant(variant)}
                        className="w-full bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <span>✨</span>
                        Refine This Poster
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Always show review button if variants exist */}
      {step !== 'review' && variants.length > 0 && (
        <button
          onClick={() => setStep('review')}
          className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded-lg transition-colors"
        >
          View All Variants ({variants.length})
        </button>
      )}

      {/* Refinement Dialog */}
      <PosterRefinementDialog
        isOpen={refiningVariant !== null}
        onClose={() => setRefiningVariant(null)}
        variant={refiningVariant}
        onRefinementComplete={async (_newVariant) => {
          // Reload variants to show the new refined version
          await loadVariants();
          toast.success('New refined variant added to your posters!');
        }}
      />
    </div>
  );
}
