import { PrismaClient, EventStatus, UserRole } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

// Rich seed data
const GENRES = [
  'Electronic', 'House', 'Techno', 'Hip-Hop', 'Jazz', 'Rock',
  'Indie Rock', 'Pop', 'R&B', 'Country', 'Metal', 'Punk',
  'Reggae', 'Blues', 'Folk', 'Classical', 'Synthwave', 'Dream Pop',
  'Psychedelic Rock', 'Funk', 'Soul', 'Disco', 'Alternative'
];

const CITIES = [
  { city: 'Sacramento', state: 'CA', lat: 38.5816, lng: -121.4944 },
  { city: 'San Francisco', state: 'CA', lat: 37.7749, lng: -122.4194 },
  { city: 'Los Angeles', state: 'CA', lat: 34.0522, lng: -118.2437 },
  { city: 'Oakland', state: 'CA', lat: 37.8044, lng: -122.2712 },
  { city: 'San Diego', state: 'CA', lat: 32.7157, lng: -117.1611 },
  { city: 'Portland', state: 'OR', lat: 45.5152, lng: -122.6784 },
  { city: 'Seattle', state: 'WA', lat: 47.6062, lng: -122.3321 },
  { city: 'Denver', state: 'CO', lat: 39.7392, lng: -104.9903 },
  { city: 'Austin', state: 'TX', lat: 30.2672, lng: -97.7431 },
  { city: 'Nashville', state: 'TN', lat: 36.1627, lng: -86.7816 },
  { city: 'Chicago', state: 'IL', lat: 41.8781, lng: -87.6298 },
  { city: 'New York', state: 'NY', lat: 40.7128, lng: -74.0060 },
  { city: 'Brooklyn', state: 'NY', lat: 40.6782, lng: -73.9442 },
  { city: 'Miami', state: 'FL', lat: 25.7617, lng: -80.1918 },
  { city: 'Atlanta', state: 'GA', lat: 33.7490, lng: -84.3880 },
];

const VENUE_NAMES = [
  'Ace of Spades', 'The Fillmore', 'Troubadour', 'Fox Theater', 'Red Rocks Amphitheatre',
  'Crystal Ballroom', 'Neumos', 'Belly Up', 'Emo\'s Austin', 'Ryman Auditorium',
  'Metro Chicago', 'Webster Hall', 'Music Hall of Williamsburg', 'The Gorge',
  'Hollywood Bowl', 'The Wiltern', 'Echoplex', 'Rickshaw Stop', 'Great American Music Hall',
  'Bottom of the Hill', 'Showbox', 'Doug Fir Lounge', 'Revolution Hall', 'Mission Ballroom',
  'Ogden Theatre', 'Bluebird Theater', 'Cain\'s Ballroom', 'Tower Theatre', 'Georgia Theatre',
  'Terminal West', 'The Underground', 'Variety Playhouse', 'Exit/In', 'Basement East'
];

const ARTIST_FIRST = ['Electric', 'Neon', 'Cosmic', 'Shadow', 'Crystal', 'Midnight', 'Sunset', 'Urban', 'Silver', 'Golden', 'Atomic', 'Velvet', 'Diamond', 'Thunder', 'Echo'];
const ARTIST_SECOND = ['Dreams', 'Waves', 'Riders', 'Kings', 'Queens', 'Beats', 'Lights', 'Hearts', 'Souls', 'Minds', 'Stars', 'Moons', 'Suns', 'Fires', 'Waters'];

