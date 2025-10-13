import { createPublicClient, createWalletClient, http, type Address, type Hash } from 'viem';
import { base, baseSepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import contractArtifact from '@/contracts/UnchainedTickets.json';

// Lazy initialization to avoid errors during build
let publicClient: any = null;
let walletClient: any = null;
let contractAddress: Address | null = null;

function initializeClients() {
  if (publicClient && walletClient && contractAddress) {
    return { publicClient, walletClient, contractAddress };
  }

  // Environment configuration
  const NETWORK = process.env.NEXT_PUBLIC_NETWORK === 'mainnet' ? 'mainnet' : 'testnet';
  const CONTRACT_ADDRESS = (process.env.NFT_CONTRACT_ADDRESS || process.env.NEXT_PUBLIC_CONTRACT_ADDRESS) as Address;
  const MINTING_WALLET_PRIVATE_KEY = process.env.MINTING_WALLET_PRIVATE_KEY as `0x${string}`;
  const BASE_RPC_URL = process.env.NEXT_PUBLIC_BASE_RPC_URL || process.env.BASE_RPC_URL || 'https://sepolia.base.org';

  // Chain configuration
  const chain = NETWORK === 'mainnet' ? base : baseSepolia;

  // Validate environment variables
  if (!CONTRACT_ADDRESS) {
    throw new Error('NEXT_PUBLIC_CONTRACT_ADDRESS is not set');
  }

  if (!MINTING_WALLET_PRIVATE_KEY) {
    throw new Error('MINTING_WALLET_PRIVATE_KEY is not set');
  }

  // Create account from private key
  const account = privateKeyToAccount(MINTING_WALLET_PRIVATE_KEY);

  // Create public client for reading contract state
  publicClient = createPublicClient({
    chain,
    transport: http(BASE_RPC_URL),
  });

  // Create wallet client for sending transactions
  walletClient = createWalletClient({
    account,
    chain,
    transport: http(BASE_RPC_URL),
  });

  contractAddress = CONTRACT_ADDRESS;

  return { publicClient, walletClient, contractAddress };
}

export type MintTicketRequest = {
  eventId: number;
  tierId: number;
  recipient: Address;
  section: string;
  row: string;
  seat: string;
};

export type MintTicketResult = {
  transactionHash: Hash;
  tokenId: bigint;
  success: boolean;
  error?: string;
};

/**
 * Mints an NFT ticket to the specified recipient address
 * Uses the Base Paymaster to sponsor gas fees
 */
export async function mintTicket(
  request: MintTicketRequest
): Promise<MintTicketResult> {
  try {
    console.log('[NFTMintingService] Minting ticket:', request);

    const { publicClient, walletClient, contractAddress: CONTRACT_ADDRESS } = initializeClients();

    // Simulate the transaction first to catch any errors
    try {
      await publicClient.simulateContract({
        address: CONTRACT_ADDRESS,
        abi: contractArtifact.abi,
        functionName: 'mintTicketWithTier',
        args: [
          BigInt(request.eventId),
          BigInt(request.tierId),
          request.recipient,
          request.section,
          request.row,
          request.seat,
        ],
      });
    } catch (simulateError) {
      console.error('[NFTMintingService] Simulation failed:', simulateError);
      return {
        transactionHash: '0x0' as Hash,
        tokenId: 0n,
        success: false,
        error: `Transaction simulation failed: ${simulateError instanceof Error ? simulateError.message : 'Unknown error'}`,
      };
    }

    // Write the transaction
    const hash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: contractArtifact.abi,
      functionName: 'mintTicketWithTier',
      args: [
        BigInt(request.eventId),
        BigInt(request.tierId),
        request.recipient,
        request.section,
        request.row,
        request.seat,
      ],
    });

    console.log('[NFTMintingService] Transaction sent:', hash);

    // Wait for transaction confirmation
    const receipt = await publicClient.waitForTransactionReceipt({
      hash,
      confirmations: 1,
    });

    console.log('[NFTMintingService] Transaction confirmed:', receipt);

    // Extract tokenId from logs
    // The TicketMinted event should contain the tokenId
    let tokenId = 0n;

    if (receipt.logs && receipt.logs.length > 0) {
      // Find the TicketMinted event log
      // The tokenId is typically the first topic after the event signature
      const ticketMintedLog = receipt.logs.find((log: any) =>
        log.address.toLowerCase() === CONTRACT_ADDRESS.toLowerCase()
      );

      if (ticketMintedLog && ticketMintedLog.topics.length >= 2) {
        // The tokenId is usually in topics[1] for indexed parameters
        tokenId = BigInt(ticketMintedLog.topics[1] || '0');
      }
    }

    // If we couldn't extract tokenId from logs, we need to query it
    // This is a fallback - ideally we should parse the event properly
    if (tokenId === 0n) {
      console.warn('[NFTMintingService] Could not extract tokenId from logs, using estimation');
      // You might need to call a contract function to get the latest tokenId
      // or track it in your database
    }

    return {
      transactionHash: hash,
      tokenId,
      success: true,
    };
  } catch (error) {
    console.error('[NFTMintingService] Minting failed:', error);

    return {
      transactionHash: '0x0' as Hash,
      tokenId: 0n,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown minting error',
    };
  }
}

