import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Creating artists with genres...');

  // Create diverse artists with different genres
  const artists = [
    { name: 'Getter', slug: 'getter', genre: 'Electronic', bio: 'Electronic music producer' },
    { name: 'The Church', slug: 'the-church', genre: 'Psychedelic Rock', bio: 'Australian rock band' },
    { name: 'Neon Dreams', slug: 'neon-dreams', genre: 'Synthwave', bio: 'Synthwave artist' },
    { name: 'Bass Legion', slug: 'bass-legion', genre: 'Electronic', bio: 'Bass music collective' },
    { name: 'Jazz Fusion Collective', slug: 'jazz-fusion', genre: 'Jazz', bio: 'Modern jazz ensemble' },
    { name: 'Indie Waves', slug: 'indie-waves', genre: 'Indie Rock', bio: 'Indie rock band' },
    { name: 'Hip Hop Alliance', slug: 'hiphop-alliance', genre: 'Hip-Hop', bio: 'Hip hop artists' },
    { name: 'Dream Pop Orchestra', slug: 'dream-pop-orch', genre: 'Dream Pop', bio: 'Dream pop band' },
  ];

  for (const artistData of artists) {
    await prisma.artist.upsert({
      where: { slug: artistData.slug },
      update: artistData,
      create: artistData,
    });
    console.log(`✓ Created artist: ${artistData.name} (${artistData.genre})`);
  }

  console.log('\nAssigning artists to events...');

  // Get all events
  const events = await prisma.event.findMany({
    select: { id: true, title: true, artistId: true },
    orderBy: { id: 'asc' },
  });

  console.log(`Found ${events.length} events`);

  // Get all artists we just created
  const createdArtists = await prisma.artist.findMany({
    select: { id: true, name: true, slug: true, genre: true },
  });

  // Assign artists to events in a round-robin fashion
  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    const artist = createdArtists[i % createdArtists.length];

    await prisma.event.update({
      where: { id: event.id },
      data: { artistId: artist.id },
    });

    console.log(`✓ Assigned "${artist.name}" (${artist.genre}) to event #${event.id}: "${event.title}"`);
  }

  // Mark some events as featured
  const featuredEventIds = events.slice(0, 3).map((e) => e.id);
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 30); // Featured for 30 days

  for (const eventId of featuredEventIds) {
    await prisma.event.update({
      where: { id: eventId },
      data: {
        featured: true,
        featuredUntil: futureDate,
      },
    });
    console.log(`✓ Marked event #${eventId} as featured`);
  }

  console.log('\n✅ Done! Artists created and assigned to events.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
