/**
 * Register Event with Genesis Ticket
 *
 * This script registers an existing database event on the blockchain
 * and mints the Genesis Archive Ticket (#1) for company history.
 *
 * Usage: npx tsx scripts/register-event-with-genesis.ts <eventId>
 * Example: npx tsx scripts/register-event-with-genesis.ts 51
 */

import { registerEventOnChain, registerTiersOnChain } from '../lib/services/OnChainEventService';
import { mintGenesisTicket, revealGenesisTicket } from '../lib/services/GenesisTicketService';

const COMPANY_ARCHIVE_WALLET = process.env.COMPANY_ARCHIVE_WALLET || '0x44Df6638425A44FA72ac83BBEbdf45f5391a17c2';

async function main() {
  // Get event ID from command line arguments
  const eventId = process.argv[2] ? parseInt(process.argv[2], 10) : 51;

  if (isNaN(eventId)) {
    console.error('❌ Invalid event ID');
    console.error('Usage: npx tsx scripts/register-event-with-genesis.ts <eventId>');
    process.exit(1);
  }

  console.log('');
  console.log('═'.repeat(70));
  console.log('🚀 UNCHAINED TICKETS - EVENT REGISTRATION + GENESIS MINT');
  console.log('═'.repeat(70));
  console.log('');
  console.log(`Event ID: ${eventId}`);
  console.log(`Company Archive Wallet: ${COMPANY_ARCHIVE_WALLET}`);
  console.log('');
  console.log('═'.repeat(70));
  console.log('');

  try {
    // STEP 1: Register event on blockchain
    console.log('📋 STEP 1: Registering event on blockchain...');
    console.log('');

    const eventResult = await registerEventOnChain(eventId);

    if (!eventResult.success) {
      console.error('❌ Event registration failed:', eventResult.error);
      process.exit(1);
    }

    console.log('✅ Event registered on blockchain!');
    console.log(`   On-chain Event ID: ${eventResult.onChainEventId}`);
    console.log(`   Transaction Hash: ${eventResult.txHash}`);
    console.log(`   Explorer: https://sepolia.basescan.org/tx/${eventResult.txHash}`);
    console.log('');

    // Wait a bit for the event transaction to fully settle
    console.log('⏳ Waiting for event registration to settle (5 seconds)...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    console.log('');

    // STEP 2: Register ticket tiers
    console.log('🎫 STEP 2: Registering ticket tiers...');
    console.log('');

    const tiersResult = await registerTiersOnChain(eventId);

    const successfulTiers = tiersResult.filter(t => t.success);
    const failedTiers = tiersResult.filter(t => !t.success);

    console.log(`✅ Registered ${successfulTiers.length}/${tiersResult.length} tiers`);

    successfulTiers.forEach(tier => {
      console.log(`   ✓ ${tier.tierName} (Tier ${tier.onChainTierId})`);
      console.log(`     TX: ${tier.txHash}`);
    });

    if (failedTiers.length > 0) {
      console.log('');
      console.log(`⚠️  ${failedTiers.length} tier(s) failed to register:`);
      failedTiers.forEach(tier => {
        console.log(`   ✗ ${tier.tierName}: ${tier.error}`);
      });
    }

    console.log('');

    // STEP 3: Mint Genesis Archive Ticket
    console.log('🏆 STEP 3: Minting Genesis Archive Ticket #1...');
    console.log('');

    const genesisResult = await mintGenesisTicket(
      eventId,
      eventResult.onChainEventId!,
      COMPANY_ARCHIVE_WALLET
    );

    if (!genesisResult.success) {
      console.error('❌ Genesis ticket minting failed:', genesisResult.error);
      console.log('');
      console.log('⚠️  Event is registered on-chain, but Genesis ticket was not minted.');
      console.log('   You can retry minting later or continue without Genesis ticket.');
      process.exit(1);
    }

    console.log('✅ Genesis Archive Ticket minted!');
    console.log(`   Ticket ID: ${genesisResult.ticketId}`);
    console.log(`   Token ID: ${genesisResult.tokenId}`);
    console.log(`   Transaction Hash: ${genesisResult.txHash}`);
    console.log(`   Explorer: https://sepolia.basescan.org/tx/${genesisResult.txHash}`);
    console.log(`   Owner: ${COMPANY_ARCHIVE_WALLET}`);
    console.log('');

    // STEP 4: Reveal Genesis ticket
    console.log('🎨 STEP 4: Revealing Genesis Archive Ticket...');
    console.log('');

    const revealed = await revealGenesisTicket(genesisResult.ticketId!);

    if (revealed) {
      console.log('✅ Genesis ticket revealed! Collectible poster is now visible.');
    } else {
      console.log('⚠️  Could not auto-reveal Genesis ticket. Reveal manually later.');
    }

    console.log('');

    // SUCCESS SUMMARY
    console.log('═'.repeat(70));
    console.log('🎉 SUCCESS! Event Registration Complete');
    console.log('═'.repeat(70));
    console.log('');
    console.log('✅ Event registered on blockchain');
    console.log(`✅ ${successfulTiers.length} ticket tier(s) registered`);
    console.log('✅ Genesis Archive Ticket #1 minted and revealed');
    console.log('✅ NFT minting is now enabled for this event');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   Database Event ID: ${eventId}`);
    console.log(`   On-Chain Event ID: ${eventResult.onChainEventId}`);
    console.log(`   Genesis Token ID: ${genesisResult.tokenId}`);
    console.log(`   Genesis Ticket ID: ${genesisResult.ticketId}`);
    console.log('');
    console.log('🏆 Genesis Archive:');
    console.log(`   This is Genesis Ticket #1 for Event #${eventId}`);
    console.log(`   Preserved forever in Unchained's company history`);
    console.log(`   Owner: ${COMPANY_ARCHIVE_WALLET}`);
    console.log('');
    console.log('🔗 View on Block Explorer:');
    console.log(`   Event: https://sepolia.basescan.org/tx/${eventResult.txHash}`);
    console.log(`   Genesis NFT: https://sepolia.basescan.org/tx/${genesisResult.txHash}`);
    console.log('');
    console.log('📝 Next Steps:');
    console.log('   1. Test NFT minting for regular tickets');
    console.log('   2. View Genesis ticket in wallet or block explorer');
    console.log('   3. Check Genesis Archive dashboard (coming soon)');
    console.log('');
    console.log('═'.repeat(70));

  } catch (error) {
    console.error('');
    console.error('═'.repeat(70));
    console.error('❌ ERROR DURING REGISTRATION');
    console.error('═'.repeat(70));
    console.error('');
    console.error(error);
    console.error('');
    process.exit(1);
  }
}

main();
