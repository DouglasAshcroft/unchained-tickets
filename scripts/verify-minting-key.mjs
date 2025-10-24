#!/usr/bin/env node
/**
 * Diagnostic script to verify MINTING_PRIVATE_KEY configuration
 *
 * This script checks that your minting wallet private key is properly
 * formatted for use with viem's privateKeyToAccount function.
 *
 * Usage: node scripts/verify-minting-key.mjs
 */

import { config } from 'dotenv';
import { privateKeyToAccount } from 'viem/accounts';

// Load environment variables
config();

console.log('\n🔍 Checking MINTING_PRIVATE_KEY configuration...\n');

// Get the private key
let privateKey = process.env.MINTING_PRIVATE_KEY || process.env.MINTING_WALLET_PRIVATE_KEY;

if (!privateKey) {
  console.error('❌ ERROR: MINTING_PRIVATE_KEY is not set in your .env file');
  console.log('\nPlease add it to your .env file:');
  console.log('MINTING_PRIVATE_KEY=0x1234567890abcdef...(64 hex characters total)\n');
  process.exit(1);
}

console.log('✅ Private key found in environment');
console.log(`   Raw length: ${privateKey.length} characters`);
console.log(`   Preview: ${privateKey.substring(0, 10)}...${privateKey.substring(privateKey.length - 4)}`);

// Trim whitespace
privateKey = privateKey.trim();
if (privateKey.length !== process.env.MINTING_PRIVATE_KEY?.length) {
  console.log('⚠️  Trimmed whitespace from private key');
}

// Check for 0x prefix
if (!privateKey.startsWith('0x')) {
  console.log('⚠️  Missing 0x prefix, adding automatically...');
  privateKey = `0x${privateKey}`;
}

// Validate format
const hexPattern = /^0x[0-9a-fA-F]{64}$/;
if (!hexPattern.test(privateKey)) {
  console.error('\n❌ ERROR: Invalid private key format');
  console.log(`\nExpected: 0x followed by exactly 64 hexadecimal characters (0-9, a-f)`);
  console.log(`Got: ${privateKey.substring(0, 10)}... (length: ${privateKey.length})`);

  if (privateKey.length < 66) {
    console.log(`\nYour key is too short. It should be 66 characters total (0x + 64 hex chars).`);
  } else if (privateKey.length > 66) {
    console.log(`\nYour key is too long. It should be 66 characters total (0x + 64 hex chars).`);
  }

  console.log('\nExample valid format:');
  console.log('0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef\n');
  process.exit(1);
}

console.log('✅ Private key format is valid (0x + 64 hex characters)');

// Try to create an account
try {
  const account = privateKeyToAccount(privateKey);
  console.log('✅ Successfully created viem account');
  console.log(`   Wallet address: ${account.address}`);
  console.log(`   Account type: ${account.type}`);

  console.log('\n✨ All checks passed! Your MINTING_PRIVATE_KEY is properly configured.\n');
  console.log('Next steps:');
  console.log('1. Make sure this wallet has MINTER_ROLE on your UnchainedTickets contract');
  console.log('2. Make sure this wallet has enough ETH for gas fees');
  console.log('3. Verify NFT_CONTRACT_ADDRESS is set correctly in .env\n');

} catch (error) {
  console.error('\n❌ ERROR: Failed to create viem account');
  console.error(`   ${error.message}`);
  console.log('\nPlease check that your private key is valid.\n');
  process.exit(1);
}
