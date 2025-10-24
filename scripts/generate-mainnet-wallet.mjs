#!/usr/bin/env node
/**
 * Generate a new secure wallet for mainnet minting
 *
 * This creates a fresh wallet specifically for production mainnet use.
 * The private key should be stored securely (password manager, Vercel secrets only).
 *
 * ⚠️  SECURITY WARNINGS:
 * - DO NOT reuse testnet wallets for mainnet
 * - DO NOT commit this private key to git
 * - DO NOT share via Slack/Discord/email
 * - DO store in password manager (1Password, LastPass, etc.)
 * - DO add to Vercel environment variables only
 * - DO fund wallet with minimal ETH (enough for ~100 mints)
 *
 * Usage: node scripts/generate-mainnet-wallet.mjs
 */

import { Wallet } from 'ethers';
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const { reset, bright, red, green, yellow, blue, cyan } = colors;

async function generateMainnetWallet() {
  console.log(`\n${bright}${blue}${'='.repeat(70)}${reset}`);
  console.log(`${bright}${blue}  MAINNET MINTING WALLET GENERATOR${reset}`);
  console.log(`${bright}${blue}${'='.repeat(70)}${reset}\n`);

  console.log(`${yellow}⚠️  SECURITY NOTICE${reset}`);
  console.log(`${yellow}────────────────────────────────────────────────────────────${reset}`);
  console.log(`This will generate a NEW wallet for mainnet production use.`);
  console.log(`${red}DO NOT${reset} reuse your testnet wallet for mainnet!`);
  console.log();

  // Generate new random wallet
  console.log(`${cyan}🔐 Generating new secure wallet...${reset}\n`);
  const wallet = Wallet.createRandom();

  // Display wallet information
  console.log(`${bright}${green}✅ Wallet Generated Successfully!${reset}\n`);

  console.log(`${bright}WALLET ADDRESS:${reset}`);
  console.log(`  ${green}${wallet.address}${reset}`);
  console.log();

  console.log(`${bright}PRIVATE KEY:${reset}`);
  console.log(`  ${red}${wallet.privateKey}${reset}`);
  console.log();

  console.log(`${bright}MNEMONIC PHRASE:${reset}`);
  console.log(`  ${yellow}${wallet.mnemonic.phrase}${reset}`);
  console.log();

  // Security reminders
  console.log(`${bright}${red}🔒 SECURITY CHECKLIST${reset}`);
  console.log(`${red}────────────────────────────────────────────────────────────${reset}`);
  console.log(`${green}✓${reset} Save private key to password manager (1Password, LastPass, etc.)`);
  console.log(`${green}✓${reset} Save mnemonic phrase to secure backup location`);
  console.log(`${green}✓${reset} Add private key to Vercel environment variables (Production only)`);
  console.log(`${green}✓${reset} Clear terminal history after copying keys`);
  console.log();
  console.log(`${red}✗${reset} DO NOT commit private key to git`);
  console.log(`${red}✗${reset} DO NOT share via Slack/Discord/email`);
  console.log(`${red}✗${reset} DO NOT reuse testnet wallet for mainnet`);
  console.log(`${red}✗${reset} DO NOT fund wallet with more ETH than needed`);
  console.log();

  // Funding instructions
  console.log(`${bright}${cyan}💰 FUNDING INSTRUCTIONS${reset}`);
  console.log(`${cyan}────────────────────────────────────────────────────────────${reset}`);
  console.log(`\n1. Send ${bright}~0.05 ETH${reset} to this address on ${bright}Base Mainnet${reset}:`);
  console.log(`   ${green}${wallet.address}${reset}\n`);
  console.log(`   ${yellow}⚠️  Make sure you send to Base Mainnet (chain ID 8453)${reset}`);
  console.log(`   ${yellow}⚠️  NOT Ethereum mainnet!${reset}\n`);
  console.log(`2. This covers:`);
  console.log(`   - Contract deployment: ~0.01 ETH`);
  console.log(`   - Granting MINTER_ROLE: ~0.001 ETH`);
  console.log(`   - ~100 NFT mints: ~0.03 ETH`);
  console.log(`   - Buffer for gas price spikes: ~0.01 ETH`);
  console.log();

  // Next steps
  console.log(`${bright}${blue}📋 NEXT STEPS${reset}`);
  console.log(`${blue}────────────────────────────────────────────────────────────${reset}`);
  console.log();
  console.log(`${bright}Step 1:${reset} Save credentials securely`);
  console.log(`  - Copy private key to password manager`);
  console.log(`  - Copy mnemonic phrase to secure backup`);
  console.log(`  - Label as "Unchained Tickets Mainnet Minting Wallet"`);
  console.log();

  console.log(`${bright}Step 2:${reset} Fund the wallet`);
  console.log(`  - Send 0.05 ETH to ${wallet.address}`);
  console.log(`  - ${yellow}IMPORTANT: Send to Base Mainnet (chain ID 8453)${reset}`);
  console.log(`  - Verify transaction: https://basescan.org/address/${wallet.address}`);
  console.log();

  console.log(`${bright}Step 3:${reset} Set up deployment .env`);
  console.log(`  - Create .env.mainnet file (do NOT commit!)`);
  console.log(`  - Add the deployment wallet private key`);
  console.log(`  - Add this minting wallet address for granting MINTER_ROLE`);
  console.log();

  console.log(`${bright}Step 4:${reset} Deploy contract to mainnet`);
  console.log(`  - Run: ${cyan}node scripts/deploy-mainnet-complete.mjs${reset}`);
  console.log(`  - This will deploy contract and grant MINTER_ROLE automatically`);
  console.log();

  console.log(`${bright}Step 5:${reset} Add to Vercel`);
  console.log(`  - Go to Vercel → Settings → Environment Variables`);
  console.log(`  - Add ${cyan}MINTING_PRIVATE_KEY${reset} = ${red}${wallet.privateKey}${reset}`);
  console.log(`  - Select ${bright}Production ONLY${reset} (uncheck Preview & Development)`);
  console.log(`  - Add ${cyan}MINTING_WALLET_ADDRESS${reset} = ${green}${wallet.address}${reset}`);
  console.log();

  console.log(`${bright}Step 6:${reset} Clear sensitive data`);
  console.log(`  - Run: ${cyan}clear${reset} or ${cyan}cls${reset} to clear terminal`);
  console.log(`  - Run: ${cyan}history -c${reset} to clear command history (Linux/Mac)`);
  console.log();

  // Wallet comparison
  console.log(`${bright}${yellow}📊 WALLET SEPARATION${reset}`);
  console.log(`${yellow}────────────────────────────────────────────────────────────${reset}`);
  console.log();
  console.log(`${bright}Testnet Wallet:${reset} 0x5B33aA418a6d455AADc391841788e8F72Df5ECd9`);
  console.log(`  - Use for: Base Sepolia testnet (Preview/Dev deployments)`);
  console.log(`  - Funded with: Sepolia ETH (free from faucet)`);
  console.log(`  - Security: Lower (okay to share for testing)`);
  console.log();
  console.log(`${bright}Mainnet Wallet:${reset} ${wallet.address}`);
  console.log(`  - Use for: Base mainnet (Production deployments)`);
  console.log(`  - Funded with: Real ETH (has real value)`);
  console.log(`  - Security: High (never share, store securely)`);
  console.log();

  // Environment variable summary
  console.log(`${bright}${cyan}🔧 ENVIRONMENT VARIABLE SUMMARY${reset}`);
  console.log(`${cyan}────────────────────────────────────────────────────────────${reset}`);
  console.log();
  console.log(`${bright}For Vercel Production Environment:${reset}`);
  console.log(`MINTING_PRIVATE_KEY="${wallet.privateKey}"`);
  console.log(`MINTING_WALLET_ADDRESS="${wallet.address}"`);
  console.log();
  console.log(`${bright}For Vercel Preview + Development Environments:${reset}`);
  console.log(`MINTING_PRIVATE_KEY="0xc2d4c6b6adfdeba5a4a8c73d8e908aa0fdcd3da03f4ac0cde264064aeac2f068"`);
  console.log(`MINTING_WALLET_ADDRESS="0x5B33aA418a6d455AADc391841788e8F72Df5ECd9"`);
  console.log();

  // Final warning
  console.log(`${bright}${red}⚠️  FINAL SECURITY REMINDER${reset}`);
  console.log(`${red}────────────────────────────────────────────────────────────${reset}`);
  console.log(`This terminal now contains sensitive private key information.`);
  console.log(`${bright}Clear your terminal and command history after copying keys!${reset}`);
  console.log();
  console.log(`Commands to clear:`);
  console.log(`  ${cyan}clear${reset} or ${cyan}cls${reset}        - Clear screen`);
  console.log(`  ${cyan}history -c${reset}           - Clear bash history (Linux/Mac)`);
  console.log(`  ${cyan}Clear-History${reset}        - Clear PowerShell history (Windows)`);
  console.log();

  // Check if wallet is funded (mainnet)
  console.log(`${bright}${blue}💵 CHECKING MAINNET BALANCE${reset}`);
  console.log(`${blue}────────────────────────────────────────────────────────────${reset}`);
  try {
    const publicClient = createPublicClient({
      chain: base,
      transport: http('https://mainnet.base.org'),
    });

    const balance = await publicClient.getBalance({
      address: wallet.address,
    });

    const balanceInEth = Number(balance) / 1e18;

    if (balanceInEth === 0) {
      console.log(`${yellow}⚠️  Wallet not yet funded${reset}`);
      console.log(`   Current balance: 0 ETH`);
      console.log(`   Please send 0.05 ETH to ${wallet.address}`);
    } else if (balanceInEth < 0.05) {
      console.log(`${yellow}⚠️  Wallet underfunded${reset}`);
      console.log(`   Current balance: ${balanceInEth.toFixed(4)} ETH`);
      console.log(`   Recommended: 0.05 ETH minimum`);
      console.log(`   Please send ${(0.05 - balanceInEth).toFixed(4)} ETH more`);
    } else {
      console.log(`${green}✅ Wallet funded!${reset}`);
      console.log(`   Balance: ${balanceInEth.toFixed(4)} ETH`);
      console.log(`   ${green}Ready for deployment!${reset}`);
    }
  } catch {
    console.log(`${yellow}⚠️  Could not check balance (network issue)${reset}`);
    console.log(`   Verify manually: https://basescan.org/address/${wallet.address}`);
  }

  console.log();
  console.log(`${bright}${green}✨ Wallet generation complete!${reset}\n`);
}

// Run wallet generation
generateMainnetWallet().catch((error) => {
  console.error(`\n${red}${bright}Fatal error:${reset} ${error.message}`);
  console.error(error.stack);
  process.exit(1);
});
