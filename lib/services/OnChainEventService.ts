/**
 * OnChainEventService
 *
 * Handles registration of database events on the blockchain smart contract.
 * This service creates events and tiers on-chain so NFT minting can work.
 *
 * Key Responsibilities:
 * - Register events on the blockchain via contract.createEvent()
 * - Register ticket tiers via contract.createTier()
 * - Track on-chain event IDs in database (EventBlockchainRegistry)
 * - Handle transaction errors and gas estimation
 */

import { prisma } from '@/lib/db/prisma';
import { createPublicClient, createWalletClient, http, Address } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base, baseSepolia } from 'viem/chains';
import contractAbi from '@/contracts/UnchainedTickets.abi.json';

// Lazy initialization helpers to avoid errors during Next.js build
function getBlockchainConfig() {
  const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID) || 84532;
  const chain = chainId === 84532 ? baseSepolia : base;
  const rpcUrl = process.env.BASE_RPC_URL || 'https://sepolia.base.org';
  const contractAddress = (process.env.NFT_CONTRACT_ADDRESS || process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS) as Address;
  let mintingPrivateKey = process.env.MINTING_PRIVATE_KEY || process.env.MINTING_WALLET_PRIVATE_KEY;

  // Validate configuration (only at runtime, not during build)
  if (!contractAddress) {
    throw new Error('NFT_CONTRACT_ADDRESS is not configured');
  }

  if (!mintingPrivateKey) {
    throw new Error('MINTING_PRIVATE_KEY is not configured');
  }

  // Ensure private key has 0x prefix and is valid hex
  mintingPrivateKey = mintingPrivateKey.trim();
  if (!mintingPrivateKey.startsWith('0x')) {
    mintingPrivateKey = `0x${mintingPrivateKey}`;
  }

  // Validate private key format (should be 0x followed by 64 hex characters)
  const hexPattern = /^0x[0-9a-fA-F]{64}$/;
  if (!hexPattern.test(mintingPrivateKey)) {
    throw new Error(
      `MINTING_PRIVATE_KEY is invalid. Expected format: 0x followed by 64 hex characters (32 bytes). ` +
      `Got: ${mintingPrivateKey.substring(0, 10)}... (length: ${mintingPrivateKey.length})`
    );
  }

  return { chainId, chain, rpcUrl, contractAddress, mintingPrivateKey: mintingPrivateKey as `0x${string}` };
}

// Lazy-initialized clients (created on first use)
let _publicClient: ReturnType<typeof createPublicClient> | undefined;
let _walletClient: ReturnType<typeof createWalletClient> | undefined;
let _account: ReturnType<typeof privateKeyToAccount> | undefined;
let _config: ReturnType<typeof getBlockchainConfig> | undefined;

function getClients() {
  if (!_publicClient || !_walletClient || !_account || !_config) {
    _config = getBlockchainConfig();

    // @ts-expect-error - viem types have incompatibilities between base and baseSepolia chains
    _publicClient = createPublicClient({
      chain: _config.chain,
      transport: http(_config.rpcUrl),
    });

    _account = privateKeyToAccount(_config.mintingPrivateKey);

    _walletClient = createWalletClient({
      account: _account,
      chain: _config.chain,
      transport: http(_config.rpcUrl),
    });
  }

  return {
    publicClient: _publicClient!,
    walletClient: _walletClient!,
    account: _account!,
    contractAddress: _config!.contractAddress,
    chainId: _config!.chainId,
    chain: _config!.chain,
  };
}

export interface RegisterEventResult {
  success: boolean;
  onChainEventId?: number;
  txHash?: string;
  error?: string;
}

export interface RegisterTierResult {
  success: boolean;
  tierName: string;
  onChainTierId?: number;
  txHash?: string;
  error?: string;
}

/**
 * Register an event on the blockchain smart contract
 */
