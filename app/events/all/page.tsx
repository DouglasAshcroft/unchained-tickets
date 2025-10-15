import { Suspense } from "react";

import AllEventsClient from "./AllEventsClient";

export const revalidate = 60;

export default function AllEventsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        <Suspense
          fallback={<div className="text-center py-16">Loading events...</div>}
        >
          <AllEventsClient />
        </Suspense>
      </main>
    </div>
  );
}
