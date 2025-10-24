#!/usr/bin/env node

import { createPublicClient, http } from 'viem';
import { baseSepolia } from 'viem/chains';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load from deployment file
const deploymentPath = join(__dirname, '../deployments/baseSepolia.json');
let CONTRACT_ADDRESS;

try {
  const deployment = JSON.parse(readFileSync(deploymentPath, 'utf-8'));
  CONTRACT_ADDRESS = deployment.contractAddress;
} catch {
  console.error('❌ Could not load deployment file:', deploymentPath);
  console.error('   Run deployment first: npx hardhat run scripts/deploy/deploy-sepolia.cjs --network baseSepolia');
  process.exit(1);
}

const MINTING_WALLET = '0x5B33aA418a6d455AADc391841788e8F72Df5ECd9';
const RPC_URL = 'https://sepolia.base.org';

// Load contract ABI
const abiPath = join(__dirname, '../contracts/UnchainedTickets.abi.json');
const contractAbi = JSON.parse(readFileSync(abiPath, 'utf-8'));

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(RPC_URL),
});

console.log('🔍 Verifying NFT Contract Deployment on Base Sepolia\n');
console.log('━'.repeat(60));
console.log(`Contract Address: ${CONTRACT_ADDRESS}`);
console.log(`Minting Wallet:   ${MINTING_WALLET}`);
console.log('━'.repeat(60));
console.log('');

async function verifyContract() {
  // 1. Check if contract is deployed (has code)
  console.log('1️⃣  Checking if contract is deployed...');
  try {
    const bytecode = await publicClient.getBytecode({
      address: CONTRACT_ADDRESS,
    });

    if (!bytecode || bytecode === '0x') {
      console.log('❌ NO CONTRACT FOUND at this address!');
      console.log('   The address has no bytecode deployed.');
      console.log('');
      console.log('💡 Action Required:');
      console.log('   You need to deploy the UnchainedTickets contract to Base Sepolia.');
      console.log('   Run: npx hardhat run scripts/deploy.js --network baseSepolia');
      return false;
    }

    console.log('✅ Contract IS deployed (bytecode found)');
    console.log(`   Bytecode length: ${bytecode.length} characters`);
    console.log('');
  } catch (error) {
    console.error('❌ Error checking bytecode:', error.message);
    return false;
  }

  // 2. Check minting wallet ETH balance (for gas)
  console.log('2️⃣  Checking minting wallet ETH balance...');
  try {
    const balance = await publicClient.getBalance({
      address: MINTING_WALLET,
    });

    const ethBalance = Number(balance) / 1e18;
    console.log(`   Balance: ${ethBalance.toFixed(6)} ETH`);

    if (balance === 0n) {
      console.log('❌ Minting wallet has NO ETH for gas!');
      console.log('');
      console.log('💡 Action Required:');
      console.log('   Send Base Sepolia ETH to:', MINTING_WALLET);
      console.log('   Get testnet ETH from: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet');
      return false;
    } else if (ethBalance < 0.001) {
      console.log('⚠️  Low ETH balance - may run out soon');
      console.log('');
    } else {
      console.log('✅ Sufficient ETH for gas');
      console.log('');
    }
  } catch (error) {
    console.error('❌ Error checking ETH balance:', error.message);
    return false;
  }

  // 3. Check if contract has the mintTicketWithTier function
  console.log('3️⃣  Checking contract interface...');
  try {
    const hasMintFunction = contractAbi.some(
      item => item.type === 'function' && item.name === 'mintTicketWithTier'
    );

    if (!hasMintFunction) {
      console.log('❌ ABI does not contain mintTicketWithTier function');
      return false;
    }

    console.log('✅ mintTicketWithTier function found in ABI');
    console.log('');
  } catch (error) {
    console.error('❌ Error checking ABI:', error.message);
    return false;
  }

  // 4. Check if minting wallet is the owner
  console.log('4️⃣  Checking contract ownership...');
  try {
    const owner = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: contractAbi,
      functionName: 'owner',
    });

    if (owner.toLowerCase() !== MINTING_WALLET.toLowerCase()) {
      console.log('❌ Minting wallet is NOT the contract owner!');
      console.log(`   Owner: ${owner}`);
      console.log(`   Minting Wallet: ${MINTING_WALLET}`);
      console.log('');
      console.log('💡 Action Required:');
      console.log('   Transfer ownership to minting wallet or use owner address for minting.');
      return false;
    }

    console.log('✅ Minting wallet IS the contract owner');
    console.log('');
  } catch (error) {
    console.error('❌ Error checking ownership:', error.message);
    return false;
  }

  // 5. Try to simulate a mint
  console.log('5️⃣  Attempting contract simulation...');
  try {
    const { request: _request } = await publicClient.simulateContract({
      address: CONTRACT_ADDRESS,
      abi: contractAbi,
      functionName: 'mintTicketWithTier',
      args: [
        1n, // eventId
        1n, // tierId
        MINTING_WALLET, // recipient (mint to self for test)
        'Test Section',
        'Test Row',
        'Test Seat',
      ],
      account: MINTING_WALLET,
    });

    console.log('✅ Simulation SUCCESSFUL!');
    console.log('   The contract is ready to mint NFTs');
    console.log('');
  } catch (error) {
    console.log('❌ Simulation FAILED:', error.message);
    console.log('');
    return false;
  }

  return true;
}

async function main() {
  const allChecksPass = await verifyContract();

  console.log('━'.repeat(60));
  if (allChecksPass) {
    console.log('🎉 ALL CHECKS PASSED! Contract is ready for minting.');
  } else {
    console.log('❌ SOME CHECKS FAILED. Review the issues above.');
  }
  console.log('━'.repeat(60));
}

main().catch(console.error);
