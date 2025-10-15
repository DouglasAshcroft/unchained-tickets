import { eventService } from "@/lib/services/EventService";
import ArtistsBrowser, { type ArtistListItem } from "./ArtistsBrowser";

// Enable ISR - revalidate every 10 minutes
export const revalidate = 600;

type ArtistsPageProps = {
  searchParams?: Promise<{
    search?: string;
    genre?: string;
  }>;
};

function serializeArtists(
  artists: Awaited<ReturnType<typeof eventService.getAllArtists>>
): ArtistListItem[] {
  return artists.map((artist) => ({
    id: artist.id,
    name: artist.name,
    slug: artist.slug,
    genre: artist.genre ?? null,
    eventCount: artist.eventCount ?? 0,
  }));
}

export default async function ArtistsPage(props: ArtistsPageProps) {
  const resolvedSearchParams = props.searchParams
    ? await props.searchParams
    : undefined;
  const initialSearch =
    typeof resolvedSearchParams?.search === "string"
      ? resolvedSearchParams.search
      : "";
  const initialGenre =
    typeof resolvedSearchParams?.genre === "string"
      ? resolvedSearchParams.genre
      : "";

  let serializedArtists: ArtistListItem[] = [];
  let initialError: string | null = null;

  try {
    const artists = await eventService.getAllArtists();
    serializedArtists = serializeArtists(artists);
  } catch (error) {
    console.error("Failed to load artists", error);
    initialError =
      "Artists are temporarily unavailable. Please try again later.";
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <ArtistsBrowser
          initialArtists={serializedArtists}
          initialError={initialError}
          initialSearch={initialSearch}
          initialGenre={initialGenre}
        />
      </main>
    </div>
  );
}
