import EventsPageClient from "./EventsPageClient";

// Enable ISR - revalidate every 60 seconds
export const revalidate = 60;

export default async function EventsPage() {
  // Fetch cities list on server side
  const citiesResponse = await fetch(
    `${
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    }/api/events/cities`,
    { next: { revalidate: 600 } } // Cache cities for 10 minutes
  );

  const citiesData = citiesResponse.ok
    ? await citiesResponse.json()
    : { cities: [] };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <EventsPageClient cities={citiesData.cities} />
      </main>
    </div>
  );
}
