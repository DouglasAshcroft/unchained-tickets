import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Roles (including dev role for Phase 1 RBAC)
  const roles = ['fan', 'artist', 'venue', 'admin', 'dev'];
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

  // 25 Venues across different cities with real venue exterior images
  const venuesData = [
    { name: 'Madison Square Garden', slug: 'madison-square-garden', city: 'New York', state: 'NY', capacity: 20000, addressLine1: '4 Pennsylvania Plaza', postalCode: '10001', latitude: 40.7505, longitude: -73.9934, imageUrl: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?q=80&w=800&auto=format&fit=crop' }, // NYC arena exterior
    { name: 'Red Rocks Amphitheatre', slug: 'red-rocks', city: 'Morrison', state: 'CO', capacity: 9525, addressLine1: '18300 W Alameda Pkwy', postalCode: '80465', latitude: 39.6654, longitude: -105.2057, imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=800&auto=format&fit=crop' }, // Red rock formations
    { name: 'Echostage', slug: 'echostage', city: 'Washington', state: 'DC', capacity: 3000, addressLine1: '2135 Queens Chapel Rd NE', postalCode: '20018', latitude: 38.9195, longitude: -76.9788, imageUrl: 'https://images.unsplash.com/photo-1523740856324-f2ce89135981?q=80&w=800&auto=format&fit=crop' }, // Modern venue exterior
    { name: 'The Fillmore', slug: 'the-fillmore', city: 'San Francisco', state: 'CA', capacity: 1315, addressLine1: '1805 Geary Blvd', postalCode: '94115', latitude: 37.7841, longitude: -122.4331, imageUrl: 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?q=80&w=800&auto=format&fit=crop' }, // Historic venue marquee
    { name: 'House of Blues', slug: 'house-of-blues-chicago', city: 'Chicago', state: 'IL', capacity: 1500, addressLine1: '329 N Dearborn St', postalCode: '60654', latitude: 41.8883, longitude: -87.6297, imageUrl: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=800&auto=format&fit=crop' }, // Chicago skyline building
    { name: 'The Gorge Amphitheatre', slug: 'the-gorge', city: 'George', state: 'WA', capacity: 27500, addressLine1: '754 Silica Rd NW', postalCode: '98848', latitude: 47.0989, longitude: -119.2728, imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=800&auto=format&fit=crop' }, // Gorge landscape
    { name: 'Brooklyn Steel', slug: 'brooklyn-steel', city: 'Brooklyn', state: 'NY', capacity: 1800, addressLine1: '319 Frost St', postalCode: '11222', latitude: 40.7267, longitude: -73.9356, imageUrl: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?q=80&w=800&auto=format&fit=crop' }, // Brooklyn building
    { name: 'The Roxy Theatre', slug: 'the-roxy', city: 'Los Angeles', state: 'CA', capacity: 500, addressLine1: '9009 Sunset Blvd', postalCode: '90069', latitude: 34.0901, longitude: -118.3889, imageUrl: 'https://images.unsplash.com/photo-1534430458533-3d0fc5b0b6c4?q=80&w=800&auto=format&fit=crop' }, // LA theater exterior
    { name: 'Stubb\'s BBQ', slug: 'stubbs-bbq', city: 'Austin', state: 'TX', capacity: 2200, addressLine1: '801 Red River St', postalCode: '78701', latitude: 30.2686, longitude: -97.7363, imageUrl: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=800&auto=format&fit=crop' }, // Austin venue
    { name: 'The Tabernacle', slug: 'the-tabernacle', city: 'Atlanta', state: 'GA', capacity: 2600, addressLine1: '152 Luckie St NW', postalCode: '30303', latitude: 33.7601, longitude: -84.3915, imageUrl: 'https://images.unsplash.com/photo-1464207687429-7505649dae38?q=80&w=800&auto=format&fit=crop' }, // Historic building
    { name: 'Exit/In', slug: 'exit-in', city: 'Nashville', state: 'TN', capacity: 500, addressLine1: '2208 Elliston Pl', postalCode: '37203', latitude: 36.1514, longitude: -86.7981, imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=800&auto=format&fit=crop' }, // Nashville venue
    { name: 'The Anthem', slug: 'the-anthem', city: 'Washington', state: 'DC', capacity: 6000, addressLine1: '901 Wharf St SW', postalCode: '20024', latitude: 38.8816, longitude: -77.0219, imageUrl: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=800&auto=format&fit=crop' }, // Waterfront venue
    { name: 'Terminal 5', slug: 'terminal-5', city: 'New York', state: 'NY', capacity: 3000, addressLine1: '610 W 56th St', postalCode: '10019', latitude: 40.7705, longitude: -73.9914, imageUrl: 'https://images.unsplash.com/photo-1513407030348-c983a97b98d8?q=80&w=800&auto=format&fit=crop' }, // NYC building
    { name: 'Revolution Hall', slug: 'revolution-hall', city: 'Portland', state: 'OR', capacity: 850, addressLine1: '1300 SE Stark St', postalCode: '97214', latitude: 45.5195, longitude: -122.6527, imageUrl: 'https://images.unsplash.com/photo-1449157291145-7efd050a4d0e?q=80&w=800&auto=format&fit=crop' }, // Portland venue
    { name: 'The Metro', slug: 'the-metro-chicago', city: 'Chicago', state: 'IL', capacity: 1100, addressLine1: '3730 N Clark St', postalCode: '60613', latitude: 41.9486, longitude: -87.6638, imageUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=800&auto=format&fit=crop' }, // Chicago theater
    { name: 'The Warfield', slug: 'the-warfield', city: 'San Francisco', state: 'CA', capacity: 2300, addressLine1: '982 Market St', postalCode: '94102', latitude: 37.7829, longitude: -122.4105, imageUrl: 'https://images.unsplash.com/photo-1501127122-f385ca6ddd9d?q=80&w=800&auto=format&fit=crop' }, // SF theater
    { name: 'Paradise Rock Club', slug: 'paradise-rock-club', city: 'Boston', state: 'MA', capacity: 933, addressLine1: '967 Commonwealth Ave', postalCode: '02215', latitude: 42.3496, longitude: -71.1052, imageUrl: 'https://images.unsplash.com/photo-1446776899648-aa78eefe8ed0?q=80&w=800&auto=format&fit=crop' }, // Boston venue
    { name: 'First Avenue', slug: 'first-avenue', city: 'Minneapolis', state: 'MN', capacity: 1550, addressLine1: '701 1st Ave N', postalCode: '55403', latitude: 44.9815, longitude: -93.2760, imageUrl: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=800&auto=format&fit=crop' }, // Minneapolis
    { name: 'The Novo', slug: 'the-novo', city: 'Los Angeles', state: 'CA', capacity: 2300, addressLine1: '800 W Olympic Blvd', postalCode: '90015', latitude: 34.0446, longitude: -118.2608, imageUrl: 'https://images.unsplash.com/photo-1446776709462-d6b525c57bd3?q=80&w=800&auto=format&fit=crop' }, // LA venue
    { name: 'White Oak Music Hall', slug: 'white-oak-music-hall', city: 'Houston', state: 'TX', capacity: 3000, addressLine1: '2915 N Main St', postalCode: '77009', latitude: 29.8036, longitude: -95.3783, imageUrl: 'https://images.unsplash.com/photo-1496564203457-11bb12075d90?q=80&w=800&auto=format&fit=crop' }, // Houston venue
    { name: 'The Intersection', slug: 'the-intersection', city: 'Grand Rapids', state: 'MI', capacity: 1200, addressLine1: '133 Grandville Ave SW', postalCode: '49503', latitude: 42.9639, longitude: -85.6681, imageUrl: 'https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?q=80&w=800&auto=format&fit=crop' }, // Michigan venue
    { name: 'Boulder Theater', slug: 'boulder-theater', city: 'Boulder', state: 'CO', capacity: 860, addressLine1: '2032 14th St', postalCode: '80302', latitude: 40.0191, longitude: -105.2766, imageUrl: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?q=80&w=800&auto=format&fit=crop' }, // Boulder theater
    { name: 'The Observatory', slug: 'the-observatory', city: 'Santa Ana', state: 'CA', capacity: 750, addressLine1: '3503 S Harbor Blvd', postalCode: '92704', latitude: 33.7073, longitude: -117.9179, imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=800&auto=format&fit=crop' }, // California venue
    { name: 'Ace of Spades', slug: 'ace-of-spades', city: 'Sacramento', state: 'CA', capacity: 1000, addressLine1: '1417 R St', postalCode: '95811', latitude: 38.5768, longitude: -121.4854, imageUrl: 'https://images.unsplash.com/photo-1485518882345-15568b007407?q=80&w=800&auto=format&fit=crop' }, // Sacramento venue
    { name: 'The Orange Peel', slug: 'the-orange-peel', city: 'Asheville', state: 'NC', capacity: 1050, addressLine1: '101 Biltmore Ave', postalCode: '28801', latitude: 35.5951, longitude: -82.5515, imageUrl: 'https://images.unsplash.com/photo-1475738638766-96be0ca2ff1e?q=80&w=800&auto=format&fit=crop' }, // Asheville venue
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

  // 25 Artists across different genres with genre-appropriate images
  const artistsData = [
    { name: 'Getter', slug: 'getter', genre: 'Electronic', imageUrl: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?q=80&w=800&auto=format&fit=crop' }, // DJ setup
    { name: 'The Church', slug: 'the-church', genre: 'Alternative', imageUrl: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?q=80&w=800&auto=format&fit=crop' }, // Alt band
    { name: 'Bryson Tiller', slug: 'bryson-tiller', genre: 'R&B', imageUrl: 'https://images.unsplash.com/photo-1576525865260-ee8d75babf38?q=80&w=800&auto=format&fit=crop' }, // RnB vocalist
    { name: 'Khruangbin', slug: 'khruangbin', genre: 'Psychedelic Rock', imageUrl: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?q=80&w=800&auto=format&fit=crop' }, // Psych rock band
    { name: 'Anderson .Paak', slug: 'anderson-paak', genre: 'Hip-Hop', imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=800&auto=format&fit=crop' }, // Hip hop performer
    { name: 'Tame Impala', slug: 'tame-impala', genre: 'Psychedelic Rock', imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop' }, // Psychedelic guitarist
    { name: 'Tyler, The Creator', slug: 'tyler-the-creator', genre: 'Hip-Hop', imageUrl: 'https://images.unsplash.com/photo-1598387993281-cecf8b71a8f8?q=80&w=800&auto=format&fit=crop' }, // Rapper on stage
    { name: 'King Gizzard & The Lizard Wizard', slug: 'king-gizzard', genre: 'Psychedelic Rock', imageUrl: 'https://images.unsplash.com/photo-1496293455970-f8581aae0e3b?q=80&w=800&auto=format&fit=crop' }, // Rock band
    { name: 'FKJ', slug: 'fkj', genre: 'Electronic', imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=800&auto=format&fit=crop' }, // Electronic producer
    { name: 'Glass Animals', slug: 'glass-animals', genre: 'Indie Pop', imageUrl: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?q=80&w=800&auto=format&fit=crop' }, // Indie pop band
    { name: 'Daniel Caesar', slug: 'daniel-caesar', genre: 'R&B', imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop' }, // RnB singer
    { name: 'ODESZA', slug: 'odesza', genre: 'Electronic', imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=800&auto=format&fit=crop' }, // Electronic duo
    { name: 'Cigarettes After Sex', slug: 'cigarettes-after-sex', genre: 'Dream Pop', imageUrl: 'https://images.unsplash.com/photo-1520483601200-862a07b20f3c?q=80&w=800&auto=format&fit=crop' }, // Dream pop mood
    { name: 'Mac DeMarco', slug: 'mac-demarco', genre: 'Indie Rock', imageUrl: 'https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?q=80&w=800&auto=format&fit=crop' }, // Indie guitarist
    { name: 'Thundercat', slug: 'thundercat', genre: 'Jazz Fusion', imageUrl: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?q=80&w=800&auto=format&fit=crop' }, // Jazz bassist
    { name: 'The Midnight', slug: 'the-midnight', genre: 'Synthwave', imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800&auto=format&fit=crop' }, // Synthwave duo
    { name: 'Kaytranada', slug: 'kaytranada', genre: 'Electronic', imageUrl: 'https://images.unsplash.com/photo-1598387181032-a3103a2db5b1?q=80&w=800&auto=format&fit=crop' }, // DJ/producer
    { name: 'Still Woozy', slug: 'still-woozy', genre: 'Indie Pop', imageUrl: 'https://images.unsplash.com/photo-1495615080073-6b89c9839ce0?q=80&w=800&auto=format&fit=crop' }, // Indie artist
    { name: 'Flume', slug: 'flume', genre: 'Electronic', imageUrl: 'https://images.unsplash.com/photo-1571931311826-4c2c6b4cbc9c?q=80&w=800&auto=format&fit=crop' }, // Electronic artist
    { name: 'Parcels', slug: 'parcels', genre: 'Disco', imageUrl: 'https://images.unsplash.com/photo-1519074002996-a69e7ac46a42?q=80&w=800&auto=format&fit=crop' }, // Disco band
    { name: 'Rex Orange County', slug: 'rex-orange-county', genre: 'Indie Pop', imageUrl: 'https://images.unsplash.com/photo-1484876065684-b683cf17d276?q=80&w=800&auto=format&fit=crop' }, // Indie pop singer
    { name: 'Blood Orange', slug: 'blood-orange', genre: 'R&B', imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop' }, // RnB artist
    { name: 'BADBADNOTGOOD', slug: 'badbadnotgood', genre: 'Jazz', imageUrl: 'https://images.unsplash.com/photo-1416339442236-8ceb164046f8?q=80&w=800&auto=format&fit=crop' }, // Jazz ensemble
    { name: 'Japanese Breakfast', slug: 'japanese-breakfast', genre: 'Indie Rock', imageUrl: 'https://images.unsplash.com/photo-1487537708572-3c850b5e856e?q=80&w=800&auto=format&fit=crop' }, // Indie rock
    { name: 'Polo & Pan', slug: 'polo-and-pan', genre: 'Electronic', imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=800&auto=format&fit=crop' }, // Electronic duo
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

  // 50 Events spread over 6 months (Oct 2025 - Mar 2026) with varied statuses
  const baseDate = new Date('2025-10-05');
  const statuses = ['draft', 'published', 'canceled', 'completed'];
  const eventTitles = [
    'Midnight Dreams Tour', 'Psychedelic Sunset', 'Electric Paradise', 'Soul Sessions', 'Indie Nights',
    'Bass & Beyond', 'Cosmic Journey', 'Desert Vibes', 'Urban Legends', 'Retro Rewind',
    'Future Sounds', 'Acoustic Evening', 'Dance Revolution', 'Jazz & Chill', 'Rock the Coast',
    'Synthwave Saturday', 'R&B Rendezvous', 'Electronic Evolution', 'Summer Solstice', 'Winter Wonderland',
    'Spring Awakening', 'Autumn Echoes', 'Neon Nights', 'Groove Garden', 'Sound Summit',
    'Moonlight Melodies', 'Starlight Sessions', 'Thunder Road', 'Velvet Underground', 'Crystal Palace',
    'Phoenix Rising', 'Midnight Riders', 'Silver Screen', 'Golden Hour', 'Blue Note Sessions',
    'Red Light District', 'Green Room Sessions', 'Purple Rain Revival', 'Orange Crush', 'Yellow Submarine',
    'Black Cat Lounge', 'White Noise', 'Gray Area', 'Pink Floyd Tribute', 'Brown Sugar',
    'Indigo Dreams', 'Turquoise Tide', 'Crimson & Clover', 'Magenta Madness', 'Amber Waves',
  ];

  // Genre-specific poster images mapped to artist genres
  const genrePosterImages = {
    'Electronic': [
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1200&auto=format&fit=crop', // DJ equipment neon
      'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?q=80&w=1200&auto=format&fit=crop', // Electronic concert
      'https://images.unsplash.com/photo-1598387181032-a3103a2db5b1?q=80&w=1200&auto=format&fit=crop', // Laser show
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=1200&auto=format&fit=crop', // DJ closeup
      'https://images.unsplash.com/photo-1571931311826-4c2c6b4cbc9c?q=80&w=1200&auto=format&fit=crop', // Neon concert
    ],
    'Alternative': [
      'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?q=80&w=1200&auto=format&fit=crop', // Alternative band stage
      'https://images.unsplash.com/photo-1520483601200-862a07b20f3c?q=80&w=1200&auto=format&fit=crop', // Indie concert
      'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?q=80&w=1200&auto=format&fit=crop', // Alt rock vibe
    ],
    'R&B': [
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop', // RnB concert
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1200&auto=format&fit=crop', // Soulful performance
      'https://images.unsplash.com/photo-1576525865260-ee8d75babf38?q=80&w=1200&auto=format&fit=crop', // Vocalist microphone
    ],
    'Psychedelic Rock': [
      'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1200&auto=format&fit=crop', // Psychedelic lights
      'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=1200&auto=format&fit=crop', // Festival crowd
      'https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=1200&auto=format&fit=crop', // Rock concert
    ],
    'Hip-Hop': [
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1200&auto=format&fit=crop', // Hip hop stage
      'https://images.unsplash.com/photo-1598387993281-cecf8b71a8f8?q=80&w=1200&auto=format&fit=crop', // Mic performance
      'https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=1200&auto=format&fit=crop', // Urban concert
    ],
    'Indie Pop': [
      'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?q=80&w=1200&auto=format&fit=crop', // Indie band
      'https://images.unsplash.com/photo-1495615080073-6b89c9839ce0?q=80&w=1200&auto=format&fit=crop', // Small venue
      'https://images.unsplash.com/photo-1484876065684-b683cf17d276?q=80&w=1200&auto=format&fit=crop', // Indie stage
    ],
    'Jazz Fusion': [
      'https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=1200&auto=format&fit=crop', // Jazz performance
      'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?q=80&w=1200&auto=format&fit=crop', // Saxophone closeup
      'https://images.unsplash.com/photo-1477149318784-6faf68aa2a47?q=80&w=1200&auto=format&fit=crop', // Jazz club
    ],
    'Jazz': [
      'https://images.unsplash.com/photo-1519683384663-0be7e4e059ba?q=80&w=1200&auto=format&fit=crop', // Jazz ensemble
      'https://images.unsplash.com/photo-1416339442236-8ceb164046f8?q=80&w=1200&auto=format&fit=crop', // Jazz instruments
      'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?q=80&w=1200&auto=format&fit=crop', // Jazz sax
    ],
    'Dream Pop': [
      'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=1200&auto=format&fit=crop', // Ethereal concert
      'https://images.unsplash.com/photo-1520483601200-862a07b20f3c?q=80&w=1200&auto=format&fit=crop', // Dreamy lights
      'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=1200&auto=format&fit=crop', // Moody stage
    ],
    'Indie Rock': [
      'https://images.unsplash.com/photo-1487537708572-3c850b5e856e?q=80&w=1200&auto=format&fit=crop', // Indie rock band
      'https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?q=80&w=1200&auto=format&fit=crop', // Guitar on stage
      'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?q=80&w=1200&auto=format&fit=crop', // Rock show
    ],
    'Synthwave': [
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200&auto=format&fit=crop', // Retro neon
      'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?q=80&w=1200&auto=format&fit=crop', // Synthwave vibes
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1200&auto=format&fit=crop', // 80s aesthetic
    ],
    'Disco': [
      'https://images.unsplash.com/photo-1519074002996-a69e7ac46a42?q=80&w=1200&auto=format&fit=crop', // Disco ball
      'https://images.unsplash.com/photo-1567593810070-7a3d471af022?q=80&w=1200&auto=format&fit=crop', // Dance floor
      'https://images.unsplash.com/photo-1470229538611-16ba8c7ffbd7?q=80&w=1200&auto=format&fit=crop', // Disco lights
    ],
  };

  // Helper to get genre poster image
  function getPosterForGenre(genre: string, index: number): string {
    const genreImages = genrePosterImages[genre as keyof typeof genrePosterImages] || genrePosterImages['Electronic'];
    return genreImages[index % genreImages.length];
  }

  // Smart event distribution: each venue gets 2-4 events over 6 months
  const usedArtists = new Set<number>(); // Track artist usage to ensure diversity
  const venueEventDates = new Map<number, Set<string>>(); // Track dates per venue to avoid duplicates
  let eventCounter = 0;
  let featuredCounter = 0;
  let posterIndex = 0;

  // Shuffle venues to randomize which get more events
  const shuffledVenues = [...venues].sort(() => Math.random() - 0.5);

  for (const venue of shuffledVenues) {
    if (eventCounter >= 50) break;

    // Each venue gets 2-4 events
    const eventsForVenue = 2 + Math.floor(Math.random() * 3);

    for (let j = 0; j < eventsForVenue && eventCounter < 50; j++) {
      // Select a random artist that hasn't been used with this venue
      const availableArtists = artists.filter(a => !usedArtists.has(a.id));
      const artist = availableArtists.length > 0
        ? availableArtists[Math.floor(Math.random() * availableArtists.length)]
        : artists[Math.floor(Math.random() * artists.length)];

      usedArtists.add(artist.id);
      if (usedArtists.size >= artists.length) usedArtists.clear(); // Reset when all used

      // Generate date ensuring no duplicates at same venue
      let eventDate: Date;
      let dateKey: string;
      let attempts = 0;

      do {
        // Distribute: 30% past (days -60 to -1), 20% current (days 0-14), 50% future (days 15-120)
        const rand = Math.random();
        let daysOffset: number;

        if (rand < 0.3) {
          daysOffset = -60 + Math.floor(Math.random() * 60); // Past
        } else if (rand < 0.5) {
          daysOffset = Math.floor(Math.random() * 15); // Current
        } else {
          daysOffset = 15 + Math.floor(Math.random() * 106); // Future
        }

        eventDate = new Date(baseDate);
        eventDate.setDate(eventDate.getDate() + daysOffset);
        dateKey = eventDate.toISOString().split('T')[0];

        attempts++;
      } while (
        venueEventDates.get(venue.id)?.has(dateKey) &&
        attempts < 10
      );

      // Track this date for this venue
      if (!venueEventDates.has(venue.id)) {
        venueEventDates.set(venue.id, new Set());
      }
      venueEventDates.get(venue.id)!.add(dateKey);

      // Determine status based on date
      let status: 'draft' | 'published' | 'canceled' | 'completed';
      const now = new Date();
      const isPast = eventDate < now;

      if (isPast) {
        status = Math.random() < 0.1 ? 'canceled' : 'completed';
      } else {
        status = Math.random() < 0.1 ? 'draft' : 'published';
      }

      // Random start time between 19:00 and 22:00
      const startHour = 19 + Math.floor(Math.random() * 4);
      eventDate.setHours(startHour, 0, 0, 0);

      const endDate = new Date(eventDate);
      endDate.setHours(startHour + 3, 0, 0, 0); // 3 hour events

      // Spread createdAt dates realistically
      const createdDaysAgo = Math.floor(Math.random() * 90);
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - createdDaysAgo);

      // Mark first 8 published future events as featured
      const isFeatured = status === 'published' && !isPast && featuredCounter < 8;
      if (isFeatured) featuredCounter++;
      const featuredUntil = isFeatured ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null;

      // Get genre-specific poster image
      const posterImageUrl = getPosterForGenre(artist.genre, posterIndex);
      posterIndex++;

      const event = await prisma.event.create({
        data: {
          title: `${eventTitles[eventCounter % eventTitles.length]} - ${artist.name}`,
          startsAt: eventDate,
          endsAt: endDate,
          venueId: venue.id,
          artistId: artist.id,
          status,
          featured: isFeatured,
          featuredUntil,
          externalLink: `https://tickets.unchained.xyz/event-${eventCounter + 1}`,
          mapsLink: `https://www.google.com/maps?q=${encodeURIComponent(venue.name)}`,
          posterImageUrl,
          createdAt: createdAt,
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

      // Create ticket types for each event
      const gaPrice = 3500 + Math.floor(Math.random() * 3000); // $35-$65
      const vipPrice = gaPrice + 2000 + Math.floor(Math.random() * 3000); // +$20-$50 more

      const gaTicketType = await prisma.eventTicketType.create({
        data: {
          eventId: event.id,
          name: 'General Admission',
          description: 'Standard entry to the event',
          pricingType: 'general_admission',
          priceCents: gaPrice,
          currency: 'USD',
          capacity: 100,
          isActive: true,
        },
      });

      const vipTicketType = await prisma.eventTicketType.create({
        data: {
          eventId: event.id,
          name: 'VIP',
          description: 'Premium seating with exclusive perks',
          pricingType: 'general_admission',
          priceCents: vipPrice,
          currency: 'USD',
          capacity: 50,
          isActive: true,
        },
      });

      // Create 20 tickets per event with varied pricing
      for (let k = 1; k <= 20; k++) {
        const isVIP = k > 10;
        const ticketType = isVIP ? vipTicketType : gaTicketType;

        await prisma.ticket.create({
          data: {
            eventId: event.id,
            ticketTypeId: ticketType.id,
            status: 'reserved',
            priceCents: ticketType.priceCents,
            currency: 'USD',
            seatSection: isVIP ? 'VIP' : 'GA',
            seatRow: String.fromCharCode(65 + Math.floor((k - 1) / 5)), // A-D
            seat: String(k),
          },
        });
      }

      eventCounter++;
    }
  }

  console.log(`✅ Created ${eventCounter} events with smart distribution`);

  // Seed venue checklists
  await seedVenueChecklists(venues, admin);

  // Advocacy System Test Data
  await seedAdvocacyTestData();

  console.log('✅ Seed completed!');
  console.log(`📧 Admin user: ${adminEmail}`);
  console.log(`🔑 Admin password: ${adminPassword}`);
  console.log(`🏛️  Created ${venues.length} venues`);
  console.log(`🎤 Created ${artists.length} artists`);
  console.log(`🎫 Created 50 events with 1000 tickets total`);
  console.log(`📅 Event date range: Oct 2025 - Mar 2026`);
  console.log(`🏷️  Event statuses: draft, published, canceled, completed`);
  console.log(`🎯 Created advocacy test data: external events, waitlist, impressions`);
}

async function seedVenueChecklists(venues: any[], adminUser: any) {
  console.log('📋 Seeding venue onboarding checklists...');

  const CHECKLIST_TASKS = ['seat_map', 'poster_workflow', 'staff_accounts', 'payout_details'];

  // Completion patterns: 0%, 25%, 50%, 75%, 100%
  const completionPatterns = [
    [], // 0% complete
    ['seat_map'], // 25% complete
    ['seat_map', 'poster_workflow'], // 50% complete
    ['seat_map', 'poster_workflow', 'staff_accounts'], // 75% complete
    ['seat_map', 'poster_workflow', 'staff_accounts', 'payout_details'], // 100% complete
  ];

  // Distribute completion levels across venues
  for (let i = 0; i < venues.length; i++) {
    const venue = venues[i];
    const patternIndex = i % completionPatterns.length;
    const completedTasks = completionPatterns[patternIndex];

    for (const task of CHECKLIST_TASKS) {
      const isCompleted = completedTasks.includes(task);

      await prisma.venueChecklistStatus.upsert({
        where: {
          venueId_task: {
            venueId: venue.id,
            task: task as any,
          },
        },
        update: {
          completedAt: isCompleted ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) : null,
          completedBy: isCompleted ? adminUser.id : null,
        },
        create: {
          venueId: venue.id,
          task: task as any,
          completedAt: isCompleted ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) : null,
          completedBy: isCompleted ? adminUser.id : null,
        },
      });
    }
  }

  console.log(`✅ Created checklists for ${venues.length} venues with varied completion`);
}

async function seedAdvocacyTestData() {
  console.log('🎯 Seeding advocacy test data...');

  // Mark 5 events as "external" (Serper/Ticketmaster events) for testing
  const events = await prisma.event.findMany({ take: 5, where: { status: 'published' } });

  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    const impressions = Math.floor(Math.random() * 2000) + 500;
    const clickThroughs = Math.floor(impressions * 0.15); // 15% CTR
    const estimatedAdValue = (impressions / 1000 * 5) + (clickThroughs * 0.5);

    await prisma.event.update({
      where: { id: event.id },
      data: {
        eventSource: 'serper',
        originalTicketUrl: `https://www.ticketmaster.com/event/${event.id}`,
        venueContactEmail: `contact@${event.venueId}-venue.com`,
        impressions,
        clickThroughs,
        estimatedAdValue,
        advocacyCount: Math.floor(Math.random() * 50) + 10,
        lastImpressionAt: new Date(),
      },
    });

    // Create sample event impressions
    for (let j = 0; j < Math.min(impressions, 100); j++) {
      await prisma.eventImpression.create({
        data: {
          eventId: event.id,
          sessionId: `test-session-${i}-${j}`,
          referrer: j % 3 === 0 ? 'https://google.com' : null,
          clickedThrough: j < clickThroughs / 10, // Sample of clicks
        },
      });
    }
  }

  // Create test waitlist signups with advocacy activity
  const testEmails = [
    'advocate1@example.com',
    'advocate2@example.com',
    'advocate3@example.com',
    'champion@example.com',
    'legend@example.com',
  ];

  const tiers = ['starter', 'activist', 'activist', 'champion', 'legend'];

  for (let i = 0; i < testEmails.length; i++) {
    const advocacyCount = [1, 5, 8, 20, 75][i];
    const waitlist = await prisma.waitlistSignup.upsert({
      where: { email: testEmails[i] },
      update: {
        advocacyCount,
        totalVenuesReached: advocacyCount,
        currentTier: tiers[i],
      },
      create: {
        email: testEmails[i],
        referralCode: `REF${i + 1}`,
        advocacyCount,
        totalVenuesReached: advocacyCount,
        currentTier: tiers[i],
        confirmedAt: new Date(),
      },
    });

    // Create advocacy requests for each waitlist signup
    for (let j = 0; j < Math.min(advocacyCount, 3); j++) {
      const event = events[j % events.length];
      const venue = await prisma.venue.findUnique({ where: { id: event.venueId } });

      await prisma.advocacyRequest.create({
        data: {
          email: waitlist.email,
          eventId: event.id,
          venueName: venue!.name,
          venueEmail: `contact@${venue!.slug}.com`,
          userMessage: 'I would love to see fair ticketing at this venue!',
          emailSent: j < 2, // First 2 sent, rest pending
          sentAt: j < 2 ? new Date() : null,
        },
      });
    }
  }

  // Create venue marketing value aggregates
  const venues = await prisma.venue.findMany({ take: 5 });
  for (const venue of venues) {
    const venueEvents = await prisma.event.findMany({
      where: { venueId: venue.id, eventSource: 'serper' },
    });

    const totalImpressions = venueEvents.reduce((sum, e) => sum + e.impressions, 0);
    const totalClicks = venueEvents.reduce((sum, e) => sum + e.clickThroughs, 0);
    const totalAdvocates = venueEvents.reduce((sum, e) => sum + e.advocacyCount, 0);
    const estimatedAdValue = (totalImpressions / 1000 * 5) + (totalClicks * 0.5);

    if (totalImpressions > 0) {
      await prisma.venueMarketingValue.upsert({
        where: { venueName: venue.name },
        update: {
          totalImpressions,
          totalClicks,
          totalAdvocates,
          estimatedAdValue,
          weeklyImpressions: Math.floor(totalImpressions * 0.3),
          monthlyImpressions: totalImpressions,
          lastUpdated: new Date(),
        },
        create: {
          venueName: venue.name,
          venueEmail: `contact@${venue.slug}.com`,
          totalImpressions,
          totalClicks,
          totalAdvocates,
          estimatedAdValue,
          weeklyImpressions: Math.floor(totalImpressions * 0.3),
          monthlyImpressions: totalImpressions,
        },
      });
    }
  }

  console.log('✅ Advocacy test data seeded!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