const EVENT_TITLES = [
  'Summer Tour', 'Winter Wonderland', 'Spring Awakening', 'Fall Festival',
  'Album Release Party', 'Sold Out Show', 'Homecoming Concert', 'Farewell Tour',
  'Reunion Show', 'Anniversary Celebration', '10 Year Tour', 'World Tour',
  'Acoustic Session', 'Electronic Night', 'Jazz Evening', 'Rock Night',
  'Underground Sessions', 'Rooftop Concert', 'Late Night Show', 'Early Bird Special'
];

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Concert-related Unsplash images
const CONCERT_IMAGES = [
  'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&h=1600&fit=crop', // concert crowd
  'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1200&h=1600&fit=crop', // concert stage
  'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1200&h=1600&fit=crop', // DJ/electronic
  'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=1200&h=1600&fit=crop', // concert lights
  'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=1200&h=1600&fit=crop', // concert performer
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&h=1600&fit=crop', // concert stage wide
  'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=1200&h=1600&fit=crop', // live music
  'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=1200&h=1600&fit=crop', // band on stage
  'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=1200&h=1600&fit=crop', // concert crowd hands
  'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=1200&h=1600&fit=crop', // DJ booth
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&h=1600&fit=crop', // guitar player
  'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=1200&h=1600&fit=crop', // outdoor festival
  'https://images.unsplash.com/photo-1509824227185-9c5a01ceba0d?w=1200&h=1600&fit=crop', // rock concert
  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&h=1600&fit=crop', // hip hop concert
  'https://images.unsplash.com/photo-1516981879613-9f5da904015f?w=1200&h=1600&fit=crop', // jazz musician
];

const VENUE_IMAGES = [
  'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=800&h=600&fit=crop', // concert venue interior
  'https://images.unsplash.com/photo-1515169067868-5387ec356754?w=800&h=600&fit=crop', // theater interior
  'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800&h=600&fit=crop', // music hall
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop', // amphitheater
  'https://images.unsplash.com/photo-1563841930606-67e2bce48b78?w=800&h=600&fit=crop', // club interior
  'https://images.unsplash.com/photo-1505905156622-4f23f0522b05?w=800&h=600&fit=crop', // ballroom
  'https://images.unsplash.com/photo-1522798514-97ceb8c4f1c8?w=800&h=600&fit=crop', // stadium
  'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=800&h=600&fit=crop', // modern venue
];

function generatePosterUrl(): string {
  return randomElement(CONCERT_IMAGES);
}

function generateVenueImageUrl(): string {
  return randomElement(VENUE_IMAGES);
}

