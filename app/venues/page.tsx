import { eventService } from "@/lib/services/EventService";
import VenuesBrowser, { type VenueListItem } from "./VenuesBrowser";

// Enable ISR - revalidate every 10 minutes
export const revalidate = 600;

type VenuesPageProps = {
  searchParams?: Promise<{
    search?: string;
    location?: string;
  }>;
};

function serializeVenues(
  venues: Awaited<ReturnType<typeof eventService.getAllVenues>>
): VenueListItem[] {
  return venues.map((venue) => ({
    id: venue.id,
    name: venue.name,
    slug: venue.slug,
    imageUrl: venue.imageUrl ?? null,
    addressLine1: venue.addressLine1 ?? null,
    addressLine2: venue.addressLine2 ?? null,
    city: venue.city ?? null,
    state: venue.state ?? null,
    postalCode: venue.postalCode ?? null,
    capacity: venue.capacity ?? null,
    eventCount: venue.eventCount ?? 0,
  }));
}

export default async function VenuesPage(props: VenuesPageProps) {
  const resolvedSearchParams = props.searchParams
    ? await props.searchParams
    : undefined;
  const initialSearch =
    typeof resolvedSearchParams?.search === "string"
      ? resolvedSearchParams.search
      : "";
  const initialLocation =
    typeof resolvedSearchParams?.location === "string"
      ? resolvedSearchParams.location
      : "";

  let serializedVenues: VenueListItem[] = [];
  let initialError: string | null = null;

  try {
    const venues = await eventService.getAllVenues();
    serializedVenues = serializeVenues(venues);
  } catch (error) {
    console.error("Failed to load venues", error);
    initialError =
      "Venues are temporarily unavailable. Please try again later.";
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <VenuesBrowser
          initialVenues={serializedVenues}
          initialError={initialError}
          initialSearch={initialSearch}
          initialLocation={initialLocation}
        />
      </main>
    </div>
  );
}
