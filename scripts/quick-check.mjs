#!/usr/bin/env node

import { createPublicClient, http } from 'viem';
import { baseSepolia } from 'viem/chains';

const CONTRACT_ADDRESS = '0xeDAE8268830E998Ff359Fdd62CE33E3131731Aa3';

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http('https://sepolia.base.org'),
});

console.log('Checking contract at:', CONTRACT_ADDRESS);
console.log('');

try {
  const bytecode = await publicClient.getBytecode({
    address: CONTRACT_ADDRESS,
  });

  if (bytecode && bytecode !== '0x') {
    console.log('✅ Contract IS deployed!');
    console.log('Bytecode length:', bytecode.length, 'characters');
  } else {
    console.log('❌ No contract found');
  }
} catch (error) {
  console.error('Error:', error.message);
}
