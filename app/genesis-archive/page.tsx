import { Suspense } from 'react';

import GenesisArchiveClient from './GenesisArchiveClient';

export const revalidate = 300; // Revalidate every 5 minutes

export const metadata = {
  title: 'Genesis Archive | Unchained Tickets',
  description: 'The first NFT ticket minted for each event on Unchained. A historical record of our journey, one event at a time.',
};

export default function GenesisArchivePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        <Suspense
          fallback={
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <p className="mt-4 text-gray-600">Loading Genesis Archive...</p>
            </div>
          }
        >
          <GenesisArchiveClient />
        </Suspense>
      </main>
    </div>
  );
}
