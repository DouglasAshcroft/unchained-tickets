#!/usr/bin/env node

import { createPublicClient, http, formatEther } from 'viem';
import { baseSepolia } from 'viem/chains';

const MINTING_WALLET = '0x5B33aA418a6d455AADc391841788e8F72Df5ECd9';
const RPC_URL = 'https://api.developer.coinbase.com/rpc/v1/base/bLrd4jUzZLpBkX1C7BrU0KHk1QWFOPSF';

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(RPC_URL),
});

console.log('Checking ETH balance on Base Sepolia...');
console.log('Wallet:', MINTING_WALLET);
console.log('');

try {
  const balance = await publicClient.getBalance({
    address: MINTING_WALLET,
  });

  const ethBalance = Number(formatEther(balance));

  console.log('✅ ETH Balance:', ethBalance.toFixed(6), 'ETH');
  console.log('');

  if (ethBalance === 0) {
    console.log('❌ Your wallet has 0 ETH on Base Sepolia testnet.');
    console.log('');
    console.log('To deploy the contract, you need testnet ETH:');
    console.log('  https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet');
    console.log('');
    console.log('Send ETH to:', MINTING_WALLET);
  } else if (ethBalance < 0.01) {
    console.log('⚠️  Low ETH balance - may not be enough for deployment');
    console.log('   Consider adding more from the faucet');
  } else {
    console.log('✅ You have sufficient balance to deploy the contract!');
  }
} catch (error) {
  console.error('❌ Error checking balance:', error.message);
}
