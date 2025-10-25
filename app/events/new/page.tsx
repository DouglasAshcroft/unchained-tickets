"use client";
import { useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api/client";
import { POSTER_STYLES } from "@/lib/services/PosterGenerationService";

// Custom hooks
import { useEventFormState } from './hooks/useEventFormState';
import { useEventValidation } from './hooks/useEventValidation';
import { useWizardNavigation } from './hooks/useWizardNavigation';
import { usePosterFile } from './hooks/usePosterFile';

// Step components
import { BasicsStep } from './components/steps/BasicsStep';
import { ScheduleStep } from './components/steps/ScheduleStep';
import { TicketsStep } from './components/steps/TicketsStep';
import { PostersStep } from './components/steps/PostersStep';
import { ReviewStep } from './components/steps/ReviewStep';

// Types
import { WIZARD_STEPS } from './types';
import type {
  VenueOption,
  ArtistOption,
} from './types';

// Page-specific utility functions
const buildMapsLink = (venue: VenueOption) => {
  if (venue.mapsLink) {
    return venue.mapsLink;
  }

  if (venue.latitude != null && venue.longitude != null) {
    return `https://www.google.com/maps/search/?api=1&query=${venue.latitude},${venue.longitude}`;
  }

  const parts = [venue.addressLine1, venue.city, venue.state, venue.postalCode]
    .filter(Boolean)
    .join(", ");

  if (parts.length === 0) {
    return "";
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    parts
  )}`;
};

export default function NewEventPage() {
  const router = useRouter();
  const steps = WIZARD_STEPS; // Wizard step definitions

  // Custom hooks for state management
  const {
    formData,
    updateField,
    addTicketType,
    updateTicketField,
    removeTicketType,
    addPerkToTicket,
    updatePerkField,
    removePerkFromTicket,
    addPosterVariant,
  } = useEventFormState();

  const validation = useEventValidation(formData);
  const { errors, validateStep, clearErrors } = validation;

  const {
    currentStepIndex,
    currentStep,
    handleNext: wizardHandleNext,
    handleBack,
    goToStep,
  } = useWizardNavigation(validation);

  const {
    file: posterFile,
    previewUrl: posterPreview,
    selectFile,
    clearFile: clearPosterFile,
  } = usePosterFile();

  // Page-specific state (search UI, suggestions)
  const [selectedVenue, setSelectedVenue] = useState<VenueOption | null>(null);
  const [selectedArtist, setSelectedArtist] = useState<ArtistOption | null>(null);

  // Poster workflow state
  const [selectedPosterStyle, setSelectedPosterStyle] = useState<string>("");
  const [isGeneratingPosters, setIsGeneratingPosters] = useState(false);

  const {
    data: venues = [],
  } = useQuery({
    queryKey: ["venues"],
    queryFn: () => api.getVenues(),
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: artists = [],
  } = useQuery({
    queryKey: ["artists"],
    queryFn: () => api.getArtists(),
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!venues.length || !formData.venueId) return;
    if (selectedVenue && String(selectedVenue.id) === formData.venueId) return;

    const match = (venues as VenueOption[]).find(
      (venue) => String(venue.id) === formData.venueId
    );

    if (!match) return;

    setSelectedVenue(match);
    const derivedLink = buildMapsLink(match);
    updateField('venueId', String(match.id));
    updateField('mapsLink', derivedLink || formData.mapsLink);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venues, formData.venueId, selectedVenue]);

  useEffect(() => {
    if (!formData.primaryArtistId) {
      setSelectedArtist(null);
      return;
    }

    if (!artists.length) return;

    const match = (artists as ArtistOption[]).find(
      (artist) => String(artist.id) === formData.primaryArtistId
    );

    if (!match) return;

    setSelectedArtist(match);
  }, [artists, formData.primaryArtistId]);

  const createEvent = useMutation({
    mutationFn: async () => {
      const venueId = parseInt(formData.venueId, 10);

      const ticketTypesPayload = formData.ticketTypes.map((ticket) => {
        const trimmedPrice = ticket.price.trim();
        let priceCents: number | null = null;
        if (trimmedPrice) {
          priceCents = Math.round(parseFloat(trimmedPrice) * 100);
        }

        const trimmedCapacity = ticket.capacity.trim();
        let capacity: number | null = null;
        if (trimmedCapacity) {
          capacity = parseInt(trimmedCapacity, 10);
        }

        const perksPayload = ticket.perks
          .filter((perk) => perk.name.trim().length > 0)
          .map((perk) => {
            const trimmedQuantity = perk.quantity.trim();
            const parsedQuantity = parseInt(trimmedQuantity || "1", 10);
            const quantity = Number.isNaN(parsedQuantity)
              ? 1
              : Math.max(parsedQuantity, 1);

            return {
              name: perk.name.trim(),
              description: perk.description.trim() || null,
              instructions: perk.instructions.trim() || null,
              quantity,
            };
          });

        return {
          name: ticket.name.trim(),
          description: ticket.description.trim() || null,
          pricingType: ticket.pricingType,
          priceCents,
          currency: ticket.currency.trim().toUpperCase(),
          capacity,
          salesStart: ticket.salesStart
            ? new Date(ticket.salesStart).toISOString()
            : null,
          salesEnd: ticket.salesEnd
            ? new Date(ticket.salesEnd).toISOString()
            : null,
          isActive: ticket.isActive,
          perks: perksPayload,
        };
      });

      const parsedArtistId = formData.primaryArtistId
        ? Number.parseInt(formData.primaryArtistId, 10)
        : NaN;

      const payload = {
        title: formData.title.trim(),
        startsAt: new Date(formData.startsAt).toISOString(),
        endsAt: formData.endsAt
          ? new Date(formData.endsAt).toISOString()
          : null,
        venueId,
        primaryArtistId: Number.isNaN(parsedArtistId) ? null : parsedArtistId,
        posterImageUrl: posterPreview || formData.posterImageUrl || null,
        externalLink: formData.externalLink || null,
        mapsLink: formData.mapsLink || null,
        status: formData.status,
        ticketTypes: ticketTypesPayload,
      };

      return api.createEvent(payload);
    },
    onSuccess: async (event) => {
      // Only register on blockchain if status is 'published'
      if (formData.status === 'draft') {
        toast.success("Event saved as draft!");
        router.push(`/events/${event.id}`);
        return;
      }

      toast.success("Event created! Registering on blockchain...");

      try {
        // Register event on blockchain
        const eventResult = await api.registerEventOnChain(event.id);

        if (!eventResult.success) {
          console.error('Failed to register event on blockchain:', eventResult.error);
          toast.error(`Blockchain registration failed. Event saved as draft.`);
          // Auto-revert to draft status on blockchain failure
          await api.updateEvent(event.id, { status: 'draft' });
          router.push(`/events/${event.id}`);
          return;
        }

        toast.success(`Event registered on blockchain (ID: ${eventResult.onChainEventId})`);

        // Register ticket tiers on blockchain
        const tiersResult = await api.registerTiersOnChain(event.id);

        const failedTiers = tiersResult.filter(t => !t.success);
        if (failedTiers.length > 0) {
          console.error('Some tiers failed to register:', failedTiers);
          toast.error(`${failedTiers.length} tier(s) failed to register on blockchain`);
        } else {
          toast.success(`All ${tiersResult.length} tiers registered on blockchain`);
        }

        router.push(`/events/${event.id}`);
      } catch (error) {
        console.error('Blockchain registration error:', error);
        toast.error('Blockchain registration failed. Event saved as draft.');
        // Auto-revert to draft status on error
        try {
          await api.updateEvent(event.id, { status: 'draft' });
        } catch (updateError) {
          console.error('Failed to revert status:', updateError);
        }
        router.push(`/events/${event.id}`);
      }
    },
    onError: (error: any) => {
      const message =
        error?.data?.error || error?.message || "Failed to create event";
      toast.error(message);
    },
  });

  // Poster file handling now done by usePosterFile hook
  const handlePosterFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await selectFile(file);
    }
  };

  // Handlers for used in step components
  const handleRemoveTicketType = (ticketId: string) => {
    const warning = removeTicketType(ticketId);
    if (warning) {
      toast.error(warning);
    }
  };

  // Navigation aliases (from useWizardNavigation hook)
  const handleNext = wizardHandleNext;

  // Poster drag and drop handler (used in BasicsStep)
  const handlePosterDrop = async (e: React.DragEvent) => {
    e.preventDefault();

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      await selectFile(droppedFile);
    }
  };

  const handleVenueSelect = (venue: VenueOption) => {
    setSelectedVenue(venue);

    const derivedLink = buildMapsLink(venue);

    updateField('venueId', String(venue.id));
    updateField('mapsLink', derivedLink || formData.mapsLink);
    clearErrors();
  };

  const handleArtistSelect = (artist: ArtistOption) => {
    setSelectedArtist(artist);
    updateField('primaryArtistId', String(artist.id));
    clearErrors();
  };

  // Navigation functions provided by useWizardNavigation hook
  // validateStep, handleNext, handleBack, goToStep are all from the hook

  const handleSubmit = async () => {
    const validation = validateStep("review");
    if (Object.keys(validation).length > 0) {
      return;
    }

    if (createEvent.isPending) {
      return;
    }

    await createEvent.mutateAsync();
  };

  // Helper function for poster generation
  const getRarityMultiplier = (ticketTypeName: string): number => {
    const name = ticketTypeName.toLowerCase();
    if (name.includes("vip") || name.includes("premium")) return 0.5; // rarer
    if (name.includes("general") || name.includes("standard")) return 1.0; // standard
    if (name.includes("early") || name.includes("presale")) return 0.8; // slightly rarer
    return 1.0; // default
  };

  const renderStepContent = () => {
    switch (currentStep.id) {
      case "basics":
        return (
          <BasicsStep
            formData={{
              title: formData.title,
              posterImageUrl: formData.posterImageUrl,
              externalLink: formData.externalLink,
              primaryArtistId: formData.primaryArtistId,
            }}
            errors={errors as Record<string, string>}
            artists={artists}
            selectedArtist={selectedArtist as any}
            posterFile={posterFile}
            posterPreview={posterPreview}
            handlers={{
              onFieldChange: (field: string, value: string) => updateField(field as any, value as any),
              onArtistSelect: handleArtistSelect,
              onPosterFileChange: handlePosterFileChange,
              onPosterDrop: handlePosterDrop,
              onClearPoster: clearPosterFile,
            }}
          />
        );
      case "schedule":
        return (
          <ScheduleStep
            formData={{
              startsAt: formData.startsAt,
              endsAt: formData.endsAt,
              doorsOpen: '', // Not currently implemented in FormState
              venueId: formData.venueId,
              mapsLink: formData.mapsLink,
            }}
            errors={errors as Record<string, string>}
            venues={venues}
            selectedVenue={selectedVenue as any}
            handlers={{
              onFieldChange: (field: string, value: string) => updateField(field as any, value as any),
              onVenueSelect: handleVenueSelect,
            }}
          />
        );
      case "tickets":
        return (
          <TicketsStep
            ticketTypes={formData.ticketTypes}
            errors={errors as Record<string, string>}
            selectedVenue={selectedVenue as any}
            handlers={{
              onAddTicket: addTicketType,
              onRemoveTicket: handleRemoveTicketType,
              onUpdateTicket: updateTicketField as any,
              onAddPerk: addPerkToTicket,
              onUpdatePerk: updatePerkField as any,
              onRemovePerk: removePerkFromTicket,
            }}
          />
        );
      case "posters":
        return (
          <PostersStep
            selectedStyle={selectedPosterStyle}
            styles={Object.entries(POSTER_STYLES).map(([id, style]) => ({ id, ...style }))}
            posterPreview={posterPreview}
            isGenerating={isGeneratingPosters}
            handlers={{
              onStyleSelect: setSelectedPosterStyle,
              onGeneratePoster: async () => {
                // Poster generation logic inline for now
                if (!formData.ticketTypes.length) {
                  toast.error("Add ticket types before generating posters");
                  return;
                }
                if (!selectedPosterStyle) {
                  toast.error("Select a poster style first");
                  return;
                }

                setIsGeneratingPosters(true);
                try {
                  const newVariants = formData.ticketTypes.map((ticket) => {
                    const rarityMultiplier = getRarityMultiplier(ticket.name);
                    return {
                      ticketTypeId: ticket.id,
                      ticketTypeName: ticket.name,
                      imageUrl: `/assets/posters/placeholder-${selectedPosterStyle}.svg`,
                      isApproved: false,
                      rarityMultiplier,
                    };
                  });
                  newVariants.forEach(variant => addPosterVariant(variant));
                  toast.success(`Generated ${newVariants.length} poster variants`);
                } catch (error) {
                  console.error("Failed to generate posters:", error);
                  toast.error("Failed to generate posters");
                } finally {
                  setIsGeneratingPosters(false);
                }
              },
              onSkip: () => goToStep(currentStepIndex + 1),
            }}
          />
        );
      case "review":
        return (
          <ReviewStep
            formData={formData as any}
            selectedArtist={selectedArtist as any}
            selectedVenue={selectedVenue as any}
            handlers={{
              onStatusChange: (status) => updateField('status', status),
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-ink-900 via-ink-900/95 to-ink-900">
      <main className="flex-1 w-full">
        <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h1 className="brand-heading text-4xl font-bold bg-gradient-to-r from-resistance-500 via-hack-green to-acid-400 bg-clip-text text-transparent">
              Create a new event
            </h1>
            <p className="mt-2 text-grit-300 max-w-2xl">
              {
                "Launch in minutes. We'll capture the essentials now so you can ship quickly, then expand into ticket tiers, collectibles, and marketing flows as the onboarding epic unfolds."
              }
            </p>
          </div>

          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {steps.map((step, index) => {
              const isActive = index === currentStepIndex;
              const isComplete = index < currentStepIndex;
              return (
                <Card
                  key={step.id}
                  accentLeft={isActive}
                  className={`transition-colors ${
                    isActive
                      ? "border-acid-400/60 bg-acid-400/10"
                      : isComplete
                      ? "border-success-500/60 bg-success-500/10 text-success-200"
                      : "border-grit-500/30 bg-ink-900/60"
                  }`}
                >
                  <div className="text-sm font-semibold uppercase tracking-widest">
                    Step {index + 1}
                  </div>
                  <div className="text-lg font-semibold text-bone-100 mt-1">
                    {step.title}
                  </div>
                  <p className="mt-2 text-sm text-grit-300">
                    {step.description}
                  </p>
                </Card>
              );
            })}
          </div>

          <Card className="bg-ink-900/80 border-grit-500/40">
            <div className="space-y-8">
              {renderStepContent()}

              <div className="flex flex-col gap-3 border-t border-grit-500/30 pt-6 sm:flex-row sm:justify-between sm:items-center">
                <div className="text-sm text-grit-400">
                  Step {currentStepIndex + 1} of {steps.length}
                </div>
                <div className="flex gap-3 sm:justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleBack}
                    disabled={currentStepIndex === 0 || createEvent.isPending}
                  >
                    Back
                  </Button>
                  {currentStep.id !== "review" ? (
                    <Button
                      type="button"
                      onClick={handleNext}
                      disabled={createEvent.isPending}
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={handleSubmit}
                      disabled={createEvent.isPending}
                    >
                      {createEvent.isPending ? "Creating…" : "Create event"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