export async function registerEventOnChain(eventId: number): Promise<RegisterEventResult> {
  console.log(`[OnChainEventService] Registering event ${eventId} on blockchain...`);

  try {
    // Get blockchain clients (lazy initialization)
    const { publicClient, walletClient, account, contractAddress, chainId, chain } = getClients();

    // Check if already registered
    const existing = await prisma.eventBlockchainRegistry.findUnique({
      where: { eventId },
    });

    if (existing) {
      console.log(`[OnChainEventService] Event ${eventId} is already registered (on-chain ID: ${existing.onChainEventId})`);
      return {
        success: true,
        onChainEventId: existing.onChainEventId,
        txHash: existing.registrationTxHash,
      };
    }

    // Fetch event details from database
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        venue: true,
        artists: {
          include: { artist: true },
        },
        ticketTypes: true,
      },
    });

    if (!event) {
      return {
        success: false,
        error: `Event ${eventId} not found in database`,
      };
    }

    // Calculate total capacity across all ticket types
    const maxSupply = event.ticketTypes.reduce((sum, tt) => sum + (tt.capacity || 100), 0);

    // Use the database event ID as the on-chain event ID
    // This creates a 1:1 mapping that's easy to track
    const onChainEventId = BigInt(eventId);

    // Calculate timestamps
    const eventTimestamp = BigInt(Math.floor(event.startsAt.getTime() / 1000));
    const eventEndTimestamp = event.endsAt
      ? BigInt(Math.floor(event.endsAt.getTime() / 1000))
      : eventTimestamp + BigInt(4 * 60 * 60); // Default: 4 hours

    // Build metadata URI (points to our API)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const metadataURI = `${baseUrl}/api/metadata/{id}`;
    const souvenirMetadataURI = metadataURI; // Same endpoint, different state

    // Royalty configuration (5% to venue by default)
    const royaltyBps = 500; // 5% in basis points
    const royaltyRecipient = account.address; // For now, use minting wallet

    console.log(`[OnChainEventService] Creating event on contract:`);
    console.log(`  On-chain ID: ${onChainEventId}`);
    console.log(`  Max Supply: ${maxSupply}`);
    console.log(`  Event Time: ${new Date(Number(eventTimestamp) * 1000).toISOString()}`);
    console.log(`  Event End: ${new Date(Number(eventEndTimestamp) * 1000).toISOString()}`);
    console.log(`  Metadata URI: ${metadataURI}`);

    // Simulate the transaction first
    try {
      await publicClient.simulateContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'createEvent',
        args: [
          onChainEventId,
          BigInt(maxSupply),
          eventTimestamp,
          eventEndTimestamp,
          metadataURI,
          souvenirMetadataURI,
          royaltyRecipient,
          royaltyBps,
        ],
        account,
      });
    } catch (simError) {
      console.error('[OnChainEventService] Simulation failed:', simError);
      return {
        success: false,
        error: `Transaction simulation failed: ${simError instanceof Error ? simError.message : 'Unknown error'}`,
      };
    }

    // Execute the transaction
    // @ts-expect-error - viem types have incompatibilities between base and baseSepolia chains
    const hash = await walletClient.writeContract({
      address: contractAddress,
      abi: contractAbi,
      functionName: 'createEvent',
      args: [
        onChainEventId,
        BigInt(maxSupply),
        eventTimestamp,
        eventEndTimestamp,
        metadataURI,
        souvenirMetadataURI,
        royaltyRecipient,
        royaltyBps,
      ],
      chain,
    });

    console.log(`[OnChainEventService] Transaction sent: ${hash}`);
    console.log(`[OnChainEventService] Waiting for confirmation...`);

    // Wait for transaction confirmation
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    if (receipt.status === 'reverted') {
      return {
        success: false,
        error: 'Transaction reverted on-chain',
      };
    }

    console.log(`[OnChainEventService] ✅ Transaction confirmed in block ${receipt.blockNumber}`);

    // Store in database
    await prisma.eventBlockchainRegistry.create({
      data: {
        eventId,
        onChainEventId: Number(onChainEventId),
        contractAddress,
        registrationTxHash: hash,
        registeredAt: new Date(),
        chainId,
      },
    });

    console.log(`[OnChainEventService] ✅ Event ${eventId} registered successfully`);
    console.log(`[OnChainEventService]    On-chain ID: ${onChainEventId}`);
    console.log(`[OnChainEventService]    TX: ${hash}`);

    return {
      success: true,
      onChainEventId: Number(onChainEventId),
      txHash: hash,
    };
  } catch (error) {
    console.error(`[OnChainEventService] ❌ Error registering event ${eventId}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Register ticket tiers for an event on the blockchain
 */
export async function registerTiersOnChain(eventId: number): Promise<RegisterTierResult[]> {
  console.log(`[OnChainEventService] Registering tiers for event ${eventId}...`);

  try {
    // Get blockchain clients (lazy initialization)
    const { publicClient, walletClient, account, contractAddress, chain } = getClients();

    // Get blockchain registry
    const registry = await prisma.eventBlockchainRegistry.findUnique({
      where: { eventId },
    });

    if (!registry) {
      throw new Error(`Event ${eventId} is not registered on blockchain. Register the event first.`);
    }

    // Get ticket types
    const ticketTypes = await prisma.eventTicketType.findMany({
      where: { eventId, isActive: true },
      orderBy: { priceCents: 'desc' }, // Register most expensive (VIP) first
    });

    if (ticketTypes.length === 0) {
      console.log(`[OnChainEventService] No active ticket types found for event ${eventId}`);
      return [];
    }

    const results: RegisterTierResult[] = [];

    for (let i = 0; i < ticketTypes.length; i++) {
      const ticketType = ticketTypes[i];
      const onChainTierId = i; // Tier IDs start at 0
      const onChainEventId = BigInt(registry.onChainEventId);

      console.log(`[OnChainEventService] Creating tier ${onChainTierId}: ${ticketType.name}`);

      // Check if already registered
      const existingTier = await prisma.eventTierBlockchainRegistry.findFirst({
        where: {
          registryId: registry.id,
          ticketTypeId: ticketType.id,
        },
      });

      if (existingTier) {
        console.log(`[OnChainEventService]   Already registered (tier ${existingTier.onChainTierId})`);
        results.push({
          success: true,
          tierName: ticketType.name,
          onChainTierId: existingTier.onChainTierId,
          txHash: existingTier.registrationTxHash,
        });
        continue;
      }

      // Map ticket type name to contract tier enum
      // enum TicketTier { VIP, PREMIUM, GENERAL_ADMISSION }
      let tierEnum: number;
      const tierNameLower = ticketType.name.toLowerCase();
      if (tierNameLower.includes('vip')) {
        tierEnum = 0; // VIP
      } else if (tierNameLower.includes('premium')) {
        tierEnum = 1; // PREMIUM
      } else {
        tierEnum = 2; // GENERAL_ADMISSION
      }

      const maxSupply = BigInt(ticketType.capacity || 100);
      const priceCents = BigInt(ticketType.priceCents || 0);

      // For MVP, use simple default areas and perks
      const accessAreas = ['General Venue Access'];
      const includedPerks = tierEnum === 0 ? ['VIP Access', 'Priority Entry'] : [];

      try {
        // Simulate transaction
        await publicClient.simulateContract({
          address: contractAddress,
          abi: contractAbi,
          functionName: 'createTier',
          args: [
            onChainEventId,
            ticketType.name,
            tierEnum,
            maxSupply,
            priceCents,
            accessAreas,
            includedPerks,
          ],
          account,
        });

        // Execute transaction
        // @ts-expect-error - viem types have incompatibilities between base and baseSepolia chains
        const hash = await walletClient.writeContract({
          address: contractAddress,
          abi: contractAbi,
          functionName: 'createTier',
          args: [
            onChainEventId,
            ticketType.name,
            tierEnum,
            maxSupply,
            priceCents,
            accessAreas,
            includedPerks,
          ],
          chain,
        });

        console.log(`[OnChainEventService]   TX: ${hash}`);

        // Wait for confirmation
        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        if (receipt.status === 'reverted') {
          results.push({
            success: false,
            tierName: ticketType.name,
            error: 'Transaction reverted',
          });
          continue;
        }

        // Store in database
        await prisma.eventTierBlockchainRegistry.create({
          data: {
            registryId: registry.id,
            ticketTypeId: ticketType.id,
            onChainTierId,
            registrationTxHash: hash,
            registeredAt: new Date(),
          },
        });

        console.log(`[OnChainEventService]   ✅ Tier registered: ${ticketType.name}`);

        results.push({
          success: true,
          tierName: ticketType.name,
          onChainTierId,
          txHash: hash,
        });
      } catch (tierError) {
        console.error(`[OnChainEventService]   ❌ Failed to register tier:`, tierError);
        results.push({
          success: false,
          tierName: ticketType.name,
          error: tierError instanceof Error ? tierError.message : 'Unknown error',
        });
      }
    }

    console.log(`[OnChainEventService] ✅ Registered ${results.filter(r => r.success).length}/${results.length} tiers`);

    return results;
  } catch (error) {
    console.error(`[OnChainEventService] ❌ Error registering tiers:`, error);
    throw error;
  }
}

/**
 * Get the on-chain event ID for a database event
 */
export async function getOnChainEventId(eventId: number): Promise<number | null> {
  const registry = await prisma.eventBlockchainRegistry.findUnique({
    where: { eventId },
  });

  return registry?.onChainEventId ?? null;
}

/**
 * Check if an event is registered on the blockchain
 */
export async function isEventRegisteredOnChain(eventId: number): Promise<boolean> {
  const registry = await prisma.eventBlockchainRegistry.findUnique({
    where: { eventId },
  });

  return !!registry;
}

/**
 * Get full blockchain registry info for an event
 */
export async function getBlockchainRegistry(eventId: number) {
  return prisma.eventBlockchainRegistry.findUnique({
    where: { eventId },
    include: {
      tierRegistrations: {
        include: {
          ticketType: true,
        },
      },
      genesisTicket: true,
    },
  });
}
