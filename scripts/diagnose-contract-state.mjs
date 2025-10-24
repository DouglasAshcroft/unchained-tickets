#!/usr/bin/env node

import { createPublicClient, http } from 'viem';
import { baseSepolia } from 'viem/chains';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CONTRACT_ADDRESS = '0xeDAE8268830E998Ff359Fdd62CE33E3131731Aa3';
const EVENT_ID = 51;

// Load contract ABI
const abiPath = join(__dirname, '../contracts/UnchainedTickets.abi.json');
const contractAbi = JSON.parse(readFileSync(abiPath, 'utf-8'));

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http('https://sepolia.base.org'),
});

console.log('🔍 Diagnosing Contract State for Event #51');
console.log('═'.repeat(70));
console.log('Contract:', CONTRACT_ADDRESS);
console.log('Event ID:', EVENT_ID);
console.log('');

async function main() {
  try {
    // 1. Check if event exists
    console.log('1️⃣  Reading event data from contract...');
    const eventData = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: contractAbi,
      functionName: 'events',
      args: [BigInt(EVENT_ID)],
    });

    console.log('Event Data:', eventData);
    console.log('');

    const [maxSupply, eventTimestamp, eventEndTimestamp, transferable, active, metadataURI, _souvenirMetadataURI, royaltyBps, royaltyRecipient] = eventData;

    console.log('  Max Supply:', maxSupply.toString());
    console.log('  Event Timestamp:', eventTimestamp.toString(), '(', new Date(Number(eventTimestamp) * 1000).toISOString(), ')');
    console.log('  Event End:', eventEndTimestamp.toString(), '(', new Date(Number(eventEndTimestamp) * 1000).toISOString(), ')');
    console.log('  Transferable:', transferable);
    console.log('  Active:', active);
    console.log('  Metadata URI:', metadataURI);
    console.log('  Royalty BPS:', royaltyBps.toString());
    console.log('  Royalty Recipient:', royaltyRecipient);
    console.log('');

    // 2. Check current block timestamp
    console.log('2️⃣  Checking current blockchain time...');
    const latestBlock = await publicClient.getBlock();
    const currentTimestamp = latestBlock.timestamp;
    console.log('  Current Block Timestamp:', currentTimestamp.toString(), '(', new Date(Number(currentTimestamp) * 1000).toISOString(), ')');
    console.log('  Time until event:', Number(eventTimestamp - currentTimestamp), 'seconds');
    console.log('');

    // Check if event has started
    if (currentTimestamp >= eventTimestamp) {
      console.log('❌ PROBLEM: Event has already started! Cannot mint.');
      console.log('   Contract requires: block.timestamp < eventTimestamp');
      console.log('   Current:', currentTimestamp.toString());
      console.log('   Event starts:', eventTimestamp.toString());
    } else {
      console.log('✅ Event is in the future, minting should be allowed');
    }
    console.log('');

    // 3. Check tier data
    console.log('3️⃣  Reading tier 0 data...');
    const tierCount = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: contractAbi,
      functionName: 'eventTierCount',
      args: [BigInt(EVENT_ID)],
    });

    console.log('  Total tiers for event:', tierCount.toString());

    if (tierCount > 0n) {
      const tierData = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: contractAbi,
        functionName: 'eventTiers',
        args: [BigInt(EVENT_ID), 0n],
      });

      console.log('  Tier 0 Data:', tierData);
      const [tier, tierName, maxSupply, priceCents, accessAreas, includedPerks] = tierData;
      console.log('    Tier Enum:', tier);
      console.log('    Name:', tierName);
      console.log('    Max Supply:', maxSupply.toString());
      console.log('    Price (cents):', priceCents.toString());
      console.log('    Access Areas:', accessAreas);
      console.log('    Perks:', includedPerks);
    } else {
      console.log('❌ No tiers found for this event!');
    }
    console.log('');

    // 4. Try to simulate a mint
    console.log('4️⃣  Simulating mint transaction...');
    try {
      const simulation = await publicClient.simulateContract({
        address: CONTRACT_ADDRESS,
        abi: contractAbi,
        functionName: 'mintTicketWithTier',
        args: [
          BigInt(EVENT_ID),
          0n, // tierId
          '0x44Df6638425A44FA72ac83BBEbdf45f5391a17c2', // recipient
          'TEST',
          '001',
          '001',
        ],
        account: '0x5B33aA418a6d455AADc391841788e8F72Df5ECd9', // minting wallet
      });

      console.log('✅ Simulation successful!');
      console.log('  Result:', simulation.result);
    } catch (simError) {
      console.log('❌ Simulation failed:', simError.shortMessage || simError.message);
      console.log('  Details:', simError.cause?.reason || simError.cause?.shortMessage || 'No additional details');
    }
    console.log('');

    // Summary
    console.log('═'.repeat(70));
    console.log('📊 Diagnosis Summary');
    console.log('═'.repeat(70));

    if (maxSupply === 0n) {
      console.log('❌ Event does not exist (maxSupply = 0)');
    } else {
      console.log('✅ Event exists on-chain');
    }

    if (!active) {
      console.log('❌ Event is not active');
    } else {
      console.log('✅ Event is active');
    }

    if (currentTimestamp >= eventTimestamp) {
      console.log('❌ Event has already started (cannot mint)');
    } else {
      console.log('✅ Event is in the future (can mint)');
    }

    if (tierCount === 0n) {
      console.log('❌ No tiers registered');
    } else {
      console.log(`✅ ${tierCount.toString()} tier(s) registered`);
    }

    console.log('');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

main();
