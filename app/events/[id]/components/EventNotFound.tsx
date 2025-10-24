import Link from 'next/link';
import { Card } from '@/components/ui/Card';

export function EventNotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
        <Card className="text-center py-12">
          <h2 className="brand-heading text-2xl mb-4">Event Not Found</h2>
          <p className="text-grit-300 mb-6">
            This event could not be found or has been removed.
          </p>
          <Link href="/events" className="inline-flex">
            <span className="px-4 py-2 rounded-lg border border-acid-400 text-acid-400 hover:bg-acid-400/10 transition-colors">
              Back to Events
            </span>
          </Link>
        </Card>
      </main>
    </div>
  );
}
