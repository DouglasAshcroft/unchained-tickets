#!/usr/bin/env node

import { createPublicClient, http, formatUnits } from 'viem';
import { baseSepolia } from 'viem/chains';

const BASE_SEPOLIA_USDC_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';
const YOUR_WALLET = '0x44Df6638425A44FA72ac83BBEbdf45f5391a17c2';

const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
];

async function checkBalance() {
  console.log('Checking USDC balance on Base Sepolia...');
  console.log('Wallet:', YOUR_WALLET);
  console.log('USDC Contract:', BASE_SEPOLIA_USDC_ADDRESS);
  console.log('');

  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(),
  });

  try {
    const balance = await publicClient.readContract({
      address: BASE_SEPOLIA_USDC_ADDRESS,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [YOUR_WALLET],
    });

    const usdcBalance = parseFloat(formatUnits(balance, 6));

    console.log('✅ USDC Balance:', usdcBalance, 'USDC');
    console.log('');

    if (usdcBalance === 0) {
      console.log('❌ Your wallet has 0 USDC on Base Sepolia testnet.');
      console.log('');
      console.log('To get testnet USDC, you have a few options:');
      console.log('');
      console.log('1. Use Coinbase Faucet (easiest):');
      console.log('   https://portal.cdp.coinbase.com/products/faucet');
      console.log('');
      console.log('2. Bridge from Ethereum Sepolia:');
      console.log('   - Get Sepolia ETH from https://www.alchemy.com/faucets/ethereum-sepolia');
      console.log('   - Swap for USDC on Uniswap Sepolia');
      console.log('   - Bridge to Base Sepolia using https://bridge.base.org');
      console.log('');
      console.log('3. For testing, you can also use the onramp flow with a test card.');
    } else if (usdcBalance < 1) {
      console.log('⚠️  Your balance is less than $1.00 USDC');
      console.log('You need at least $1.00 to purchase the test ticket.');
    } else {
      console.log('✅ You have sufficient balance to purchase tickets!');
      console.log('The direct purchase button should appear.');
    }
  } catch (error) {
    console.error('❌ Error checking balance:', error.message);
  }
}

checkBalance();
