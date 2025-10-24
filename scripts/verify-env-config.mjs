#!/usr/bin/env node
/**
 * Environment Configuration Verification Script
 *
 * This script validates that your environment is properly configured for
 * deployment to Vercel with the correct blockchain network settings.
 *
 * It checks:
 * - Environment detection (production/preview/development)
 * - Blockchain network configuration (mainnet/testnet)
 * - Required environment variables
 * - Private key format validation
 * - Database connectivity
 * - API key presence
 *
 * Usage: node scripts/verify-env-config.mjs
 */

import { config } from 'dotenv';
import { createPublicClient, http } from 'viem';
import { base, baseSepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

// Load environment variables
config();

// ANSI color codes for pretty output
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

// Helper functions
function printHeader(text) {
  console.log(`\n${bright}${blue}${'='.repeat(70)}${reset}`);
  console.log(`${bright}${blue}  ${text}${reset}`);
  console.log(`${bright}${blue}${'='.repeat(70)}${reset}\n`);
}

function printSection(text) {
  console.log(`\n${bright}${cyan}▶ ${text}${reset}`);
  console.log(`${cyan}${'─'.repeat(68)}${reset}`);
}

function printSuccess(text) {
  console.log(`${green}✓${reset} ${text}`);
}

function printError(text) {
  console.log(`${red}✗${reset} ${text}`);
}

function printWarning(text) {
  console.log(`${yellow}⚠${reset} ${text}`);
}

function printInfo(text) {
  console.log(`  ${text}`);
}

// Track errors and warnings
let errorCount = 0;
let warningCount = 0;

// Main verification function
async function verifyEnvironment() {
  printHeader('UNCHAINED TICKETS - Environment Configuration Verification');

  // Detect environment
  printSection('1. Environment Detection');

  const vercelEnv = process.env.VERCEL_ENV || 'development';
  const nodeEnv = process.env.NODE_ENV || 'development';

  printSuccess(`Vercel Environment: ${bright}${vercelEnv}${reset}`);
  printSuccess(`Node Environment: ${bright}${nodeEnv}${reset}`);

  // Check blockchain configuration
  printSection('2. Blockchain Network Configuration');

  const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID);
  const network = process.env.NEXT_PUBLIC_NETWORK;
  const devMode = process.env.NEXT_PUBLIC_DEV_MODE;
  const rpcUrl = process.env.NEXT_PUBLIC_BASE_RPC_URL || process.env.BASE_RPC_URL;

  if (!chainId) {
    printError('NEXT_PUBLIC_CHAIN_ID is not set');
    errorCount++;
  } else {
    const expectedChain = vercelEnv === 'production' ? 8453 : 84532;
    if (chainId === expectedChain) {
      printSuccess(`Chain ID: ${bright}${chainId}${reset} (${chainId === 8453 ? 'Base Mainnet' : 'Base Sepolia Testnet'})`);
    } else {
      printError(`Chain ID: ${chainId} (Expected ${expectedChain} for ${vercelEnv} environment)`);
      errorCount++;
    }
  }

  if (!network) {
    printError('NEXT_PUBLIC_NETWORK is not set');
    errorCount++;
  } else {
    const expectedNetwork = vercelEnv === 'production' ? 'mainnet' : 'testnet';
    if (network === expectedNetwork) {
      printSuccess(`Network: ${bright}${network}${reset}`);
    } else {
      printError(`Network: ${network} (Expected ${expectedNetwork} for ${vercelEnv} environment)`);
      errorCount++;
    }
  }

  if (devMode === undefined) {
    printError('NEXT_PUBLIC_DEV_MODE is not set');
    errorCount++;
  } else {
    const expectedDevMode = vercelEnv === 'production' ? 'false' : 'true';
    if (devMode === expectedDevMode) {
      printSuccess(`Dev Mode: ${bright}${devMode}${reset} (${devMode === 'true' ? 'Mock payments' : 'Real payments'})`);
    } else {
      printError(`Dev Mode: ${devMode} (Expected ${expectedDevMode} for ${vercelEnv} environment)`);
      errorCount++;
    }
  }

  if (!rpcUrl) {
    printError('NEXT_PUBLIC_BASE_RPC_URL / BASE_RPC_URL is not set');
    errorCount++;
  } else {
    const expectedRpcHost = vercelEnv === 'production' ? 'mainnet.base.org' : 'sepolia.base.org';
    if (rpcUrl.includes(expectedRpcHost)) {
      printSuccess(`RPC URL: ${bright}${rpcUrl}${reset}`);
    } else {
      printError(`RPC URL: ${rpcUrl} (Expected to contain ${expectedRpcHost})`);
      errorCount++;
    }
  }

  // Check smart contract configuration
  printSection('3. Smart Contract Configuration');

  const contractAddress = process.env.NFT_CONTRACT_ADDRESS || process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS;
  const publicContractAddress = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS;

  if (!contractAddress) {
    printError('NFT_CONTRACT_ADDRESS is not set');
    errorCount++;
  } else {
    printSuccess(`Contract Address: ${bright}${contractAddress}${reset}`);

    if (vercelEnv !== 'production' && contractAddress !== '0xeDAE8268830E998Ff359Fdd62CE33E3131731Aa3') {
      printWarning('Testnet contract address does not match expected: 0xeDAE8268830E998Ff359Fdd62CE33E3131731Aa3');
      warningCount++;
    }
  }

  if (!publicContractAddress) {
    printError('NEXT_PUBLIC_NFT_CONTRACT_ADDRESS is not set');
    errorCount++;
  } else if (contractAddress !== publicContractAddress) {
    printError('NFT_CONTRACT_ADDRESS and NEXT_PUBLIC_NFT_CONTRACT_ADDRESS do not match');
    errorCount++;
  } else {
    printSuccess(`Public Contract Address: ${bright}${publicContractAddress}${reset}`);
  }

  // Check minting wallet configuration
  printSection('4. Minting Wallet Configuration');

  let privateKey = process.env.MINTING_PRIVATE_KEY || process.env.MINTING_WALLET_PRIVATE_KEY;
  const mintingAddress = process.env.MINTING_WALLET_ADDRESS;

  if (!privateKey) {
    printError('MINTING_PRIVATE_KEY is not set');
    errorCount++;
  } else {
    // Validate private key format
    privateKey = privateKey.trim();
    if (!privateKey.startsWith('0x')) {
      privateKey = `0x${privateKey}`;
    }

    const hexPattern = /^0x[0-9a-fA-F]{64}$/;
    if (!hexPattern.test(privateKey)) {
      printError(`Invalid private key format (length: ${privateKey.length})`);
      printInfo('Expected: 0x + 64 hex characters (32 bytes)');
      errorCount++;
    } else {
      printSuccess('Private key format is valid');

      try {
        const account = privateKeyToAccount(privateKey);
        printSuccess(`Derived wallet address: ${bright}${account.address}${reset}`);

        if (mintingAddress && account.address.toLowerCase() !== mintingAddress.toLowerCase()) {
          printWarning(`MINTING_WALLET_ADDRESS (${mintingAddress}) does not match derived address`);
          warningCount++;
        }
      } catch (error) {
        printError(`Failed to create account from private key: ${error.message}`);
        errorCount++;
      }
    }
  }

  if (!mintingAddress) {
    printWarning('MINTING_WALLET_ADDRESS is not set (optional but recommended)');
    warningCount++;
  }

  // Check RPC connectivity
  printSection('5. RPC Connectivity Test');

  if (rpcUrl && chainId) {
    try {
      const chain = chainId === 8453 ? base : baseSepolia;
      const publicClient = createPublicClient({
        chain,
        transport: http(rpcUrl),
      });

      const blockNumber = await publicClient.getBlockNumber();
      printSuccess(`Connected to ${chain.name}`);
      printSuccess(`Latest block: ${bright}${blockNumber}${reset}`);

      // Check contract exists
      if (contractAddress) {
        try {
          const code = await publicClient.getBytecode({
            address: contractAddress,
          });

          if (code && code !== '0x') {
            printSuccess('Smart contract found on chain');
            printInfo(`Bytecode size: ${code.length - 2} bytes`);
          } else {
            printError('No contract code found at address');
            printInfo('The contract may not be deployed to this network');
            errorCount++;
          }
        } catch (error) {
          printError(`Failed to check contract: ${error.message}`);
          errorCount++;
        }
      }
    } catch (error) {
      printError(`RPC connection failed: ${error.message}`);
      errorCount++;
    }
  } else {
    printWarning('Skipping RPC test (missing RPC URL or chain ID)');
    warningCount++;
  }

  // Check database configuration
  printSection('6. Database Configuration');

  const databaseUrl = process.env.DATABASE_URL;
  const directUrl = process.env.DIRECT_URL;

  if (!databaseUrl) {
    printError('DATABASE_URL is not set');
    errorCount++;
  } else {
    printSuccess('DATABASE_URL is set');

    if (databaseUrl.includes('localhost') && vercelEnv === 'production') {
      printError('Production environment is using localhost database!');
      errorCount++;
    }

    if (!databaseUrl.includes('sslmode=require') && !databaseUrl.includes('localhost')) {
      printWarning('DATABASE_URL does not include sslmode=require');
      warningCount++;
    }
  }

  if (!directUrl) {
    printWarning('DIRECT_URL is not set (required for migrations)');
    warningCount++;
  } else {
    printSuccess('DIRECT_URL is set');
  }

  // Check authentication configuration
  printSection('7. Authentication & Security');

  const jwtSecret = process.env.JWT_SECRET;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!jwtSecret) {
    printError('JWT_SECRET is not set');
    errorCount++;
  } else if (jwtSecret.length < 32) {
    printError(`JWT_SECRET is too short (${jwtSecret.length} chars, minimum 32)`);
    errorCount++;
  } else {
    printSuccess(`JWT_SECRET is set (${jwtSecret.length} characters)`);
  }

  if (!adminPassword) {
    printError('ADMIN_PASSWORD is not set');
    errorCount++;
  } else if (adminPassword.length < 12) {
    printWarning(`ADMIN_PASSWORD is short (${adminPassword.length} chars, recommended 12+)`);
    warningCount++;
  } else {
    printSuccess(`ADMIN_PASSWORD is set (${adminPassword.length} characters)`);
  }

  // Check API keys
  printSection('8. External Service API Keys');

  const apiKeys = {
    'OnchainKit API': process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY,
    'CDP Project ID': process.env.NEXT_PUBLIC_CDP_PROJECT_ID,
    'BaseScan API': process.env.BASESCAN_API_KEY,
    'Coinbase Commerce': process.env.COINBASE_COMMERCE_API_KEY,
  };

  for (const [name, value] of Object.entries(apiKeys)) {
    if (!value) {
      printWarning(`${name} is not set`);
      warningCount++;
    } else {
      printSuccess(`${name} is set`);
    }
  }

  // Optional API keys
  const optionalKeys = {
    'SerpAPI': process.env.SERPAPI_KEY,
    'Stability AI': process.env.STABILITY_API_KEY,
  };

  for (const [name, value] of Object.entries(optionalKeys)) {
    if (!value) {
      printInfo(`${name} is not set (optional)`);
    } else {
      printSuccess(`${name} is set`);
    }
  }

  // Print summary
  printSection('Verification Summary');

  if (errorCount === 0 && warningCount === 0) {
    console.log(`\n${bright}${green}✨ Perfect! All checks passed.${reset}\n`);
    console.log(`Your environment is properly configured for ${bright}${vercelEnv}${reset} deployment.`);
  } else {
    if (errorCount > 0) {
      console.log(`\n${bright}${red}❌ ${errorCount} error(s) found${reset}`);
      console.log(`${red}Your environment has critical issues that must be fixed.${reset}\n`);
    }
    if (warningCount > 0) {
      console.log(`${bright}${yellow}⚠️  ${warningCount} warning(s) found${reset}`);
      console.log(`${yellow}These issues should be addressed but are not critical.${reset}\n`);
    }
  }

  // Deployment readiness
  printSection('Deployment Readiness');

  if (errorCount === 0) {
    printSuccess('Environment is ready for deployment');
    console.log('\nNext steps:');
    console.log('  1. Push your code to trigger deployment');
    console.log('  2. Monitor deployment logs in Vercel dashboard');
    console.log('  3. Test your deployed application');
  } else {
    printError('Environment is NOT ready for deployment');
    console.log('\nRequired actions:');
    console.log('  1. Fix all errors listed above');
    console.log('  2. Re-run this script to verify fixes');
    console.log('  3. Review docs/deployment/VERCEL_ENV_SETUP.md for guidance');
  }

  console.log('\n');

  // Exit with error code if errors found
  process.exit(errorCount > 0 ? 1 : 0);
}

// Run verification
verifyEnvironment().catch((error) => {
  console.error(`\n${red}${bright}Fatal error:${reset} ${error.message}`);
  console.error(error.stack);
  process.exit(1);
});
