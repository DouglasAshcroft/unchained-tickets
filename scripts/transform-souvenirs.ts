#!/usr/bin/env tsx
/**
 * Batch transformation script to convert used tickets to souvenirs
 * Run after an event concludes to transform all used tickets to collectible souvenirs
 *
 * Usage:
 *   npm run transform-souvenirs -- --eventId=123
 *   npm run transform-souvenirs -- --eventId=123 --dry-run
 */

import { prisma } from '../lib/db/prisma';
import { batchTransformToSouvenirs } from '../lib/services/NFTMintingService';

async function main() {
  const args = process.argv.slice(2);
  const eventIdArg = args.find((arg) => arg.startsWith('--eventId='));
  const dryRun = args.includes('--dry-run');

  if (!eventIdArg) {
    console.error('Error: --eventId parameter is required');
    console.log('\nUsage:');
    console.log('  npm run transform-souvenirs -- --eventId=123');
    console.log('  npm run transform-souvenirs -- --eventId=123 --dry-run');
    process.exit(1);
  }

  const eventId = parseInt(eventIdArg.split('=')[1]);

  if (isNaN(eventId)) {
    console.error('Error: Invalid eventId');
    process.exit(1);
  }

  console.log(`\n🎫 Souvenir Transformation Script`);
  console.log(`Event ID: ${eventId}`);
  console.log(`Mode: ${dryRun ? 'DRY RUN (no changes)' : 'LIVE'}\n`);

  // Fetch event details
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      venue: true,
    },
  });

  if (!event) {
    console.error(`Error: Event ${eventId} not found`);
    process.exit(1);
  }

  console.log(`Event: ${event.title}`);
  console.log(`Venue: ${event.venue.name}`);
  console.log(`Date: ${event.startsAt.toLocaleString()}\n`);

  // Check if event has concluded
  const now = new Date();
  const eventEnd = event.endsAt || event.startsAt;

  if (now < eventEnd) {
    console.warn(`⚠️  Warning: Event has not concluded yet`);
    console.warn(`   Event ends: ${eventEnd.toLocaleString()}`);
    console.warn(`   Current time: ${now.toLocaleString()}`);

    if (!dryRun) {
      console.error('\nError: Cannot transform tickets for ongoing events');
      console.log('Use --dry-run to preview what would be transformed\n');
      process.exit(1);
    }
  }

  // Find all used tickets for this event
  const usedTickets = await prisma.ticket.findMany({
    where: {
      eventId,
      status: 'used',
    },
    include: {
      user: {
        select: {
          id: true,
          walletAddress: true,
        },
      },
    },
  });

  console.log(`Found ${usedTickets.length} used tickets\n`);

  if (usedTickets.length === 0) {
    console.log('No tickets to transform. Exiting.\n');
    process.exit(0);
  }

  // Get token IDs from charge records
  const ticketIds = usedTickets.map((t) => t.id);
  const charges = await prisma.charge.findMany({
    where: {
      ticketId: {
        in: ticketIds,
      },
      mintedTokenId: {
        not: null,
      },
    },
    select: {
      ticketId: true,
      mintedTokenId: true,
    },
  });

  const chargeMap = new Map(
    charges.map((c) => [c.ticketId, c.mintedTokenId!])
  );

  const tokenIds: bigint[] = [];
  const ticketsWithoutTokens: string[] = [];

  for (const ticket of usedTickets) {
    const tokenIdStr = chargeMap.get(ticket.id);
    if (tokenIdStr) {
      tokenIds.push(BigInt(tokenIdStr));
    } else {
      ticketsWithoutTokens.push(ticket.id);
    }
  }

  console.log(`✅ ${tokenIds.length} tickets with NFT tokens`);
  if (ticketsWithoutTokens.length > 0) {
    console.log(`⚠️  ${ticketsWithoutTokens.length} tickets without NFT tokens (will be skipped)`);
    console.log(`   Ticket IDs: ${ticketsWithoutTokens.slice(0, 5).join(', ')}${ticketsWithoutTokens.length > 5 ? '...' : ''}\n`);
  }

  if (tokenIds.length === 0) {
    console.log('No NFT tokens to transform. Exiting.\n');
    process.exit(0);
  }

  if (dryRun) {
    console.log('\n🧪 DRY RUN - Preview of transformation:');
    console.log(`Would transform ${tokenIds.length} tickets to souvenirs`);
    console.log(`Token IDs: ${tokenIds.slice(0, 10).map(t => t.toString()).join(', ')}${tokenIds.length > 10 ? '...' : ''}`);
    console.log('\nRun without --dry-run to execute the transformation\n');
    process.exit(0);
  }

  // Batch transform tickets to souvenirs
  console.log(`\n🎨 Transforming ${tokenIds.length} tickets to souvenirs...`);
  console.log('This may take a few minutes...\n');

  const result = await batchTransformToSouvenirs(tokenIds);

  if (!result.success) {
    console.error(`\n❌ Transformation failed: ${result.error}`);
    process.exit(1);
  }

  console.log(`\n✅ Successfully transformed ${tokenIds.length} tickets to souvenirs!`);
  console.log(`Transaction hash: ${result.transactionHash}`);
  console.log(`\n🎉 All done! Tickets are now collectible souvenirs.\n`);
}

main()
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
