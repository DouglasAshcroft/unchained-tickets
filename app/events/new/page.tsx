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

type PricingType = "general_admission" | "reserved" | "mixed";

type TicketPerkForm = {
  id: string;
  name: string;
  description: string;
  instructions: string;
  quantity: string;
};

type TicketTypeForm = {
  id: string;
  name: string;
  description: string;
  pricingType: PricingType;
  price: string;
  currency: string;
  capacity: string;
  salesStart: string;
  salesEnd: string;
  isActive: boolean;
  perks: TicketPerkForm[];
};

type WizardStep = "basics" | "schedule" | "tickets" | "review";

interface StepDefinition {
  id: WizardStep;
  title: string;
  description: string;
}

const generateTicketTypeId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `ticket-${Math.random().toString(36).slice(2, 10)}`;

const generateTicketPerkId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `perk-${Math.random().toString(36).slice(2, 10)}`;

const createEmptyTicketPerk = (): TicketPerkForm => ({
  id: generateTicketPerkId(),
  name: "",
  description: "",
  instructions: "",
  quantity: "1",
});

const createEmptyTicketType = (): TicketTypeForm => ({
  id: generateTicketTypeId(),
  name: "",
  description: "",
  pricingType: "general_admission",
  price: "",
  currency: "USD",
  capacity: "",
  salesStart: "",
  salesEnd: "",
  isActive: true,
  perks: [],
});

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
    id: "tickets",
    title: "Tickets & Seating",
    description:
      "Define ticket tiers, pricing, and reserve a seat map if needed.",
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
  primaryArtistId: string;
  status: "draft" | "published";
  ticketTypes: TicketTypeForm[];
};

type FormErrors = Record<string, string | undefined>;