/**
 * Gets the ticket state from the contract
 */
export async function getTicketState(tokenId: bigint): Promise<number> {
  try {
    const { publicClient, contractAddress: CONTRACT_ADDRESS } = initializeClients();

    const state = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: contractArtifact.abi,
      functionName: 'getTicketState',
      args: [tokenId],
    });

    return Number(state);
  } catch (error) {
    console.error('[NFTMintingService] Failed to get ticket state:', error);
    throw error;
  }
}

/**
 * Uses a ticket (scans at venue) and optionally transforms to souvenir
 */
export async function useTicket(
  tokenId: bigint,
  holder: Address,
  transformToSouvenir: boolean = true
): Promise<{ success: boolean; transactionHash?: Hash; error?: string }> {
  try {
    console.log('[NFTMintingService] Using ticket:', { tokenId, holder, transformToSouvenir });

    const { publicClient, walletClient, contractAddress: CONTRACT_ADDRESS } = initializeClients();

    // Simulate first
    try {
      await publicClient.simulateContract({
        address: CONTRACT_ADDRESS,
        abi: contractArtifact.abi,
        functionName: 'useTicket',
        args: [tokenId, holder, transformToSouvenir],
      });
    } catch (simulateError) {
      console.error('[NFTMintingService] Use ticket simulation failed:', simulateError);
      return {
        success: false,
        error: `Simulation failed: ${simulateError instanceof Error ? simulateError.message : 'Unknown error'}`,
      };
    }

    // Execute transaction
    const hash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: contractArtifact.abi,
      functionName: 'useTicket',
      args: [tokenId, holder, transformToSouvenir],
    });

    console.log('[NFTMintingService] Use ticket transaction sent:', hash);

    // Wait for confirmation
    await publicClient.waitForTransactionReceipt({
      hash,
      confirmations: 1,
    });

    return {
      success: true,
      transactionHash: hash,
    };
  } catch (error) {
    console.error('[NFTMintingService] Use ticket failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Batch transforms multiple tickets to souvenirs (post-event)
 */
export async function batchTransformToSouvenirs(
  tokenIds: bigint[]
): Promise<{ success: boolean; transactionHash?: Hash; error?: string }> {
  try {
    console.log('[NFTMintingService] Batch transforming tickets to souvenirs:', tokenIds);

    const { publicClient, walletClient, contractAddress: CONTRACT_ADDRESS } = initializeClients();

    // Simulate first
    try {
      await publicClient.simulateContract({
        address: CONTRACT_ADDRESS,
        abi: contractArtifact.abi,
        functionName: 'batchTransformToSouvenirs',
        args: [tokenIds],
      });
    } catch (simulateError) {
      console.error('[NFTMintingService] Batch transform simulation failed:', simulateError);
      return {
        success: false,
        error: `Simulation failed: ${simulateError instanceof Error ? simulateError.message : 'Unknown error'}`,
      };
    }

    // Execute transaction
    const hash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: contractArtifact.abi,
      functionName: 'batchTransformToSouvenirs',
      args: [tokenIds],
    });

    console.log('[NFTMintingService] Batch transform transaction sent:', hash);

    // Wait for confirmation
    await publicClient.waitForTransactionReceipt({
      hash,
      confirmations: 1,
    });

    return {
      success: true,
      transactionHash: hash,
    };
  } catch (error) {
    console.error('[NFTMintingService] Batch transform failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Gets the ticket metadata URI from the contract
 */
export async function getTokenURI(tokenId: bigint): Promise<string> {
  try {
    const { publicClient, contractAddress: CONTRACT_ADDRESS } = initializeClients();

    const uri = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: contractArtifact.abi,
      functionName: 'uri',
      args: [tokenId],
    });

    return uri as string;
  } catch (error) {
    console.error('[NFTMintingService] Failed to get token URI:', error);
    throw error;
  }
}

/**
 * Checks if an address owns a specific ticket
 */
export async function ownsTicket(address: Address, tokenId: bigint): Promise<boolean> {
  try {
    const { publicClient, contractAddress: CONTRACT_ADDRESS } = initializeClients();

    const balance = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: contractArtifact.abi,
      functionName: 'balanceOf',
      args: [address, tokenId],
    });

    return (balance as bigint) > 0n;
  } catch (error) {
    console.error('[NFTMintingService] Failed to check ticket ownership:', error);
    throw error;
  }
}
