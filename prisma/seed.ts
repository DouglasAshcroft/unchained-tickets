import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Roles
  const roles = ['fan', 'artist', 'venue', 'admin'];
  const roleRecords: Record<string, any> = {};
  for (const name of roles) {
    roleRecords[name] = await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // Permissions
  const permissions = ['event.read', 'event.write', 'ticket.scan', 'payout.manage'];
  const permRecords: Record<string, any> = {};
  for (const name of permissions) {
    permRecords[name] = await prisma.permission.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // Admin maps to all permissions
  for (const p of Object.values(permRecords)) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: roleRecords.admin.id, permissionId: p.id } },
      update: {},
      create: { roleId: roleRecords.admin.id, permissionId: p.id },
    });
  }

  // Admin user
  const adminEmail = 'admin@unchained.xyz';
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: 'admin' },
    create: { email: adminEmail, name: 'Admin', role: 'admin' },
  });
  await prisma.userRoleLink.upsert({
    where: { userId_roleId: { userId: admin.id, roleId: roleRecords.admin.id } },
    update: {},
    create: { userId: admin.id, roleId: roleRecords.admin.id },
  });

  // Password credential for admin (REQUIRES ADMIN_PASSWORD env var)
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    throw new Error(
      '🔒 ADMIN_PASSWORD environment variable is required for security.\n' +
      '   Generate a secure password and set it in your .env file:\n' +
      '   ADMIN_PASSWORD="your-secure-password-here"'
    );
  }
  const passwordHash = await bcrypt.hash(adminPassword, 12);
  await prisma.authCredential.upsert({
    where: { userId_provider: { userId: admin.id, provider: 'password' } },
    update: { secret: passwordHash },
    create: { userId: admin.id, provider: 'password', identifier: adminEmail, secret: passwordHash },
  });

  // 25 Venues across different cities with unique venue images
  const venuesData = [
    { name: 'Madison Square Garden', slug: 'madison-square-garden', city: 'New York', state: 'NY', capacity: 20000, addressLine1: '4 Pennsylvania Plaza', postalCode: '10001', latitude: 40.7505, longitude: -73.9934, imageUrl: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=800&auto=format&fit=crop' },
    { name: 'Red Rocks Amphitheatre', slug: 'red-rocks', city: 'Morrison', state: 'CO', capacity: 9525, addressLine1: '18300 W Alameda Pkwy', postalCode: '80465', latitude: 39.6654, longitude: -105.2057, imageUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=800&auto=format&fit=crop' },
    { name: 'Echostage', slug: 'echostage', city: 'Washington', state: 'DC', capacity: 3000, addressLine1: '2135 Queens Chapel Rd NE', postalCode: '20018', latitude: 38.9195, longitude: -76.9788, imageUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=800&auto=format&fit=crop' },
    { name: 'The Fillmore', slug: 'the-fillmore', city: 'San Francisco', state: 'CA', capacity: 1315, addressLine1: '1805 Geary Blvd', postalCode: '94115', latitude: 37.7841, longitude: -122.4331, imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop' },
    { name: 'House of Blues', slug: 'house-of-blues-chicago', city: 'Chicago', state: 'IL', capacity: 1500, addressLine1: '329 N Dearborn St', postalCode: '60654', latitude: 41.8883, longitude: -87.6297, imageUrl: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?q=80&w=800&auto=format&fit=crop' },
    { name: 'The Gorge Amphitheatre', slug: 'the-gorge', city: 'George', state: 'WA', capacity: 27500, addressLine1: '754 Silica Rd NW', postalCode: '98848', latitude: 47.0989, longitude: -119.2728, imageUrl: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=800&auto=format&fit=crop' },
    { name: 'Brooklyn Steel', slug: 'brooklyn-steel', city: 'Brooklyn', state: 'NY', capacity: 1800, addressLine1: '319 Frost St', postalCode: '11222', latitude: 40.7267, longitude: -73.9356, imageUrl: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=800&auto=format&fit=crop' },
    { name: 'The Roxy Theatre', slug: 'the-roxy', city: 'Los Angeles', state: 'CA', capacity: 500, addressLine1: '9009 Sunset Blvd', postalCode: '90069', latitude: 34.0901, longitude: -118.3889, imageUrl: 'https://images.unsplash.com/photo-1519074002996-a69e7ac46a42?q=80&w=800&auto=format&fit=crop' },
    { name: 'Stubb\'s BBQ', slug: 'stubbs-bbq', city: 'Austin', state: 'TX', capacity: 2200, addressLine1: '801 Red River St', postalCode: '78701', latitude: 30.2686, longitude: -97.7363, imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800&auto=format&fit=crop' },
    { name: 'The Tabernacle', slug: 'the-tabernacle', city: 'Atlanta', state: 'GA', capacity: 2600, addressLine1: '152 Luckie St NW', postalCode: '30303', latitude: 33.7601, longitude: -84.3915, imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=800&auto=format&fit=crop' },
    { name: 'Exit/In', slug: 'exit-in', city: 'Nashville', state: 'TN', capacity: 500, addressLine1: '2208 Elliston Pl', postalCode: '37203', latitude: 36.1514, longitude: -86.7981, imageUrl: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?q=80&w=800&auto=format&fit=crop' },
    { name: 'The Anthem', slug: 'the-anthem', city: 'Washington', state: 'DC', capacity: 6000, addressLine1: '901 Wharf St SW', postalCode: '20024', latitude: 38.8816, longitude: -77.0219, imageUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=800&auto=format&fit=crop' },
    { name: 'Terminal 5', slug: 'terminal-5', city: 'New York', state: 'NY', capacity: 3000, addressLine1: '610 W 56th St', postalCode: '10019', latitude: 40.7705, longitude: -73.9914, imageUrl: 'https://images.unsplash.com/photo-1598387993281-cecf8b71a8f8?q=80&w=800&auto=format&fit=crop' },
    { name: 'Revolution Hall', slug: 'revolution-hall', city: 'Portland', state: 'OR', capacity: 850, addressLine1: '1300 SE Stark St', postalCode: '97214', latitude: 45.5195, longitude: -122.6527, imageUrl: 'https://images.unsplash.com/photo-1567593810070-7a3d471af022?q=80&w=800&auto=format&fit=crop' },
    { name: 'The Metro', slug: 'the-metro-chicago', city: 'Chicago', state: 'IL', capacity: 1100, addressLine1: '3730 N Clark St', postalCode: '60613', latitude: 41.9486, longitude: -87.6638, imageUrl: 'https://images.unsplash.com/photo-1470229538611-16ba8c7ffbd7?q=80&w=800&auto=format&fit=crop' },
    { name: 'The Warfield', slug: 'the-warfield', city: 'San Francisco', state: 'CA', capacity: 2300, addressLine1: '982 Market St', postalCode: '94102', latitude: 37.7829, longitude: -122.4105, imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop' },
    { name: 'Paradise Rock Club', slug: 'paradise-rock-club', city: 'Boston', state: 'MA', capacity: 933, addressLine1: '967 Commonwealth Ave', postalCode: '02215', latitude: 42.3496, longitude: -71.1052, imageUrl: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?q=80&w=800&auto=format&fit=crop' },
    { name: 'First Avenue', slug: 'first-avenue', city: 'Minneapolis', state: 'MN', capacity: 1550, addressLine1: '701 1st Ave N', postalCode: '55403', latitude: 44.9815, longitude: -93.2760, imageUrl: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=800&auto=format&fit=crop' },
    { name: 'The Novo', slug: 'the-novo', city: 'Los Angeles', state: 'CA', capacity: 2300, addressLine1: '800 W Olympic Blvd', postalCode: '90015', latitude: 34.0446, longitude: -118.2608, imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=800&auto=format&fit=crop' },
    { name: 'White Oak Music Hall', slug: 'white-oak-music-hall', city: 'Houston', state: 'TX', capacity: 3000, addressLine1: '2915 N Main St', postalCode: '77009', latitude: 29.8036, longitude: -95.3783, imageUrl: 'https://images.unsplash.com/photo-1565035010268-a3816f98589a?q=80&w=800&auto=format&fit=crop' },
    { name: 'The Intersection', slug: 'the-intersection', city: 'Grand Rapids', state: 'MI', capacity: 1200, addressLine1: '133 Grandville Ave SW', postalCode: '49503', latitude: 42.9639, longitude: -85.6681, imageUrl: 'https://images.unsplash.com/photo-1484876065684-b683cf17d276?q=80&w=800&auto=format&fit=crop' },
    { name: 'Boulder Theater', slug: 'boulder-theater', city: 'Boulder', state: 'CO', capacity: 860, addressLine1: '2032 14th St', postalCode: '80302', latitude: 40.0191, longitude: -105.2766, imageUrl: 'https://images.unsplash.com/photo-1477149318784-6faf68aa2a47?q=80&w=800&auto=format&fit=crop' },
    { name: 'The Observatory', slug: 'the-observatory', city: 'Santa Ana', state: 'CA', capacity: 750, addressLine1: '3503 S Harbor Blvd', postalCode: '92704', latitude: 33.7073, longitude: -117.9179, imageUrl: 'https://images.unsplash.com/photo-1519683384663-0be7e4e059ba?q=80&w=800&auto=format&fit=crop' },
    { name: 'Ace of Spades', slug: 'ace-of-spades', city: 'Sacramento', state: 'CA', capacity: 1000, addressLine1: '1417 R St', postalCode: '95811', latitude: 38.5768, longitude: -121.4854, imageUrl: 'https://images.unsplash.com/photo-1487537708572-3c850b5e856e?q=80&w=800&auto=format&fit=crop' },
    { name: 'The Orange Peel', slug: 'the-orange-peel', city: 'Asheville', state: 'NC', capacity: 1050, addressLine1: '101 Biltmore Ave', postalCode: '28801', latitude: 35.5951, longitude: -82.5515, imageUrl: 'https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?q=80&w=800&auto=format&fit=crop' },
  ];

  const venues: any[] = [];
  for (const v of venuesData) {
    const venue = await prisma.venue.upsert({
      where: { slug: v.slug },
      update: {},
      create: v,
    });
    venues.push(venue);
  }

  // 25 Artists across different genres with unique artist images
  const artistsData = [
    { name: 'Getter', slug: 'getter', genre: 'Electronic', imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=800&auto=format&fit=crop' },
    { name: 'The Church', slug: 'the-church', genre: 'Alternative', imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=800&auto=format&fit=crop' },
    { name: 'Bryson Tiller', slug: 'bryson-tiller', genre: 'R&B', imageUrl: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?q=80&w=800&auto=format&fit=crop' },
    { name: 'Khruangbin', slug: 'khruangbin', genre: 'Psychedelic Rock', imageUrl: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?q=80&w=800&auto=format&fit=crop' },
    { name: 'Anderson .Paak', slug: 'anderson-paak', genre: 'Hip-Hop', imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=800&auto=format&fit=crop' },
    { name: 'Tame Impala', slug: 'tame-impala', genre: 'Psychedelic Rock', imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop' },
    { name: 'Tyler, The Creator', slug: 'tyler-the-creator', genre: 'Hip-Hop', imageUrl: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=800&auto=format&fit=crop' },
    { name: 'King Gizzard & The Lizard Wizard', slug: 'king-gizzard', genre: 'Psychedelic Rock', imageUrl: 'https://images.unsplash.com/photo-1496293455970-f8581aae0e3b?q=80&w=800&auto=format&fit=crop' },
    { name: 'FKJ', slug: 'fkj', genre: 'Electronic', imageUrl: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?q=80&w=800&auto=format&fit=crop' },
    { name: 'Glass Animals', slug: 'glass-animals', genre: 'Indie Pop', imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop' },
    { name: 'Daniel Caesar', slug: 'daniel-caesar', genre: 'R&B', imageUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=800&auto=format&fit=crop' },
    { name: 'ODESZA', slug: 'odesza', genre: 'Electronic', imageUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=800&auto=format&fit=crop' },
    { name: 'Cigarettes After Sex', slug: 'cigarettes-after-sex', genre: 'Dream Pop', imageUrl: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?q=80&w=800&auto=format&fit=crop' },
    { name: 'Mac DeMarco', slug: 'mac-demarco', genre: 'Indie Rock', imageUrl: 'https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?q=80&w=800&auto=format&fit=crop' },
    { name: 'Thundercat', slug: 'thundercat', genre: 'Jazz Fusion', imageUrl: 'https://images.unsplash.com/photo-1477149318784-6faf68aa2a47?q=80&w=800&auto=format&fit=crop' },
    { name: 'The Midnight', slug: 'the-midnight', genre: 'Synthwave', imageUrl: 'https://images.unsplash.com/photo-1487537708572-3c850b5e856e?q=80&w=800&auto=format&fit=crop' },
    { name: 'Kaytranada', slug: 'kaytranada', genre: 'Electronic', imageUrl: 'https://images.unsplash.com/photo-1494232410401-ad00d5433cfa?q=80&w=800&auto=format&fit=crop' },
    { name: 'Still Woozy', slug: 'still-woozy', genre: 'Indie Pop', imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=800&auto=format&fit=crop' },
    { name: 'Flume', slug: 'flume', genre: 'Electronic', imageUrl: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?q=80&w=800&auto=format&fit=crop' },
    { name: 'Parcels', slug: 'parcels', genre: 'Disco', imageUrl: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?q=80&w=800&auto=format&fit=crop' },
    { name: 'Rex Orange County', slug: 'rex-orange-county', genre: 'Indie Pop', imageUrl: 'https://images.unsplash.com/photo-1484876065684-b683cf17d276?q=80&w=800&auto=format&fit=crop' },
    { name: 'Blood Orange', slug: 'blood-orange', genre: 'R&B', imageUrl: 'https://images.unsplash.com/photo-1565035010268-a3816f98589a?q=80&w=800&auto=format&fit=crop' },
    { name: 'BADBADNOTGOOD', slug: 'badbadnotgood', genre: 'Jazz', imageUrl: 'https://images.unsplash.com/photo-1598387993281-cecf8b71a8f8?q=80&w=800&auto=format&fit=crop' },
    { name: 'Japanese Breakfast', slug: 'japanese-breakfast', genre: 'Indie Rock', imageUrl: 'https://images.unsplash.com/photo-1567593810070-7a3d471af022?q=80&w=800&auto=format&fit=crop' },
    { name: 'Polo & Pan', slug: 'polo-and-pan', genre: 'Electronic', imageUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=800&auto=format&fit=crop' },
  ];

  const artists: any[] = [];
  for (const a of artistsData) {
    const artist = await prisma.artist.upsert({
      where: { slug: a.slug },
      update: {},
      create: a,
    });
    artists.push(artist);
  }

  // Helper function to get random item from array
  const random = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  // 25 Events spread over 6 months (Oct 2025 - Mar 2026) with varied statuses
  const baseDate = new Date('2025-10-05');
  const statuses = ['draft', 'published', 'canceled', 'completed'];
  const eventTitles = [
    'Midnight Dreams Tour',
    'Psychedelic Sunset',
    'Electric Paradise',
    'Soul Sessions',
    'Indie Nights',
    'Bass & Beyond',
    'Cosmic Journey',
    'Desert Vibes',
    'Urban Legends',
    'Retro Rewind',
    'Future Sounds',
    'Acoustic Evening',
    'Dance Revolution',
    'Jazz & Chill',
    'Rock the Coast',
    'Synthwave Saturday',
    'R&B Rendezvous',
    'Electronic Evolution',
    'Summer Solstice',
    'Winter Wonderland',
    'Spring Awakening',
    'Autumn Echoes',
    'Neon Nights',
    'Groove Garden',
    'Sound Summit',
  ];

  // 25 unique event poster images
  const posterImages = [
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1519074002996-a69e7ac46a42?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1598387993281-cecf8b71a8f8?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1567593810070-7a3d471af022?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1470229538611-16ba8c7ffbd7?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1565035010268-a3816f98589a?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1484876065684-b683cf17d276?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1477149318784-6faf68aa2a47?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1519683384663-0be7e4e059ba?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1487537708572-3c850b5e856e?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=1200&auto=format&fit=crop',
  ];

  for (let i = 0; i < 25; i++) {
    const venue = venues[i];
    const artist = artists[i];

    // Spread events over 6 months (180 days)
    const daysOffset = Math.floor(i * (180 / 25));
    const eventDate = new Date(baseDate);
    eventDate.setDate(eventDate.getDate() + daysOffset);

    // Determine status based on date
    let status: 'draft' | 'published' | 'canceled' | 'completed';
    const now = new Date();
    const isPast = eventDate < now;

    if (isPast) {
      status = i % 7 === 0 ? 'canceled' : 'completed';
    } else {
      status = i % 10 === 0 ? 'draft' : 'published';
    }

    // Random start time between 19:00 and 22:00
    const startHour = 19 + Math.floor(Math.random() * 4);
    eventDate.setHours(startHour, 0, 0, 0);

    const endDate = new Date(eventDate);
    endDate.setHours(startHour + 3, 0, 0, 0); // 3 hour events

    // Spread createdAt dates over past 90 days for realistic "New" badge distribution
    // First ~3 events will be within 7 days (show "New" badge)
    // Remaining events will be older (no "New" badge)
    const createdDaysAgo = Math.floor(i * (90 / 25)); // 0-90 days ago
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - createdDaysAgo);

    const event = await prisma.event.create({
      data: {
        title: `${eventTitles[i]} - ${artist.name}`,
        startsAt: eventDate,
        endsAt: endDate,
        venueId: venue.id,
        status,
        externalLink: `https://tickets.unchained.xyz/event-${i + 1}`,
        mapsLink: `https://www.google.com/maps?q=${encodeURIComponent(venue.name)}`,
        posterImageUrl: posterImages[i], // Use unique image per event
        createdAt: createdAt, // Set realistic creation date
      },
    });

    await prisma.eventArtist.create({
      data: {
        eventId: event.id,
        artistId: artist.id,
        isPrimary: true,
        sortOrder: 1,
      },
    });

    // Create 20 tickets per event with varied pricing
    const basePrice = 3500 + Math.floor(Math.random() * 7000); // $35-$105
    for (let j = 1; j <= 20; j++) {
      await prisma.ticket.create({
        data: {
          eventId: event.id,
          status: 'reserved',
          priceCents: basePrice,
          currency: 'USD',
          seatSection: j <= 10 ? 'GA' : 'VIP',
          seatRow: String.fromCharCode(65 + Math.floor((j - 1) / 5)), // A-D
          seat: String(j),
        },
      });
    }
  }

  console.log('✅ Seed completed!');
  console.log(`📧 Admin user: ${adminEmail}`);
  console.log(`🔑 Admin password: ${adminPassword}`);
  console.log(`🏛️  Created ${venues.length} venues`);
  console.log(`🎤 Created ${artists.length} artists`);
  console.log(`🎫 Created 25 events with 500 tickets total`);
  console.log(`📅 Event date range: Oct 2025 - Mar 2026`);
  console.log(`🏷️  Event statuses: draft, published, canceled, completed`);
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
