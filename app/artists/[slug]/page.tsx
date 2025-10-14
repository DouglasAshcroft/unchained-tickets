import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import EventCard from '@/components/EventCard';
import { FavoriteArtistButton } from '@/components/FavoriteArtistButton';
import { eventService } from '@/lib/services/EventService';
import { cookies } from 'next/headers';
import { authService } from '@/lib/services/AuthService';
import { prisma } from '@/lib/db/prisma';

type ArtistDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ArtistDetailPage(props: ArtistDetailPageProps) {
  const { slug } = await props.params;

  try {
    const { artist, events } = await eventService.getArtistWithEvents(slug);

    // Check if current user has favorited this artist
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    let isFavorite = false;
    let userId: number | null = null;

    if (token) {
      try {
        const payload = authService.verifyToken(token);
        userId = payload.sub;
        const favorite = await prisma.favoriteArtist.findUnique({
          where: {
            userId_artistId: {
              userId,
              artistId: artist.id,
            },
          },
        });
        isFavorite = !!favorite;
      } catch {
        // Token invalid or expired, user is not authenticated
      }
    }

    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />

        <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
          <Link href="/artists" className="inline-flex items-center text-acid-400 hover:brightness-110 mb-6 transition-all">
            ← Back to Artists
          </Link>

          <div className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <h1 className="brand-heading text-4xl font-bold mb-3 bg-gradient-to-r from-resistance-500 via-hack-green to-acid-400 bg-clip-text text-transparent">
                {artist.name}
              </h1>
              <FavoriteArtistButton
                artistId={artist.id}
                artistName={artist.name}
                initialIsFavorite={isFavorite}
              />
            </div>

            <div className="flex flex-wrap gap-4 text-grit-300">
              {artist.genre && (
                <div className="flex items-center gap-2">
                  <span className="text-xl">🎵</span>
                  <span className="capitalize">{artist.genre}</span>
                </div>
              )}
              {/* TODO: Add website field to Artist schema in Phase 3.3 */}
            </div>

            {/* TODO Phase 3.3: Add bio, website, spotifyUrl, instagramHandle, twitterHandle fields to Artist schema */}
          </div>

          <section>
            <h2 className="text-2xl font-bold mb-6">
              {events.length > 0 ? 'Upcoming Shows' : 'No Upcoming Shows'}
            </h2>

            {events.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <p className="text-grit-400">No upcoming shows for this artist.</p>
                <Link href="/events" className="mt-4 inline-block">
                  <Button>Browse All Events</Button>
                </Link>
              </Card>
            )}
          </section>
        </main>

        <Footer />
      </div>
    );
  } catch (error) {
    console.error('Artist not found', error);
    notFound();
  }
}