async function main() {
  console.log('🗑️  Clearing database...\n');

  // Delete in correct order to respect foreign keys
  await prisma.ticket.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.charge.deleteMany();
  await prisma.event.deleteMany();
  await prisma.artist.deleteMany();
  await prisma.venue.deleteMany();
  await prisma.userWallet.deleteMany();
  await prisma.session.deleteMany();
  await prisma.authCredential.deleteMany();
  await prisma.userRoleLink.deleteMany();
  await prisma.user.deleteMany();

  console.log('✓ Database cleared\n');

  // Create users for venues and artists
  console.log('👥 Creating users...\n');

  const venueOwners: any[] = [];
  for (let i = 0; i < 20; i++) {
    const user = await prisma.user.create({
      data: {
        name: `Venue Owner ${i + 1}`,
        email: `venue${i + 1}@unchained.test`,
        role: UserRole.venue,
        credentials: {
          create: {
            provider: 'password',
            identifier: `venue${i + 1}@unchained.test`,
            secret: await hash('password123', 10),
          },
        },
      },
    });
    venueOwners.push(user);
  }

  const artistOwners: any[] = [];
  for (let i = 0; i < 30; i++) {
    const user = await prisma.user.create({
      data: {
        name: `Artist Owner ${i + 1}`,
        email: `artist${i + 1}@unchained.test`,
        role: UserRole.artist,
        credentials: {
          create: {
            provider: 'password',
            identifier: `artist${i + 1}@unchained.test`,
            secret: await hash('password123', 10),
          },
        },
      },
    });
    artistOwners.push(user);
  }

  // Create fan users
  for (let i = 0; i < 10; i++) {
    await prisma.user.create({
      data: {
        name: `Fan ${i + 1}`,
        email: `fan${i + 1}@unchained.test`,
        role: UserRole.fan,
        credentials: {
          create: {
            provider: 'password',
            identifier: `fan${i + 1}@unchained.test`,
            secret: await hash('password123', 10),
          },
        },
      },
    });
  }

  console.log(`✓ Created ${venueOwners.length} venue owners`);
  console.log(`✓ Created ${artistOwners.length} artist owners`);
  console.log('✓ Created 10 fan users\n');

  // Create 50 unique artists
  console.log('🎤 Creating 50 artists...\n');

  const artists: any[] = [];
  for (let i = 0; i < 50; i++) {
    const firstName = randomElement(ARTIST_FIRST);
    const secondName = randomElement(ARTIST_SECOND);
    const name = i < 15 ? `${firstName} ${secondName}` : `The ${firstName} ${secondName}`;
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const genre = randomElement(GENRES);
    const owner = randomElement(artistOwners);

    const artist = await prisma.artist.create({
      data: {
        name,
        slug: `${slug}-${i}`,
        genre,
        ownerUserId: owner.id,
      },
    });

    artists.push(artist);
    console.log(`  ✓ ${name} (${genre})`);
  }

  console.log(`\n✓ Created ${artists.length} artists\n`);

  // Create 34 unique venues
  console.log('🏛️  Creating 34 venues...\n');

  const venues: any[] = [];
  for (let i = 0; i < Math.min(34, VENUE_NAMES.length); i++) {
    const venueName = VENUE_NAMES[i];
    const location = randomElement(CITIES);
    const owner = randomElement(venueOwners);
    const capacity = Math.floor(Math.random() * (5000 - 100) + 100);

    const venue = await prisma.venue.create({
      data: {
        name: venueName,
        slug: venueName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        city: location.city,
        state: location.state,
        addressLine1: `${Math.floor(Math.random() * 9999)} ${randomElement(['Main', 'Market', 'Broadway', 'First', 'Second'])} St`,
        postalCode: String(Math.floor(Math.random() * (99999 - 10000) + 10000)),
        capacity,
        latitude: location.lat.toString(),
        longitude: location.lng.toString(),
        imageUrl: generateVenueImageUrl(),
        ownerUserId: owner.id,
      },
    });

    venues.push(venue);
    console.log(`  ✓ ${venueName} - ${location.city}, ${location.state} (Cap: ${capacity})`);
  }

  console.log(`\n✓ Created ${venues.length} venues\n`);

  // Create 70 events (past, present, future mix)
  console.log('🎫 Creating 70 events (mix of past, present, and future)...\n');

  const now = new Date();
  const pastStart = new Date(now);
  pastStart.setMonth(now.getMonth() - 6); // 6 months ago

  const futureEnd = new Date(now);
  futureEnd.setMonth(now.getMonth() + 6); // 6 months from now

  const events: any[] = [];

  for (let i = 0; i < 70; i++) {
    const artist = randomElement(artists);
    const venue = randomElement(venues);
    const eventTitle = randomElement(EVENT_TITLES);
    const title = `${eventTitle} - ${artist.name}`;

    // Mix of past (20%), present (10%), future (70%)
    let startsAt: Date;
    const rand = Math.random();
    if (rand < 0.2) {
      // Past event (20%)
      startsAt = randomDate(pastStart, new Date(now.getTime() - 24 * 60 * 60 * 1000));
    } else if (rand < 0.3) {
      // Present/upcoming week (10%)
      startsAt = randomDate(now, new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000));
    } else {
      // Future event (70%)
      startsAt = randomDate(new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), futureEnd);
    }

    const endsAt = new Date(startsAt);
    endsAt.setHours(endsAt.getHours() + Math.floor(Math.random() * 3) + 2); // 2-5 hours

    const basePrice = Math.floor(Math.random() * 100) + 20; // $20-$120
    const ticketSupply = Math.floor(Math.random() * 200) + 50; // 50-250 tickets

    // 70% published, 20% draft, 10% completed
    let status: EventStatus;
    if (startsAt < now) {
      status = EventStatus.completed;
    } else if (Math.random() < 0.85) {
      status = EventStatus.published;
    } else {
      status = EventStatus.draft;
    }

    // 15% of future published events are featured
    const isFeatured = status === EventStatus.published && startsAt > now && Math.random() < 0.15;
    const featuredUntil = isFeatured ? new Date(startsAt.getTime() + 30 * 24 * 60 * 60 * 1000) : null;

    const event = await prisma.event.create({
      data: {
        title,
        startsAt,
        endsAt,
        venueId: venue.id,
        artistId: artist.id,
        status,
        posterImageUrl: generatePosterUrl(),
        externalLink: Math.random() < 0.3 ? `https://tickets.${venue.slug}.com` : null,
        mapsLink: `https://www.google.com/maps/search/?api=1&query=${venue.latitude},${venue.longitude}`,
        featured: isFeatured,
        featuredUntil,
        viewCount: Math.floor(Math.random() * 1000),
      },
    });

    // Create ticket types for each event
    const gaPrice = Math.floor(Math.random() * 5000) + 2000; // $20-$70 in cents
    const vipPrice = Math.floor(Math.random() * 10000) + 5000; // $50-$150 in cents
    const gaCapacity = Math.floor((venue.capacity || 500) * 0.7);

    await prisma.eventTicketType.create({
      data: {
        eventId: event.id,
        name: 'General Admission',
        description: 'Standing room access to the show',
        pricingType: 'general_admission',
        priceCents: gaPrice,
        capacity: gaCapacity,
        isActive: true,
      },
    });

    if (Math.random() < 0.5) {
      // 50% of events have VIP tickets
      await prisma.eventTicketType.create({
        data: {
          eventId: event.id,
          name: 'VIP',
          description: 'Premium access with exclusive perks',
          pricingType: 'general_admission',
          priceCents: vipPrice,
          capacity: Math.floor((venue.capacity || 500) * 0.2),
          isActive: true,
        },
      });
    }

    events.push(event);

    const statusEmoji = status === EventStatus.published ? '🟢' : status === EventStatus.completed ? '⚫' : '🟡';
    const featuredEmoji = isFeatured ? '⭐' : '';
    const timeIndicator = startsAt < now ? '(PAST)' : startsAt < new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) ? '(THIS WEEK)' : '(FUTURE)';

    console.log(`  ${statusEmoji}${featuredEmoji} ${title.substring(0, 50)}... - ${venue.name} ${timeIndicator}`);
  }

  console.log(`\n✓ Created ${events.length} events\n`);

  // Create some tickets for past events
  console.log('🎟️  Creating sample tickets for completed events...\n');

  const completedEvents = events.filter(e => e.status === EventStatus.completed);
  const fans = await prisma.user.findMany({ where: { role: UserRole.fan } });

  let ticketCount = 0;
  for (const event of completedEvents.slice(0, 5)) {
    // Get ticket types for this event
    const ticketTypes = await prisma.eventTicketType.findMany({
      where: { eventId: event.id },
    });

    for (let i = 0; i < 3; i++) {
      const fan = randomElement(fans);
      const ticketType = randomElement(ticketTypes);

      await prisma.ticket.create({
        data: {
          eventId: event.id,
          userId: fan.id,
          ticketTypeId: ticketType.id,
          status: 'used',
          priceCents: ticketType.priceCents,
          currency: 'USD',
        },
      });
      ticketCount++;
    }
  }

  console.log(`✓ Created ${ticketCount} sample tickets\n`);

  // Summary
  console.log('═══════════════════════════════════════════════════════');
  console.log('✅ DATABASE SEEDING COMPLETE!');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`👥 Users: ${venueOwners.length + artistOwners.length + 10}`);
  console.log(`   - ${venueOwners.length} venue owners`);
  console.log(`   - ${artistOwners.length} artist owners`);
  console.log(`   - 10 fans`);
  console.log(`🎤 Artists: ${artists.length}`);
  console.log(`🏛️  Venues: ${venues.length}`);
  console.log(`🎫 Events: ${events.length}`);
  console.log(`   - ${events.filter(e => e.status === EventStatus.published).length} published`);
  console.log(`   - ${events.filter(e => e.status === EventStatus.draft).length} draft`);
  console.log(`   - ${events.filter(e => e.status === EventStatus.completed).length} completed`);
  console.log(`   - ${events.filter(e => e.featured).length} featured`);
  console.log(`🎟️  Tickets: ${ticketCount}`);
  console.log('═══════════════════════════════════════════════════════\n');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
