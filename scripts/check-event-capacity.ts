/**
 * Quick script to check event capacity and ticket counts
 */
import { prisma } from '../lib/db/prisma';

async function main() {
  const eventId = parseInt(process.argv[2], 10) || 51;

  console.log(`\n🔍 Checking Event #${eventId} Capacity & Tickets\n`);
  console.log('='.repeat(60));

  // Get event info
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      ticketTypes: {
        where: { isActive: true },
      },
    },
  });

  if (!event) {
    console.error(`❌ Event ${eventId} not found`);
    process.exit(1);
  }

  console.log(`\n📅 Event: ${event.title}`);
  console.log(`📍 Status: ${event.status}\n`);

  // Check each ticket type
  for (const ticketType of event.ticketTypes) {
    console.log(`\n${'─'.repeat(60)}`);
    console.log(`🎫 Tier: ${ticketType.name}`);
    console.log(`   Capacity: ${ticketType.capacity || 'Unlimited'}`);
    console.log(`   Price: $${(ticketType.priceCents || 0) / 100}`);

    // Count tickets by status
    const tickets = await prisma.ticket.findMany({
      where: {
        eventId,
        ticketTypeId: ticketType.id,
      },
      select: {
        id: true,
        status: true,
        seatSection: true,
        seatRow: true,
        seat: true,
        isGenesisTicket: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const statusCounts = tickets.reduce((acc, ticket) => {
      acc[ticket.status] = (acc[ticket.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log(`\n   Tickets Created: ${tickets.length}`);
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`     - ${status}: ${count}`);
    });

    const genesisCount = tickets.filter((t) => t.isGenesisTicket).length;
    if (genesisCount > 0) {
      console.log(`     - Genesis tickets: ${genesisCount} (NOT counted against capacity)`);
    }

    // Calculate remaining (excluding Genesis tickets - they don't count against capacity)
    const nonCanceledCount = tickets.filter(
      (t) => t.status !== 'canceled' && !t.isGenesisTicket
    ).length;
    const remaining = ticketType.capacity ? ticketType.capacity - nonCanceledCount : 'Unlimited';

    console.log(`\n   📊 Remaining: ${remaining}`);

    if (tickets.length > 0 && tickets.length <= 10) {
      console.log(`\n   Seat Assignments:`);
      tickets.forEach((t) => {
        const genesis = t.isGenesisTicket ? ' [GENESIS]' : '';
        console.log(
          `     ${t.seatSection || 'N/A'}/${t.seatRow || 'N/A'}/${t.seat || 'N/A'} - ${t.status}${genesis}`
        );
      });
    }
  }

  console.log(`\n${'='.repeat(60)}\n`);
}

main()
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
