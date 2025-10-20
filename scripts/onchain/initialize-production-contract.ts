#!/usr/bin/env tsx
/**
 * Initialize Production Contract Script
 *
 * This script creates events and tiers on-chain for production deployment
 * Run after deploying the contract to mainnet
 *
 * Usage:
 *   npx tsx scripts/onchain/initialize-production-contract.ts
 *   npx tsx scripts/onchain/initialize-production-contract.ts --dry-run
 *   npx tsx scripts/onchain/initialize-production-contract.ts --eventId=5
 */

import { createPublicClient, createWalletClient, http, type Address, type Hash } from 'viem';
import { base, baseSepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import contractArtifact from '../../contracts/UnchainedTickets.json';
import { prisma } from '../../lib/db/prisma';

// Configuration
const NETWORK = process.env.NEXT_PUBLIC_NETWORK === 'mainnet' ? 'mainnet' : 'testnet';
const CONTRACT_ADDRESS = process.env.NFT_CONTRACT_ADDRESS as Address;
const MINTING_WALLET_PRIVATE_KEY = process.env.MINTING_WALLET_PRIVATE_KEY as `0x${string}`;
const BASE_RPC_URL = process.env.NEXT_PUBLIC_BASE_RPC_URL || (NETWORK === 'mainnet' ? 'https://mainnet.base.org' : 'https://sepolia.base.org');

// Chain configuration
const chain = NETWORK === 'mainnet' ? base : baseSepolia;

// Tier configuration
const TIER_CONFIG = [
  {
    name: 'General Admission',
    tier: 0,
    capacity: 500,
    areas: ['Main Floor'],
    perks: [],
  },
  {
    name: 'VIP',
    tier: 1,
    capacity: 100,
    areas: ['Main Floor', 'VIP Lounge', 'Backstage'],
    perks: ['Free Beer (2x)', 'Meet & Greet', 'VIP Parking'],
  },
  {
    name: 'Premium',
    tier: 2,
    capacity: 200,
    areas: ['Main Floor', 'Balcony'],
    perks: ['Free Drink', 'Priority Entry'],
  },
];

// Royalty configuration (10% total = 1000 basis points)
const ROYALTY_BPS = 1000; // 10%

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const eventIdArg = args.find((arg) => arg.startsWith('--eventId='));
  const specificEventId = eventIdArg ? parseInt(eventIdArg.split('=')[1]) : null;

  console.log('\n🚀 Contract Initialization Script');
  console.log(`Network: ${NETWORK}`);
  console.log(`Mode: ${dryRun ? 'DRY RUN (no changes)' : 'LIVE'}`);
  console.log(`Contract: ${CONTRACT_ADDRESS}\n`);

  // Validate environment
  if (!CONTRACT_ADDRESS) {
    console.error('Error: NFT_CONTRACT_ADDRESS not set in .env');
    process.exit(1);
  }

  if (!MINTING_WALLET_PRIVATE_KEY) {
    console.error('Error: MINTING_WALLET_PRIVATE_KEY not set in .env');
    process.exit(1);
  }

  // Create clients
  const account = privateKeyToAccount(MINTING_WALLET_PRIVATE_KEY);

  const publicClient = createPublicClient({
    chain,
    transport: http(BASE_RPC_URL),
  });

  const walletClient = createWalletClient({
    account,
    chain,
    transport: http(BASE_RPC_URL),
  });

  console.log(`Deployer: ${account.address}`);

  // Check balance
  const balance = await publicClient.getBalance({ address: account.address });
  console.log(`Balance: ${(Number(balance) / 1e18).toFixed(4)} ETH\n`);

  if (Number(balance) < 0.001e18) {
    console.error('Error: Insufficient balance. Need at least 0.001 ETH for gas');
    process.exit(1);
  }

  // Fetch events from database
  const whereClause = specificEventId
    ? { id: specificEventId, status: 'published' as const }
    : { status: 'published' as const };

  const events = await prisma.event.findMany({
    where: whereClause,
    include: {
      venue: true,
      ticketTypes: true,
    },
    orderBy: { startsAt: 'asc' },
  });

  if (events.length === 0) {
    console.log('No published events found to initialize');
    process.exit(0);
  }

  console.log(`Found ${events.length} event(s) to initialize:\n`);

  for (const event of events) {
    console.log(`- ${event.title} (ID: ${event.id})`);
    console.log(`  Venue: ${event.venue.name}`);
    console.log(`  Date: ${event.startsAt.toLocaleDateString()}`);
  }

  console.log('');

  if (dryRun) {
    console.log('🧪 DRY RUN - Would create:');
    console.log(`- ${events.length} events`);
    console.log(`- ${events.length * TIER_CONFIG.length} tiers (${TIER_CONFIG.length} per event)`);
    console.log('\nRun without --dry-run to execute initialization\n');
    process.exit(0);
  }

  // Confirm before proceeding
  if (NETWORK === 'mainnet') {
    console.log('⚠️  WARNING: You are about to write to MAINNET');
    console.log('This will cost real ETH for gas fees');
    console.log('\nPress Ctrl+C to cancel, or wait 5 seconds to continue...\n');
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  let successCount = 0;
  let failureCount = 0;

  // Initialize each event
  for (const event of events) {
    console.log(`\n📝 Initializing Event ${event.id}: ${event.title}`);

    try {
      // Check if event already exists on-chain
      const eventData = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: contractArtifact.abi,
        functionName: 'events',
        args: [BigInt(event.id)],
      }) as any;

      if (eventData && eventData[0] > 0n) {
        console.log(`   ℹ️  Event already exists on-chain, skipping creation`);
      } else {
        // Create event on-chain
        const eventTimestamp = Math.floor(new Date(event.startsAt).getTime() / 1000);
        const eventEndTimestamp = event.endsAt
          ? Math.floor(new Date(event.endsAt).getTime() / 1000)
          : eventTimestamp + 14400; // Default 4 hours

        const metadataURI = `${process.env.NEXT_PUBLIC_APP_URL || 'https://tickets.unchained.xyz'}/api/metadata/`;
        const souvenirURI = metadataURI; // Same URI, metadata API handles state

        // Royalty recipient (venue owner or minting wallet)
        const royaltyRecipient = (event.venue.ownerWalletAddress as Address) || account.address;

        console.log(`   Creating event on-chain...`);
        console.log(`   - Max supply: 1000`);
        console.log(`   - Event timestamp: ${new Date(eventTimestamp * 1000).toISOString()}`);
        console.log(`   - End timestamp: ${new Date(eventEndTimestamp * 1000).toISOString()}`);
        console.log(`   - Royalty recipient: ${royaltyRecipient}`);
        console.log(`   - Royalty: ${ROYALTY_BPS / 100}%`);

        const hash = await walletClient.writeContract({
          address: CONTRACT_ADDRESS,
          abi: contractArtifact.abi,
          functionName: 'createEvent',
          args: [
            BigInt(event.id),
            BigInt(1000), // maxSupply
            BigInt(eventTimestamp),
            BigInt(eventEndTimestamp),
            metadataURI,
            souvenirURI,
            royaltyRecipient,
            BigInt(ROYALTY_BPS),
          ],
        });

        console.log(`   Waiting for confirmation... (tx: ${hash})`);
        await publicClient.waitForTransactionReceipt({ hash, confirmations: 1 });
        console.log(`   ✅ Event created on-chain`);
      }

      // Create tiers
      console.log(`   Creating ${TIER_CONFIG.length} tiers...`);

      for (const tierConfig of TIER_CONFIG) {
        try {
          // Check if tier already exists
          const tierData = await publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: contractArtifact.abi,
            functionName: 'eventTiers',
            args: [BigInt(event.id), BigInt(tierConfig.tier)],
          }) as any;

          if (tierData && tierData[1] > 0n) {
            console.log(`     ℹ️  Tier ${tierConfig.tier} (${tierConfig.name}) already exists, skipping`);
            continue;
          }

          // Find matching ticket type from database
          const ticketType = event.ticketTypes.find(
            (tt) => tt.name.toLowerCase().includes(tierConfig.name.toLowerCase().split(' ')[0])
          );

          const priceCents = ticketType?.price || 5000; // Default $50

          console.log(`     Creating Tier ${tierConfig.tier}: ${tierConfig.name} ($${priceCents / 100})`);

          const tierHash = await walletClient.writeContract({
            address: CONTRACT_ADDRESS,
            abi: contractArtifact.abi,
            functionName: 'createTier',
            args: [
              BigInt(event.id),
              tierConfig.name,
              BigInt(tierConfig.tier),
              BigInt(tierConfig.capacity),
              BigInt(priceCents),
              tierConfig.areas,
              tierConfig.perks,
            ],
          });

          await publicClient.waitForTransactionReceipt({ hash: tierHash, confirmations: 1 });
          console.log(`     ✅ Tier created`);
        } catch (tierError) {
          console.error(`     ❌ Failed to create tier ${tierConfig.tier}:`, tierError);
        }
      }

      successCount++;
      console.log(`   ✅ Event ${event.id} fully initialized\n`);
    } catch (error) {
      failureCount++;
      console.error(`   ❌ Failed to initialize event ${event.id}:`, error);
      console.error('');
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Initialization Summary');
  console.log('='.repeat(60));
  console.log(`✅ Successfully initialized: ${successCount} event(s)`);
  if (failureCount > 0) {
    console.log(`❌ Failed: ${failureCount} event(s)`);
  }
  console.log('');

  if (successCount > 0) {
    console.log('🎉 Contract initialization complete!');
    console.log(`\nView contract on ${NETWORK === 'mainnet' ? 'Basescan' : 'Base Sepolia Explorer'}:`);
    console.log(`https://${NETWORK === 'mainnet' ? '' : 'sepolia.'}basescan.org/address/${CONTRACT_ADDRESS}`);
  }

  console.log('');
}

main()
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
