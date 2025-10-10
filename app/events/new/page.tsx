"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import type { ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { format, addHours } from "date-fns";
import Fuse from "fuse.js";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { api } from "@/lib/api/client";

type WizardStep = "basics" | "schedule" | "review";

interface StepDefinition {
  id: WizardStep;
  title: string;
  description: string;
}

const steps: StepDefinition[] = [
  {
    id: "basics",
    title: "Basics",
    description: "Name your event and add optional branding links.",
  },
  {
    id: "schedule",
    title: "Schedule & Venue",
    description: "Set the timeline and choose where the event happens.",
  },
  {
    id: "review",
    title: "Review & Publish",
    description:
      "Double-check details and decide whether to publish now or later.",
  },
];

type FormState = {
  title: string;
  posterImageUrl: string;
  externalLink: string;
  mapsLink: string;
  startsAt: string;
  endsAt: string;
  venueId: string;
  status: "draft" | "published";
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const initialState: FormState = {
  title: "",
  posterImageUrl: "",
  externalLink: "",
  mapsLink: "",
  startsAt: "",
  endsAt: "",
  venueId: "",
  status: "draft",
};

type VenueOption = {
  id: number;
  name: string;
  city?: string | null;
  state?: string | null;
  addressLine1?: string | null;
  postalCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  mapsLink?: string | null;
};

const isValidUrl = (value: string) => {
  try {
    // Allow internal anchors/placeholders later, but require absolute URL for now
    new URL(value);
    return true;
  } catch (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _error
  ) {
    return false;
  }
};

const formatDateForInput = (date: Date) => format(date, "yyyy-MM-dd'T'HH:mm");

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
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const [venueQuery, setVenueQuery] = useState("");
  const [selectedVenue, setSelectedVenue] = useState<VenueOption | null>(null);
  const [showVenueSuggestions, setShowVenueSuggestions] = useState(false);
  const venueInputRef = useRef<HTMLInputElement>(null);
  const suggestionBoxRef = useRef<HTMLDivElement>(null);
  const posterInputRef = useRef<HTMLInputElement>(null);
  const [mapsLocked, setMapsLocked] = useState(false);

  const currentStep = steps[currentStepIndex];

  const {
    data: venues = [],
    isLoading: isLoadingVenues,
    isError: isVenuesError,
  } = useQuery({
    queryKey: ["venues"],
    queryFn: () => api.getVenues(),
    staleTime: 5 * 60 * 1000,
  });

  const fuse = useMemo(() => {
    if (!venues.length) return null;
    return new Fuse<VenueOption>(venues as VenueOption[], {
      keys: ["name", "city", "state", "addressLine1"],
      threshold: 0.35,
      includeScore: true,
    });
  }, [venues]);

  const venueSuggestions = useMemo(() => {
    if (!venues.length) return [] as VenueOption[];
    const trimmedQuery = venueQuery.trim();
    if (!trimmedQuery) {
      return (venues as VenueOption[]).slice(0, 7);
    }
    if (!fuse) return [] as VenueOption[];
    return fuse
      .search(trimmedQuery)
      .slice(0, 7)
      .map((result) => result.item);
  }, [venues, venueQuery, fuse]);

  useEffect(() => {
    if (!venues.length || !formData.venueId) return;
    if (selectedVenue && String(selectedVenue.id) === formData.venueId) return;

    const match = (venues as VenueOption[]).find(
      (venue) => String(venue.id) === formData.venueId
    );

    if (!match) return;

    setSelectedVenue(match);
    setVenueQuery(match.name);
    const derivedLink = buildMapsLink(match);
    setFormData((prev) => ({
      ...prev,
      venueId: String(match.id),
      mapsLink: derivedLink || prev.mapsLink,
    }));
    setMapsLocked(true);
  }, [venues, formData.venueId, selectedVenue]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        suggestionBoxRef.current &&
        suggestionBoxRef.current.contains(target)
      ) {
        return;
      }
      if (
        venueInputRef.current &&
        (venueInputRef.current === target ||
          venueInputRef.current.contains(target))
      ) {
        return;
      }
      setShowVenueSuggestions(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const createEvent = useMutation({
    mutationFn: async () => {
      const venueId = parseInt(formData.venueId, 10);
      const payload = {
        title: formData.title.trim(),
        startsAt: new Date(formData.startsAt).toISOString(),
        endsAt: formData.endsAt
          ? new Date(formData.endsAt).toISOString()
          : null,
        venueId,
        posterImageUrl: posterPreview || formData.posterImageUrl || null,
        externalLink: formData.externalLink || null,
        mapsLink: formData.mapsLink || null,
        status: formData.status,
      };

      return api.createEvent(payload);
    },
    onSuccess: (event) => {
      toast.success("Event created! You can keep editing anytime.");
      router.push(`/events/${event.id}`);
    },
    onError: (error: any) => {
      const message =
        error?.data?.error || error?.message || "Failed to create event";
      toast.error(message);
    },
  });

  const handlePosterFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setPosterFile(null);
      setPosterPreview(null);
      setErrors((prev) => ({ ...prev, posterImageUrl: undefined }));
      return;
    }

    setPosterFile(file);
    setErrors((prev) => ({ ...prev, posterImageUrl: undefined }));

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setPosterPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const clearPosterFile = () => {
    setPosterFile(null);
    setPosterPreview(null);
    if (posterInputRef.current) {
      posterInputRef.current.value = "";
    }
    setErrors((prev) => ({ ...prev, posterImageUrl: undefined }));
  };

  const handleStartTimeChange = (value: string) => {
    setFormData((prev) => {
      const next = { ...prev, startsAt: value };
      if (!value) {
        return next;
      }

      const startDate = new Date(value);
      if (Number.isNaN(startDate.getTime())) {
        return next;
      }

      if (!prev.endsAt) {
        next.endsAt = formatDateForInput(addHours(startDate, 2));
        return next;
      }

      const endDate = new Date(prev.endsAt);
      if (Number.isNaN(endDate.getTime()) || endDate <= startDate) {
        next.endsAt = formatDateForInput(addHours(startDate, 2));
      }

      return next;
    });

    setErrors((prev) => ({ ...prev, startsAt: undefined, endsAt: undefined }));
  };

  const handleEndTimeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, endsAt: value }));
    setErrors((prev) => ({ ...prev, endsAt: undefined }));
  };

  const handleVenueInputChange = (value: string) => {
    if (selectedVenue && value === selectedVenue.name) {
      setVenueQuery(value);
      return;
    }

    setVenueQuery(value);
    setShowVenueSuggestions(true);

    if (selectedVenue) {
      setSelectedVenue(null);
      setMapsLocked(false);
      setFormData((prev) => ({ ...prev, venueId: "", mapsLink: "" }));
    }
  };

  const handleVenueSelect = (venue: VenueOption) => {
    setSelectedVenue(venue);
    setVenueQuery(venue.name);
    setShowVenueSuggestions(false);

    const derivedLink = buildMapsLink(venue);

    setFormData((prev) => ({
      ...prev,
      venueId: String(venue.id),
      mapsLink: derivedLink || prev.mapsLink,
    }));
    setMapsLocked(true);
    setErrors((prev) => ({ ...prev, venueId: undefined }));
  };

  const clearSelectedVenue = () => {
    setSelectedVenue(null);
    setVenueQuery("");
    setShowVenueSuggestions(false);
    setMapsLocked(false);
    setFormData((prev) => ({ ...prev, venueId: "", mapsLink: "" }));
    setErrors((prev) => ({ ...prev, venueId: undefined }));
  };

  const toggleMapsLock = () => {
    if (!selectedVenue) {
      return;
    }

    if (mapsLocked) {
      setMapsLocked(false);
    } else {
      const derivedLink = buildMapsLink(selectedVenue);
      setFormData((prev) => ({
        ...prev,
        mapsLink: derivedLink || prev.mapsLink,
      }));
      setMapsLocked(true);
      setErrors((prev) => ({ ...prev, mapsLink: undefined }));
    }
  };

  const validateStep = (stepId: WizardStep) => {
    const stepErrors: FormErrors = {};

    if (stepId === "basics") {
      if (!formData.title.trim()) {
        stepErrors.title = "Event title is required.";
      }

      if (
        !posterPreview &&
        formData.posterImageUrl &&
        !isValidUrl(formData.posterImageUrl)
      ) {
        stepErrors.posterImageUrl = "Enter a valid URL for the poster image.";
      }

      if (formData.externalLink && !isValidUrl(formData.externalLink)) {
        stepErrors.externalLink = "External link must be a valid URL.";
      }
    }

    if (stepId === "schedule") {
      if (!formData.startsAt) {
        stepErrors.startsAt = "Start date/time is required.";
      }

      if (!formData.venueId) {
        stepErrors.venueId = "Select a venue to continue.";
      }

      if (formData.endsAt && !formData.startsAt) {
        stepErrors.endsAt = "Add a start time before setting the end time.";
      }

      if (formData.startsAt && formData.endsAt) {
        const start = new Date(formData.startsAt);
        const end = new Date(formData.endsAt);
        if (end <= start) {
          stepErrors.endsAt = "End time must be after the start time.";
        }
      }

      if (!formData.mapsLink) {
        stepErrors.mapsLink = "Maps link is required for the venue.";
      } else if (formData.mapsLink && !isValidUrl(formData.mapsLink)) {
        stepErrors.mapsLink = "Maps link must be a valid URL.";
      }
    }

    if (stepId === "review") {
      if (!["draft", "published"].includes(formData.status)) {
        stepErrors.status =
          "Select whether to keep this as a draft or publish it.";
      }
    }

    setErrors(stepErrors);
    return stepErrors;
  };

  const goToStep = (index: number) => {
    if (index < 0 || index >= steps.length) return;
    setCurrentStepIndex(index);
    setErrors({});
  };

  const handleNext = () => {
    const validation = validateStep(currentStep.id);
    if (Object.keys(validation).length === 0) {
      goToStep(currentStepIndex + 1);
    }
  };

  const handleBack = () => {
    goToStep(currentStepIndex - 1);
  };

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

  const renderBasicsStep = () => (
    <div className="space-y-6">
      <Input
        label="Event title"
        placeholder="e.g., Midnight Dreams Tour"
        value={formData.title}
        onChange={(event) =>
          setFormData((prev) => ({ ...prev, title: event.target.value }))
        }
        error={errors.title}
      />

      <div>
        <label
          htmlFor="poster-upload"
          className="block text-sm font-medium text-bone-100 mb-2"
        >
          Poster image file (optional)
        </label>
        <input
          ref={posterInputRef}
          id="poster-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePosterFileChange}
        />
        <div
          role="button"
          tabIndex={0}
          onClick={() => posterInputRef.current?.click()}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              posterInputRef.current?.click();
            }
          }}
          className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-6 transition-colors ${
            posterPreview
              ? "border-acid-400/60 bg-acid-400/10"
              : "border-grit-500/40 bg-ink-800/40 hover:border-acid-400/50"
          }`}
        >
          {posterPreview ? (
            <>
              <Image
                src={posterPreview}
                alt="Poster preview"
                width={320}
                height={480}
                unoptimized
                className="h-48 w-full max-w-xs rounded-lg object-cover"
              />
              <p className="text-xs text-grit-400">
                Click to replace the uploaded poster image.
              </p>
            </>
          ) : (
            <>
              <span className="text-sm text-grit-300">
                Drop an image or click to upload
              </span>
              <span className="text-xs text-grit-500">
                PNG or JPG, up to 10 MB
              </span>
            </>
          )}
        </div>
        {posterPreview && (
          <div className="mt-2 flex items-center justify-between text-xs text-grit-400">
            <span className="truncate pr-3">{posterFile?.name}</span>
            <button
              type="button"
              className="text-signal-400 hover:text-signal-300"
              onClick={clearPosterFile}
            >
              Remove file
            </button>
          </div>
        )}
      </div>

      <Input
        label="Poster image URL (optional)"
        placeholder="https://"
        value={formData.posterImageUrl}
        onChange={(event) =>
          setFormData((prev) => ({
            ...prev,
            posterImageUrl: event.target.value,
          }))
        }
        error={errors.posterImageUrl}
        helperText={
          posterPreview
            ? "File upload selected. Remove the file to use a hosted URL instead."
            : "Add a hosted image to use in previews until automated uploads roll out."
        }
        disabled={Boolean(posterPreview)}
      />

      <Input
        label="External event link (optional)"
        placeholder="https://your-site.com/event"
        value={formData.externalLink}
        onChange={(event) =>
          setFormData((prev) => ({
            ...prev,
            externalLink: event.target.value,
          }))
        }
        error={errors.externalLink}
        helperText="Point fans to a landing page or marketing site."
      />

      <Card className="bg-ink-800/40 border-dashed border-grit-500/40">
        <p className="text-sm text-grit-300">
          {
            "Ticket tiers, presales, and collectible poster workflows plug in after this first milestone. We'll auto-carry basic event facts forward so you can enrich the setup later without re-entering details."
          }
        </p>
      </Card>
    </div>
  );

  const renderScheduleStep = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Input
          label="Start time"
          type="datetime-local"
          value={formData.startsAt}
          onChange={(event) => handleStartTimeChange(event.target.value)}
          error={errors.startsAt}
        />

        <Input
          label="End time"
          type="datetime-local"
          value={formData.endsAt}
          onChange={(event) => handleEndTimeChange(event.target.value)}
          error={errors.endsAt}
          helperText="We’ll backfill two hours by default—adjust as needed."
        />
      </div>

      <div>
        <label
          className="block mb-2 text-sm font-medium text-bone-100"
          htmlFor="venue-search"
        >
          Venue
        </label>
        {isLoadingVenues ? (
          <div className="rounded-md border border-grit-500/30 p-6">
            <LoadingSpinner size="sm" text="Loading venues..." />
          </div>
        ) : isVenuesError ? (
          <Card className="border-signal-500/50 bg-signal-500/10 text-signal-200">
            Unable to load venues. Refresh to retry or add the venue later.
          </Card>
        ) : (
          <>
            <div className="relative" ref={suggestionBoxRef}>
              <input
                ref={venueInputRef}
                type="text"
                id="venue-search"
                value={venueQuery}
                onChange={(event) => handleVenueInputChange(event.target.value)}
                onFocus={() => setShowVenueSuggestions(true)}
                onBlur={() =>
                  setTimeout(() => setShowVenueSuggestions(false), 120)
                }
                placeholder="Search by venue name, city, or state"
                autoComplete="off"
                className={`w-full rounded-md bg-ink-800 px-3 py-2 text-bone-100 placeholder-grit-400 focus:outline-none focus:ring-2 ${
                  errors.venueId
                    ? "border border-signal-500 focus:ring-signal-500/50"
                    : "border border-grit-500/30 focus:ring-acid-400/50"
                }`}
              />
              {showVenueSuggestions && venueSuggestions.length > 0 && (
                <div className="absolute z-50 mt-2 max-h-60 w-full overflow-auto rounded-lg border border-grit-500/30 bg-ink-900/95 shadow-2xl backdrop-blur-sm">
                  {venueSuggestions.map((venue) => (
                    <button
                      key={venue.id}
                      type="button"
                      className="block w-full px-3 py-2 text-left transition-colors hover:bg-acid-400/10"
                      onMouseDown={(event) => {
                        event.preventDefault();
                        handleVenueSelect(venue);
                      }}
                    >
                      <div className="text-sm font-medium text-bone-100">
                        {venue.name}
                      </div>
                      <div className="text-xs text-grit-400">
                        {[venue.city, venue.state].filter(Boolean).join(", ") ||
                          "Location pending"}
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {showVenueSuggestions && venueSuggestions.length === 0 && (
                <div className="absolute z-50 mt-2 w-full rounded-lg border border-grit-500/30 bg-ink-900/95 px-3 py-2 text-xs text-grit-400">
                  No matching venues. Keep typing or reach out to add a new
                  location.
                </div>
              )}
            </div>
            {errors.venueId && (
              <p className="mt-2 text-sm text-signal-500">{errors.venueId}</p>
            )}
            {selectedVenue && (
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-grit-400">
                <span>
                  Using {selectedVenue.name}
                  {selectedVenue.city
                    ? ` · ${selectedVenue.city}${
                        selectedVenue.state ? `, ${selectedVenue.state}` : ""
                      }`
                    : ""}
                </span>
                <button
                  type="button"
                  className="text-signal-400 hover:text-signal-300"
                  onClick={clearSelectedVenue}
                >
                  Clear selection
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <div className="space-y-2">
        <Input
          label="Maps link"
          placeholder="https://maps.google.com/?..."
          value={formData.mapsLink}
          onChange={(event) => {
            setFormData((prev) => ({ ...prev, mapsLink: event.target.value }));
            setErrors((prev) => ({ ...prev, mapsLink: undefined }));
          }}
          error={errors.mapsLink}
          helperText={
            selectedVenue
              ? mapsLocked
                ? "Auto-generated from the venue record. Toggle to override for this event only."
                : "Override the venue map link for special entrances or alternate locations."
              : "Select a venue to auto-populate the map link."
          }
          disabled={Boolean(selectedVenue && mapsLocked)}
          className={
            selectedVenue && mapsLocked ? "cursor-not-allowed opacity-70" : ""
          }
        />
        {selectedVenue && (
          <button
            type="button"
            className="text-xs text-acid-400 hover:text-acid-300"
            onClick={toggleMapsLock}
          >
            {mapsLocked
              ? "Enable custom map link"
              : "Use venue default map link"}
          </button>
        )}
      </div>

      <Card className="bg-ink-800/40 border-dashed border-grit-500/40">
        <p className="text-sm text-grit-300">
          {
            "Seat maps, presale codes, and rarity tracking build on top of this schedule data. Once those modules land you'll unlock per-section collectibles and Base Paymaster USDC pricing cues during checkout."
          }
        </p>
      </Card>
    </div>
  );

  const renderReviewStep = () => {
    const startPreview = formData.startsAt
      ? format(new Date(formData.startsAt), "PPpp")
      : "Not set";
    const endPreview = formData.endsAt
      ? format(new Date(formData.endsAt), "PPpp")
      : "Not set";
    const venuePreview = formData.venueId
      ? venues.find((venue: any) => String(venue.id) === formData.venueId)
          ?.name ?? "Selected venue"
      : "Not set";

    return (
      <div className="space-y-6">
        <Card className="bg-ink-800/60 border-grit-500/40">
          <div className="space-y-3">
            <div>
              <div className="text-xs uppercase tracking-widest text-grit-400">
                Title
              </div>
              <div className="text-lg text-bone-100 font-semibold">
                {formData.title || "Untitled Event"}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <div className="text-xs uppercase tracking-widest text-grit-400">
                  Starts
                </div>
                <div className="text-bone-100">{startPreview}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest text-grit-400">
                  Ends
                </div>
                <div className="text-bone-100">{endPreview}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest text-grit-400">
                  Venue
                </div>
                <div className="text-bone-100">{venuePreview}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest text-grit-400">
                  Poster
                </div>
                <div className="text-bone-100">
                  {posterPreview
                    ? "Uploaded poster image"
                    : formData.posterImageUrl || "Poster upload coming soon"}
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-ink-800/40 border-dashed border-grit-500/40">
          <div className="space-y-2">
            <div className="text-sm text-grit-300">
              {
                "Ticket tiers, collectible poster approvals, and Base Paymaster incentives anchor the next slice of work. After this wizard ships, we'll layer in tier creation and rarity scoring without requiring venues to recreate events."
              }
            </div>
            <div className="text-sm text-grit-500">
              You can safely create the event now and return once the tier
              builder is ready.
            </div>
          </div>
        </Card>

        <div>
          <div className="text-sm font-medium text-bone-100 mb-2">
            Publish state
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({ ...prev, status: "draft" }))
              }
              className={`rounded-lg border px-4 py-3 text-left transition-colors ${
                formData.status === "draft"
                  ? "border-acid-400 bg-acid-400/10"
                  : "border-grit-500/30 hover:border-grit-500/50"
              }`}
            >
              <div className="font-semibold text-bone-100">Save as draft</div>
              <div className="text-sm text-grit-400">
                Keep working privately. You can preview the event page before
                going live.
              </div>
            </button>

            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({ ...prev, status: "published" }))
              }
              className={`rounded-lg border px-4 py-3 text-left transition-colors ${
                formData.status === "published"
                  ? "border-acid-400 bg-acid-400/10"
                  : "border-grit-500/30 hover:border-grit-500/50"
              }`}
            >
              <div className="font-semibold text-bone-100">Publish now</div>
              <div className="text-sm text-grit-400">
                Make the event discoverable immediately. Ideal for fast drops
                and presales.
              </div>
            </button>
          </div>
          {errors.status && (
            <p className="mt-1 text-sm text-signal-500">{errors.status}</p>
          )}
        </div>
      </div>
    );
  };

  const renderStepContent = () => {
    switch (currentStep.id) {
      case "basics":
        return renderBasicsStep();
      case "schedule":
        return renderScheduleStep();
      case "review":
        return renderReviewStep();
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-ink-900 via-ink-900/95 to-ink-900">
      <Navbar />

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

          <div className="mb-8 grid gap-4 sm:grid-cols-3">
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

      <Footer />
    </div>
  );
}
