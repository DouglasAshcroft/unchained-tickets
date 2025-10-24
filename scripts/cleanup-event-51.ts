/**
 * Cleanup script for Event #51
 *
 * Fixes:
 * 1. Update capacity from 5 to 50
 * 2. Remove duplicate Genesis tickets
 * 3. Clean up invalid tickets
 */
import { prisma } from '../lib/db/prisma';

async function main() {
  const eventId = 51;

  console.log(`\n🔧 Cleaning up Event #${eventId}...\n`);

  // Step 1: Update capacity to 50
  console.log('1️⃣ Updating ticket type capacity...');

  const ticketType = await prisma.eventTicketType.findFirst({
    where: {
      eventId,
      name: 'Unchained Release Party',
    },
  });

  if (!ticketType) {
    console.error('❌ Ticket type not found');
    process.exit(1);
  }

  await prisma.eventTicketType.update({
    where: { id: ticketType.id },
    data: { capacity: 50 },
  });

  console.log(`   ✅ Updated capacity: 5 → 50\n`);

  // Step 2: Find all tickets for this event
  console.log('2️⃣ Analyzing tickets...');

  const tickets = await prisma.ticket.findMany({
    where: {
      eventId,
      ticketTypeId: ticketType.id,
    },
    include: {
      mints: true,
      charges: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  console.log(`   Found ${tickets.length} tickets\n`);

  // Step 3: Identify Genesis tickets
  const genesisTickets = tickets.filter((t) => t.isGenesisTicket);
  console.log(`3️⃣ Genesis tickets found: ${genesisTickets.length}`);

  if (genesisTickets.length > 1) {
    // Keep the one with status='used' or the first one with proper seat assignment
    const validGenesis = genesisTickets.find(
      (t) => t.seatSection === 'GENESIS' && t.seatRow === '001' && t.seat === '001'
    );

    const toKeep = validGenesis || genesisTickets.find((t) => t.status === 'used') || genesisTickets[0];
    const toDelete = genesisTickets.filter((t) => t.id !== toKeep.id);

    console.log(`   Keeping: ${toKeep.id} (${toKeep.seatSection}/${toKeep.seat})`);
    console.log(`   Deleting ${toDelete.length} duplicate(s):`);

    for (const ticket of toDelete) {
      console.log(`     - ${ticket.id} (${ticket.seatSection}/${ticket.seat || 'NULL'})`);

      // Delete associated charges first
      await prisma.charge.deleteMany({
        where: { ticketId: ticket.id },
      });

      // Delete associated mints
      await prisma.nFTMint.deleteMany({
        where: { ticketId: ticket.id },
      });

      // Delete the ticket
      await prisma.ticket.delete({
        where: { id: ticket.id },
      });
    }

    console.log(`   ✅ Deleted ${toDelete.length} duplicate Genesis ticket(s)\n`);
  } else {
    console.log(`   ✅ Only 1 Genesis ticket - OK\n`);
  }

  // Step 4: Clean up tickets with NULL seat assignments
  console.log('4️⃣ Checking for invalid tickets...');

  const invalidTickets = tickets.filter(
    (t) => !t.seatSection || !t.seatRow || !t.seat
  );

  if (invalidTickets.length > 0) {
    console.log(`   Found ${invalidTickets.length} ticket(s) with NULL seats:`);

    for (const ticket of invalidTickets) {
      console.log(`     - ${ticket.id} (status: ${ticket.status})`);

      // Delete associated charges
      await prisma.charge.deleteMany({
        where: { ticketId: ticket.id },
      });

      // Delete associated mints
      await prisma.nFTMint.deleteMany({
        where: { ticketId: ticket.id },
      });

      // Delete the ticket
      await prisma.ticket.delete({
        where: { id: ticket.id },
      });
    }

    console.log(`   ✅ Deleted ${invalidTickets.length} invalid ticket(s)\n`);
  } else {
    console.log(`   ✅ No invalid tickets found\n`);
  }

  // Step 5: Summary
  console.log('📊 Final Summary:');

  const finalTickets = await prisma.ticket.findMany({
    where: {
      eventId,
      ticketTypeId: ticketType.id,
      status: { not: 'canceled' },
    },
  });

  const finalGenesis = finalTickets.filter((t) => t.isGenesisTicket);

  console.log(`   Total tickets: ${finalTickets.length}`);
  console.log(`   Genesis tickets: ${finalGenesis.length}`);
  console.log(`   Regular tickets: ${finalTickets.length - finalGenesis.length}`);
  console.log(`   Capacity: 50`);
  console.log(`   Remaining: ${50 - finalTickets.length}`);

  console.log(`\n✅ Cleanup complete!\n`);
}

main()
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
