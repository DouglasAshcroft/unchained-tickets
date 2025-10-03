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

  // Password credential for admin
  const adminPassword = process.env.ADMIN_PASSWORD || 'TempPass123!';
  if (!process.env.ADMIN_PASSWORD) {
    console.warn('⚠️  ADMIN_PASSWORD not set. Using temporary password: TempPass123!');
  }
  const passwordHash = await bcrypt.hash(adminPassword, 12);
  await prisma.authCredential.upsert({
    where: { userId_provider: { userId: admin.id, provider: 'password' } },
    update: { secret: passwordHash },
    create: { userId: admin.id, provider: 'password', identifier: adminEmail, secret: passwordHash },
  });

  // Venues
  const venue = await prisma.venue.upsert({
    where: { slug: 'echostage' },
    update: {},
    create: {
      name: 'Echostage',
      slug: 'echostage',
      city: 'Washington',
      state: 'DC',
      capacity: 3000,
      addressLine1: '2135 Queens Chapel Rd NE',
      postalCode: '20018',
      latitude: 38.9195,
      longitude: -76.9788,
    },
  });

  const msg = await prisma.venue.upsert({
    where: { slug: 'madison-square-garden' },
    update: {},
    create: {
      name: 'Madison Square Garden',
      slug: 'madison-square-garden',
      city: 'New York',
      state: 'NY',
      capacity: 20000,
      addressLine1: '4 Pennsylvania Plaza',
      postalCode: '10001',
      latitude: 40.7505,
      longitude: -73.9934,
    },
  });

  const redRocks = await prisma.venue.upsert({
    where: { slug: 'red-rocks' },
    update: {},
    create: {
      name: 'Red Rocks Amphitheatre',
      slug: 'red-rocks',
      city: 'Morrison',
      state: 'CO',
      capacity: 9525,
      addressLine1: '18300 W Alameda Pkwy',
      postalCode: '80465',
      latitude: 39.6654,
      longitude: -105.2057,
    },
  });

  // Artists
  const getter = await prisma.artist.upsert({
    where: { slug: 'getter' },
    update: {},
    create: { name: 'Getter', slug: 'getter', genre: 'Electronic' },
  });

  const theChurch = await prisma.artist.upsert({
    where: { slug: 'the-church' },
    update: {},
    create: { name: 'The Church', slug: 'the-church', genre: 'Alternative' },
  });

  const brysonTiller = await prisma.artist.upsert({
    where: { slug: 'bryson-tiller' },
    update: {},
    create: { name: 'Bryson Tiller', slug: 'bryson-tiller', genre: 'R&B' },
  });

  // Events
  const events = [
    {
      title: 'Getter @ Echostage',
      startsAt: '2025-08-09T22:00:00-04:00',
      endsAt: '2025-08-10T01:00:00-04:00',
      venueId: venue.id,
      artistId: getter.id,
      status: 'published' as const,
      externalLink: 'https://echostage.com',
      mapsLink: 'https://www.google.com/maps?q=Echostage+DC',
      posterImageUrl:
        'https://images.unsplash.com/photo-1519074002996-a69e7ac46a42?q=80&w=1200&auto=format&fit=crop',
    },
    {
      title: 'The Church – The Singles 1980–2025',
      startsAt: '2025-08-06T19:00:00-04:00',
      endsAt: '2025-08-06T22:00:00-04:00',
      venueId: msg.id,
      artistId: theChurch.id,
      status: 'published' as const,
      externalLink: 'https://www.axs.com/events/902392/the-church-tickets',
      mapsLink: 'https://www.google.com/maps?q=Madison+Square+Garden',
      posterImageUrl:
        'https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=1200&auto=format&fit=crop',
    },
    {
      title: 'Bryson Tiller w/ Summer Walker',
      startsAt: '2025-08-10T19:00:00-04:00',
      endsAt: '2025-08-11T01:00:00-04:00',
      venueId: msg.id,
      artistId: brysonTiller.id,
      status: 'published' as const,
      externalLink: 'https://open.spotify.com/concert/4XUskwc2kEgaNj7W2ALwsu',
      mapsLink: 'https://www.google.com/maps?q=Madison+Square+Garden',
      posterImageUrl:
        'https://images.unsplash.com/photo-1464375117522-1311d275e1b0?q=80&w=1200&auto=format&fit=crop',
    },
    {
      title: 'EDM Summer Bash',
      startsAt: '2025-08-22T21:30:00-06:00',
      endsAt: '2025-08-23T01:30:00-06:00',
      venueId: redRocks.id,
      artistId: getter.id,
      status: 'published' as const,
      externalLink: 'https://redrocksonline.com',
      mapsLink: 'https://www.google.com/maps?q=Red+Rocks+Amphitheatre',
      posterImageUrl:
        'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop',
    },
    {
      title: 'Symphonic Nights',
      startsAt: '2025-10-01T19:00:00-07:00',
      endsAt: '2025-10-01T22:00:00-07:00',
      venueId: redRocks.id,
      artistId: theChurch.id,
      status: 'published' as const,
      externalLink: 'https://example.com/symphonic-nights',
      mapsLink: 'https://www.google.com/maps?q=Red+Rocks+Amphitheatre',
      posterImageUrl:
        'https://images.unsplash.com/photo-1449157291145-7efd050a4d0e?q=80&w=1200&auto=format&fit=crop',
    },
    {
      title: 'Jazz Allstars Evening',
      startsAt: '2025-09-12T20:00:00-04:00',
      endsAt: '2025-09-12T23:00:00-04:00',
      venueId: msg.id,
      artistId: brysonTiller.id,
      status: 'published' as const,
      externalLink: 'https://example.com/jazz-allstars',
      mapsLink: 'https://www.google.com/maps?q=Madison+Square+Garden',
      posterImageUrl:
        'https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=1200&auto=format&fit=crop',
    },
  ];

  for (const e of events) {
    const created = await prisma.event.create({
      data: {
        ...e,
        startsAt: new Date(e.startsAt),
        endsAt: e.endsAt ? new Date(e.endsAt) : null,
      },
    });

    await prisma.eventArtist.upsert({
      where: { eventId_artistId: { eventId: created.id, artistId: e.artistId } },
      update: {},
      create: { eventId: created.id, artistId: e.artistId, isPrimary: true, sortOrder: 1 },
    });

    // Create 20 GA tickets per event
    for (let i = 1; i <= 20; i++) {
      await prisma.ticket.create({
        data: {
          eventId: created.id,
          status: 'reserved',
          priceCents: 4500,
          currency: 'USD',
          seatSection: 'GA',
          seatRow: 'A',
          seat: String(i),
        },
      });
    }
  }

  console.log('✅ Seed completed!');
  console.log(`📧 Admin user: ${adminEmail}`);
  console.log(`🔑 Admin password: ${adminPassword}`);
  console.log(`📊 Created ${events.length} events with tickets`);
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