const initialState: FormState = {
  title: "",
  posterImageUrl: "",
  externalLink: "",
  mapsLink: "",
  startsAt: "",
  endsAt: "",
  venueId: "",
  primaryArtistId: "",
  status: "draft",
  ticketTypes: [createEmptyTicketType()],
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

type ArtistOption = {
  id: number;
  name: string;
  slug: string;
  genre?: string | null;
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
  const [isDraggingPoster, setIsDraggingPoster] = useState(false);
  const [venueQuery, setVenueQuery] = useState("");
  const [selectedVenue, setSelectedVenue] = useState<VenueOption | null>(null);
  const [showVenueSuggestions, setShowVenueSuggestions] = useState(false);
  const venueInputRef = useRef<HTMLInputElement>(null);
  const suggestionBoxRef = useRef<HTMLDivElement>(null);
  const posterInputRef = useRef<HTMLInputElement>(null);
  const [mapsLocked, setMapsLocked] = useState(false);
  const [artistQuery, setArtistQuery] = useState("");
  const [selectedArtist, setSelectedArtist] = useState<ArtistOption | null>(null);
  const [showArtistSuggestions, setShowArtistSuggestions] = useState(false);
  const artistInputRef = useRef<HTMLInputElement>(null);
  const artistSuggestionBoxRef = useRef<HTMLDivElement>(null);

  const currentStep = steps[currentStepIndex];


  const hasReservedPricing = useMemo(
    () =>
      formData.ticketTypes.some((ticket) =>
        ["reserved", "mixed"].includes(ticket.pricingType)
      ),
    [formData.ticketTypes]
  );

  const {
    data: venues = [],
    isLoading: isLoadingVenues,
    isError: isVenuesError,
  } = useQuery({
    queryKey: ["venues"],
    queryFn: () => api.getVenues(),
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: artists = [],
    isLoading: isLoadingArtists,
    isError: isArtistsError,
  } = useQuery({
    queryKey: ["artists"],
    queryFn: () => api.getArtists(),
    staleTime: 5 * 60 * 1000,
  });


  const venueFuse = useMemo(() => {
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
    if (!venueFuse) return [] as VenueOption[];
    return venueFuse
      .search(trimmedQuery)
      .slice(0, 7)
      .map((result) => result.item);
  }, [venues, venueQuery, venueFuse]);

  const artistFuse = useMemo(() => {
    if (!artists.length) return null;
    return new Fuse<ArtistOption>(artists as ArtistOption[], {
      keys: ["name", "genre", "slug"],
      threshold: 0.35,
      includeScore: true,
    });
  }, [artists]);

  const artistSuggestions = useMemo(() => {
    if (!artists.length) return [] as ArtistOption[];
    const trimmedQuery = artistQuery.trim();
    if (!trimmedQuery) {
      return (artists as ArtistOption[]).slice(0, 7);
    }
    if (!artistFuse) return [] as ArtistOption[];
    return artistFuse
      .search(trimmedQuery)
      .slice(0, 7)
      .map((result) => result.item);
  }, [artists, artistQuery, artistFuse]);

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
    setArtistQuery(match.name);
  }, [artists, formData.primaryArtistId]);

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
      if (
        artistSuggestionBoxRef.current &&
        artistSuggestionBoxRef.current.contains(target)
      ) {
        return;
      }
      if (
        artistInputRef.current &&
        (artistInputRef.current === target ||
          artistInputRef.current.contains(target))
      ) {
        return;
      }
      setShowVenueSuggestions(false);
      setShowArtistSuggestions(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const processPosterFile = (file: File) => {
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

  const handlePosterFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setPosterFile(null);
      setPosterPreview(null);
      setErrors((prev) => ({ ...prev, posterImageUrl: undefined }));
      return;
    }

    processPosterFile(file);
  };

  const handlePosterDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingPoster(true);
  };

  const handlePosterDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingPoster(false);
  };

  const handlePosterDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingPoster(false);

    const file = event.dataTransfer?.files?.[0];
    if (file && file.type.startsWith("image/")) {
      processPosterFile(file);
    }
  };

  const clearPosterFile = () => {
    setPosterFile(null);
    setPosterPreview(null);
    if (posterInputRef.current) {
      posterInputRef.current.value = "";
    }
    setErrors((prev) => ({ ...prev, posterImageUrl: undefined }));
  };

  const getTicketFieldError = (
    ticketId: string,
    field: keyof TicketTypeForm
  ) => errors[`ticketTypes.${ticketId}.${String(field)}`];

  const getTicketPerkFieldError = (
    ticketId: string,
    perkId: string,
    field: keyof TicketPerkForm
  ) => errors[`ticketTypes.${ticketId}.perks.${perkId}.${String(field)}`];

  const handleTicketTypeChange = <K extends keyof TicketTypeForm>(
    ticketId: string,
    field: K,
    value: TicketTypeForm[K]
  ) => {
    setFormData((prev) => ({
      ...prev,
      ticketTypes: prev.ticketTypes.map((ticket) =>
        ticket.id === ticketId ? { ...ticket, [field]: value } : ticket
      ),
    }));

    setErrors((prev) => ({
      ...prev,
      [`ticketTypes.${ticketId}.${String(field)}`]: undefined,
    }));
  };

  const handleAddTicketType = () => {
    setFormData((prev) => ({
      ...prev,
      ticketTypes: [...prev.ticketTypes, createEmptyTicketType()],
    }));
  };

  const handleTicketPerkChange = <K extends keyof TicketPerkForm>(
    ticketId: string,
    perkId: string,
    field: K,
    value: TicketPerkForm[K]
  ) => {
    setFormData((prev) => ({
      ...prev,
      ticketTypes: prev.ticketTypes.map((ticket) =>
        ticket.id === ticketId
          ? {
              ...ticket,
              perks: ticket.perks.map((perk) =>
                perk.id === perkId ? { ...perk, [field]: value } : perk
              ),
            }
          : ticket
      ),
    }));

    setErrors((prev) => ({
      ...prev,
      [`ticketTypes.${ticketId}.perks.${perkId}.${String(field)}`]: undefined,
    }));
  };

  const handleAddTicketPerk = (ticketId: string) => {
    setFormData((prev) => ({
      ...prev,
      ticketTypes: prev.ticketTypes.map((ticket) =>
        ticket.id === ticketId
          ? { ...ticket, perks: [...ticket.perks, createEmptyTicketPerk()] }
          : ticket
      ),
    }));
  };

  const handleRemoveTicketPerk = (ticketId: string, perkId: string) => {
    setFormData((prev) => ({
      ...prev,
      ticketTypes: prev.ticketTypes.map((ticket) =>
        ticket.id === ticketId
          ? {
              ...ticket,
              perks: ticket.perks.filter((perk) => perk.id !== perkId),
            }
          : ticket
      ),
    }));

    setErrors((prev) => {
      const next = { ...prev } as Record<string, string | undefined>;
      Object.keys(next).forEach((key) => {
        if (key.startsWith(`ticketTypes.${ticketId}.perks.${perkId}`)) {
          delete next[key];
        }
      });
      return next;
    });
  };

  const handleRemoveTicketType = (ticketId: string) => {
    if (formData.ticketTypes.length === 1) {
      toast.error("Keep at least one ticket type");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      ticketTypes: prev.ticketTypes.filter((ticket) => ticket.id !== ticketId),
    }));

    setErrors((prev) => {
      const next = { ...prev } as Record<string, string | undefined>;
      Object.keys(next).forEach((key) => {
        if (key.startsWith(`ticketTypes.${ticketId}`)) {
          delete next[key];
        }
      });
      return next;
    });
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
      setFormData((prev) => ({
        ...prev,
        venueId: "",
        mapsLink: "",
      }));
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
    setErrors((prev) => ({
      ...prev,
      venueId: undefined,
    }));
  };

  const clearSelectedVenue = () => {
    setSelectedVenue(null);
    setVenueQuery("");
    setShowVenueSuggestions(false);
    setMapsLocked(false);
    setFormData((prev) => ({
      ...prev,
      venueId: "",
      mapsLink: "",
    }));
    setErrors((prev) => ({
      ...prev,
      venueId: undefined,
    }));
  };

  const handleArtistInputChange = (value: string) => {
    if (selectedArtist && value === selectedArtist.name) {
      setArtistQuery(value);
      return;
    }

    setArtistQuery(value);
    setShowArtistSuggestions(true);

    if (selectedArtist) {
      setSelectedArtist(null);
      setFormData((prev) => ({
        ...prev,
        primaryArtistId: "",
      }));
    }
  };

  const handleArtistSelect = (artist: ArtistOption) => {
    setSelectedArtist(artist);
    setArtistQuery(artist.name);
    setShowArtistSuggestions(false);
    setFormData((prev) => ({
      ...prev,
      primaryArtistId: String(artist.id),
    }));
    setErrors((prev) => ({
      ...prev,
      primaryArtistId: undefined,
    }));
  };

  const clearSelectedArtist = () => {
    setSelectedArtist(null);
    setArtistQuery("");
    setShowArtistSuggestions(false);
    setFormData((prev) => ({
      ...prev,
      primaryArtistId: "",
    }));
    setErrors((prev) => ({
      ...prev,
      primaryArtistId: undefined,
    }));
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

    if (stepId === "tickets") {
      if (!formData.ticketTypes.length) {
        stepErrors.ticketTypes = "Add at least one ticket type.";
      }

      const seenNames = new Set<string>();

      formData.ticketTypes.forEach((ticket) => {
        const trimmedName = ticket.name.trim();
        if (!trimmedName) {
          stepErrors[`ticketTypes.${ticket.id}.name`] =
            "Ticket name is required.";
        } else {
          const normalized = trimmedName.toLowerCase();
          if (seenNames.has(normalized)) {
            stepErrors[`ticketTypes.${ticket.id}.name`] =
              "Ticket names must be unique.";
          } else {
            seenNames.add(normalized);
          }
        }

        const priceValue = ticket.price.trim();
        if (!priceValue) {
          stepErrors[`ticketTypes.${ticket.id}.price`] =
            "Enter a price for this ticket.";
        } else {
          const parsedPrice = Number.parseFloat(priceValue);
          if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
            stepErrors[`ticketTypes.${ticket.id}.price`] =
              "Price must be a valid non-negative number.";
          }
        }

        const currencyValue = ticket.currency.trim();
        if (!/^[A-Za-z]{3}$/.test(currencyValue)) {
          stepErrors[`ticketTypes.${ticket.id}.currency`] =
            "Use a three-letter currency code (e.g., USD).";
        }

        const capacityValue = ticket.capacity.trim();
        if (!capacityValue) {
          stepErrors[`ticketTypes.${ticket.id}.capacity`] =
            "Capacity is required.";
        } else {
          const parsedCapacity = Number.parseInt(capacityValue, 10);
          if (!Number.isFinite(parsedCapacity) || parsedCapacity <= 0) {
            stepErrors[`ticketTypes.${ticket.id}.capacity`] =
              "Capacity must be a positive whole number.";
          }
        }

        if (ticket.salesStart && ticket.salesEnd) {
          const startDate = new Date(ticket.salesStart);
          const endDate = new Date(ticket.salesEnd);
          if (endDate < startDate) {
            stepErrors[`ticketTypes.${ticket.id}.salesEnd`] =
              "Sales end must be after the start.";
          }
        }

        ticket.perks.forEach((perk) => {
          const trimmedPerkName = perk.name.trim();
          if (!trimmedPerkName) {
            stepErrors[`ticketTypes.${ticket.id}.perks.${perk.id}.name`] =
              "Perk name is required.";
          }

          const quantityValue = perk.quantity.trim();
          const parsedQuantity = Number.parseInt(quantityValue || "0", 10);
          if (!Number.isFinite(parsedQuantity) || parsedQuantity < 1) {
            stepErrors[`ticketTypes.${ticket.id}.perks.${perk.id}.quantity`] =
              "Quantity must be at least 1.";
          }

          if (perk.description.length > 500) {
            stepErrors[`ticketTypes.${ticket.id}.perks.${perk.id}.description`] =
              "Description must be 500 characters or fewer.";
          }

          if (perk.instructions.length > 500) {
            stepErrors[`ticketTypes.${ticket.id}.perks.${perk.id}.instructions`] =
              "Instructions must be 500 characters or fewer.";
          }
        });
      });

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
          className="block mb-2 text-sm font-medium text-bone-100"
          htmlFor="artist-search"
        >
          Primary artist / performer
        </label>
        {isLoadingArtists ? (
          <div className="rounded-md border border-grit-500/30 p-6">
            <LoadingSpinner size="sm" text="Loading artists..." />
          </div>
        ) : isArtistsError ? (
          <Card className="border-signal-500/50 bg-signal-500/10 text-signal-200">
            Unable to load artists. Refresh to retry or add the performer later.
          </Card>
        ) : (
          <>
            <div className="relative" ref={artistSuggestionBoxRef}>
              <input
                ref={artistInputRef}
                type="text"
                id="artist-search"
                value={artistQuery}
                onChange={(event) => handleArtistInputChange(event.target.value)}
                onFocus={() => setShowArtistSuggestions(true)}
                onBlur={() => setTimeout(() => setShowArtistSuggestions(false), 120)}
                placeholder="Search by artist name or genre"
                autoComplete="off"
                className={`w-full rounded-md bg-ink-800 px-3 py-2 text-bone-100 placeholder-grit-400 focus:outline-none focus:ring-2 ${
                  errors.primaryArtistId
                    ? "border border-signal-500 focus:ring-signal-500/50"
                    : "border border-grit-500/30 focus:ring-acid-400/50"
                }`}
              />
              {showArtistSuggestions && artistSuggestions.length > 0 && (
                <div className="absolute z-50 mt-2 max-h-60 w-full overflow-auto rounded-lg border border-grit-500/30 bg-ink-900/95 shadow-2xl backdrop-blur-sm">
                  {artistSuggestions.map((artist) => (
                    <button
                      key={artist.id}
                      type="button"
                      className="block w-full px-3 py-2 text-left transition-colors hover:bg-acid-400/10"
                      onMouseDown={(event) => {
                        event.preventDefault();
                        handleArtistSelect(artist);
                      }}
                    >
                      <div className="text-sm font-medium text-bone-100">
                        {artist.name}
                      </div>
                      <div className="text-xs text-grit-400">
                        {artist.genre || "Genre TBD"}
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {showArtistSuggestions && artistSuggestions.length === 0 && (
                <div className="absolute z-50 mt-2 w-full rounded-lg border border-grit-500/30 bg-ink-900/95 px-3 py-2 text-xs text-grit-400">
                  No matching artists. Keep typing or ping the Unchained team to onboard them.
                </div>
              )}
            </div>
            {errors.primaryArtistId && (
              <p className="mt-2 text-sm text-signal-500">
                {errors.primaryArtistId}
              </p>
            )}
            {selectedArtist && (
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-grit-400">
                <span>
                  Featuring {selectedArtist.name}
                  {selectedArtist.genre ? ` · ${selectedArtist.genre}` : ""}
                </span>
                <button
                  type="button"
                  className="text-signal-400 hover:text-signal-300"
                  onClick={clearSelectedArtist}
                >
                  Clear performer
                </button>
              </div>
            )}
          </>
        )}
      </div>

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
          onDragOver={handlePosterDragOver}
          onDragLeave={handlePosterDragLeave}
          onDrop={handlePosterDrop}
          className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-6 transition-colors ${
            posterPreview
              ? "border-acid-400/60 bg-acid-400/10"
              : isDraggingPoster
              ? "border-acid-400 bg-acid-400/20"
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

  const renderTicketsStep = () => (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-lg font-semibold text-bone-100">Ticket tiers</div>
          <p className="text-sm text-grit-300">
            Configure pricing, inventory, and sales windows. Seat maps now live in the
            venue dashboard onboarding flow, so you only upload layouts once.
          </p>
        </div>
        <Button type="button" onClick={handleAddTicketType}>
          Add ticket type
        </Button>
      </div>

      {errors.ticketTypes && (
        <p className="text-sm text-signal-500">{errors.ticketTypes}</p>
      )}

      <div className="space-y-4">
        {formData.ticketTypes.map((ticket, index) => (
          <Card key={ticket.id} className="bg-ink-800/60 border-grit-500/40">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-4 md:grid md:grid-cols-2">
                <Input
                  label="Ticket name"
                  placeholder={index === 0 ? "General Admission" : "VIP Balcony"}
                  value={ticket.name}
                  onChange={(event) =>
                    handleTicketTypeChange(ticket.id, "name", event.target.value)
                  }
                  error={getTicketFieldError(ticket.id, "name")}
                />

                <div className="w-full">
                  <label className="block mb-2 text-sm font-medium text-bone-100">
                    Pricing type
                  </label>
                  <select
                    value={ticket.pricingType}
                    onChange={(event) =>
                      handleTicketTypeChange(
                        ticket.id,
                        "pricingType",
                        event.target.value as PricingType
                      )
                    }
                    className={`w-full rounded-md bg-ink-800 px-3 py-2 text-bone-100 focus:outline-none focus:ring-2 focus:ring-acid-400/50 ${
                      getTicketFieldError(ticket.id, "pricingType")
                        ? "border border-signal-500"
                        : "border border-grit-500/30"
                    }`}
                  >
                    <option value="general_admission">General admission</option>
                    <option value="reserved">Reserved seating</option>
                    <option value="mixed">Mixed: GA + reserved</option>
                  </select>
                  {getTicketFieldError(ticket.id, "pricingType") && (
                    <p className="mt-1 text-sm text-signal-500">
                      {getTicketFieldError(ticket.id, "pricingType")}
                    </p>
                  )}
                </div>

                <Input
                  label="Price"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  placeholder="75.00"
                  value={ticket.price}
                  onChange={(event) =>
                    handleTicketTypeChange(ticket.id, "price", event.target.value)
                  }
                  error={getTicketFieldError(ticket.id, "price")}
                  helperText="Enter price in the event currency"
                />

                <Input
                  label="Capacity"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="250"
                  value={ticket.capacity}
                  onChange={(event) =>
                    handleTicketTypeChange(ticket.id, "capacity", event.target.value)
                  }
                  error={getTicketFieldError(ticket.id, "capacity")}
                />

                <Input
                  label="Currency"
                  placeholder="USD"
                  value={ticket.currency}
                  onChange={(event) =>
                    handleTicketTypeChange(
                      ticket.id,
                      "currency",
                      event.target.value.toUpperCase()
                    )
                  }
                  maxLength={3}
                  error={getTicketFieldError(ticket.id, "currency")}
                />

                <div className="grid gap-4 md:grid-cols-2 md:col-span-2">
                  <Input
                    label="Sales start"
                    type="datetime-local"
                    value={ticket.salesStart}
                    onChange={(event) =>
                      handleTicketTypeChange(
                        ticket.id,
                        "salesStart",
                        event.target.value
                      )
                    }
                    error={getTicketFieldError(ticket.id, "salesStart")}
                  />
                  <Input
                    label="Sales end"
                    type="datetime-local"
                    value={ticket.salesEnd}
                    onChange={(event) =>
                      handleTicketTypeChange(
                        ticket.id,
                        "salesEnd",
                        event.target.value
                      )
                    }
                    error={getTicketFieldError(ticket.id, "salesEnd")}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-bone-100">
                    Description (optional)
                  </label>
                  <textarea
                    className="w-full rounded-md border border-grit-500/30 bg-ink-800 px-3 py-2 text-sm text-bone-100 placeholder-grit-400 focus:outline-none focus:ring-2 focus:ring-acid-400/50"
                    rows={3}
                    value={ticket.description}
                    onChange={(event) =>
                      handleTicketTypeChange(
                        ticket.id,
                        "description",
                        event.target.value
                      )
                    }
                    placeholder="Notes for staff, perks included, or seating instructions."
                  />
                </div>

                <div className="md:col-span-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-bone-100">
                      Ticket perks (optional)
                    </span>
                    <Button
                      type="button"
                      variant="secondary"
                      className="px-3 py-1 text-xs"
                      onClick={() => handleAddTicketPerk(ticket.id)}
                    >
                      Add perk
                    </Button>
                  </div>

                  {ticket.perks.length === 0 ? (
                    <Card className="border-dashed border-grit-500/30 bg-ink-800/40 p-4 text-sm text-grit-300">
                      No perks added yet. Add perks to surface drink tickets, merch bundles, or meet & greet access during checkout and scanning.
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      {ticket.perks.map((perk, perkIndex) => (
                        <div
                          key={perk.id}
                          className="rounded-lg border border-grit-500/30 bg-ink-900/40 p-4"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="text-sm font-semibold text-bone-100">
                              Perk {perkIndex + 1}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveTicketPerk(ticket.id, perk.id)}
                              className="text-xs text-signal-400 hover:text-signal-300"
                            >
                              Remove perk
                            </button>
                          </div>

                          <div className="mt-3 grid gap-4 md:grid-cols-2">
                            <Input
                              label="Perk name"
                              placeholder="e.g., Complimentary drink"
                              value={perk.name}
                              onChange={(event) =>
                                handleTicketPerkChange(
                                  ticket.id,
                                  perk.id,
                                  "name",
                                  event.target.value
                                )
                              }
                              error={getTicketPerkFieldError(ticket.id, perk.id, "name")}
                            />

                            <Input
                              label="Quantity"
                              type="number"
                              min="1"
                              step="1"
                              placeholder="1"
                              value={perk.quantity}
                              onChange={(event) =>
                                handleTicketPerkChange(
                                  ticket.id,
                                  perk.id,
                                  "quantity",
                                  event.target.value
                                )
                              }
                              error={getTicketPerkFieldError(ticket.id, perk.id, "quantity")}
                            />

                            <div className="md:col-span-2">
                              <label className="mb-2 block text-sm font-medium text-bone-100">
                                Description (optional)
                              </label>
                              <textarea
                                className="w-full rounded-md border border-grit-500/30 bg-ink-800 px-3 py-2 text-sm text-bone-100 placeholder-grit-400 focus:outline-none focus:ring-2 focus:ring-acid-400/50"
                                rows={2}
                                value={perk.description}
                                onChange={(event) =>
                                  handleTicketPerkChange(
                                    ticket.id,
                                    perk.id,
                                    "description",
                                    event.target.value
                                  )
                                }
                                placeholder="Explain what the perk includes."
                              />
                              {getTicketPerkFieldError(ticket.id, perk.id, "description") && (
                                <p className="mt-1 text-sm text-signal-500">
                                  {getTicketPerkFieldError(ticket.id, perk.id, "description")}
                                </p>
                              )}
                            </div>

                            <div className="md:col-span-2">
                              <label className="mb-2 block text-sm font-medium text-bone-100">
                                Redemption instructions (optional)
                              </label>
                              <textarea
                                className="w-full rounded-md border border-grit-500/30 bg-ink-800 px-3 py-2 text-sm text-bone-100 placeholder-grit-400 focus:outline-none focus:ring-2 focus:ring-acid-400/50"
                                rows={2}
                                value={perk.instructions}
                                onChange={(event) =>
                                  handleTicketPerkChange(
                                    ticket.id,
                                    perk.id,
                                    "instructions",
                                    event.target.value
                                  )
                                }
                                placeholder="Add pickup details for staff to follow."
                              />
                              {getTicketPerkFieldError(ticket.id, perk.id, "instructions") && (
                                <p className="mt-1 text-sm text-signal-500">
                                  {getTicketPerkFieldError(ticket.id, perk.id, "instructions")}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <input
                    id={`ticket-active-${ticket.id}`}
                    type="checkbox"
                    checked={ticket.isActive}
                    onChange={(event) =>
                      handleTicketTypeChange(
                        ticket.id,
                        "isActive",
                        event.target.checked
                      )
                    }
                    className="h-4 w-4 rounded border-grit-500/40 bg-ink-800 text-acid-400 focus:outline-none focus:ring-2 focus:ring-acid-400/50"
                  />
                  <label htmlFor={`ticket-active-${ticket.id}`} className="text-sm text-bone-100">
                    Active for sale
                  </label>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveTicketType(ticket.id)}
                  className="text-sm text-signal-400 hover:text-signal-300"
                >
                  Remove
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {hasReservedPricing && (
        <Card className="bg-ink-800/60 border-dashed border-grit-500/40">
          <p className="text-sm text-grit-300">
            Reserved seating tiers are best paired with a venue seat map. Upload and manage
            layouts once from the venue dashboard’s onboarding checklist—events will pick up the
            latest version automatically.
          </p>
        </Card>
      )}
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
    const artistPreview = selectedArtist
      ? `${selectedArtist.name}${selectedArtist.genre ? ` · ${selectedArtist.genre}` : ""}`
      : formData.primaryArtistId
      ? "Performer selected"
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
                  Performer
                </div>
                <div className="text-bone-100">{artistPreview}</div>
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

        <Card className="bg-ink-800/60 border-grit-500/40">
          <div className="space-y-4">
            <div>
              <div className="text-xs uppercase tracking-widest text-grit-400">
                Ticket types
              </div>
              <div className="mt-3 space-y-3">
                {formData.ticketTypes.map((ticket) => {
                  const price = ticket.price.trim();
                  const parsedPrice = Number.parseFloat(price);
                  const pricePreview =
                    price && Number.isFinite(parsedPrice)
                      ? `$${parsedPrice.toFixed(2)}`
                      : "--";
                  const capacityPreview = ticket.capacity.trim() || "--";

                  return (
                    <div
                      key={ticket.id}
                      className="rounded-lg border border-grit-500/30 bg-ink-900/60 px-4 py-3"
                    >
                      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                        <div>
                          <div className="text-sm font-semibold text-bone-100">
                            {ticket.name || "Unnamed tier"}
                          </div>
                          <div className="text-xs text-grit-400">
                            {ticket.pricingType === "general_admission"
                              ? "General admission"
                              : ticket.pricingType === "reserved"
                              ? "Reserved seating"
                              : "Mixed seating"}
                          </div>
                        </div>
                        <div className="flex flex-col items-start gap-1 text-xs text-grit-300 md:flex-row md:items-center md:gap-4">
                          <span>
                            Price: <span className="text-bone-100">{pricePreview}</span>
                          </span>
                          <span>
                            Capacity:{" "}
                            <span className="text-bone-100">{capacityPreview}</span>
                          </span>
                          <span>
                            Currency:{" "}
                            <span className="text-bone-100">
                              {ticket.currency || "USD"}
                            </span>
                          </span>
                        </div>
                      </div>
                      {ticket.description && (
                        <div className="mt-2 text-xs text-grit-400">
                          {ticket.description}
                        </div>
                      )}
                      {ticket.perks.length > 0 && (
                        <div className="mt-3">
                          <div className="text-xs uppercase tracking-widest text-grit-400">
                            Included perks
                          </div>
                          <div className="mt-2 space-y-2">
                            {ticket.perks.map((perk) => (
                              <div key={perk.id} className="rounded-md bg-ink-800/80 px-3 py-2 text-xs text-grit-300">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-bone-100 font-medium">
                                    {perk.name || "Unnamed perk"}
                                  </span>
                                  <span className="text-grit-400">
                                    Qty {perk.quantity || "1"}
                                  </span>
                                </div>
                                {perk.description && (
                                  <div className="mt-1 text-grit-400">
                                    {perk.description}
                                  </div>
                                )}
                                {perk.instructions && (
                                  <div className="mt-1 text-grit-500">
                                    Redeem: {perk.instructions}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="text-xs uppercase tracking-widest text-grit-400">
                Seating
              </div>
              {hasReservedPricing ? (
                <div className="mt-2 text-sm text-grit-300">
                  Reserved or mixed tiers are enabled. Upload and activate your
                  venue seat map from the dashboard’s onboarding checklist so
                  buyers can choose their seats when you go live.
                </div>
              ) : (
                <div className="mt-2 text-sm text-grit-300">
                  All tickets are general admission for this event.
                </div>
              )}
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
      case "tickets":
        return renderTicketsStep();
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
