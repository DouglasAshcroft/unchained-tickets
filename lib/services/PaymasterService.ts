import { randomUUID } from 'crypto';
import { type Address, encodeFunctionData } from 'viem';
import { base, baseSepolia } from 'viem/chains';
import contractArtifact from '@/contracts/UnchainedTickets.json';
import { eventService } from './EventService';
import { prisma } from '@/lib/db/prisma';

export type PaymasterMintRequest = {
  eventId: number;
  ticketTier: string;
  quantity: number;
  totalPrice: number;
  walletAddress: string;
  purchaserEmail?: string;
  transactionReference?: string;
};

export type PaymasterMintResult = {
  transactionId: string;
};

let paymasterClient: any = null;
let usePaymaster = false;

/**
 * Initialize Base Paymaster client (lazy initialization)
 */
function initializePaymaster() {
  if (paymasterClient !== null) {
    return;
  }

  const paymasterUrl = process.env.BASE_PAYMASTER_URL;
  const paymasterKey = process.env.BASE_PAYMASTER_API_KEY;

  if (!paymasterUrl || !paymasterKey) {
    console.warn(
      '⚠️  Base Paymaster not configured. Minting will not work in production.\n' +
      '   Set BASE_PAYMASTER_URL and BASE_PAYMASTER_API_KEY for gas sponsorship'
    );
    usePaymaster = false;
    paymasterClient = false;
    return;
  }

  try {
    // The CDP SDK has paymaster capabilities built in
    // We can use it to sponsor transactions
    const { Coinbase } = require('@coinbase/cdp-sdk');

    paymasterClient = Coinbase.configureFromJson({
      apiKeyName: paymasterKey,
      privateKey: process.env.BASE_PAYMASTER_PRIVATE_KEY || '',
    });

    usePaymaster = true;
    console.log('✅ Base Paymaster initialized');
  } catch (error) {
    console.warn(
      '⚠️  Failed to initialize Base Paymaster.\n' +
      '   Error:', error instanceof Error ? error.message : 'Unknown error'
    );
    usePaymaster = false;
    paymasterClient = false;
  }
}

/**
 * Integration with Base Paymaster to mint NFTs after a card payment.
 */
export async function mintTicketsWithPaymaster(
  request: PaymasterMintRequest
): Promise<PaymasterMintResult> {
  // Initialize paymaster on first use
  if (paymasterClient === null) {
    initializePaymaster();
  }

  // In development or if paymaster is not configured, return a mock transaction
  if (!usePaymaster || !paymasterClient) {
    console.warn('[PaymasterService] Paymaster not available, returning mock transaction');
    return {
      transactionId: randomUUID(),
    };
  }

  try {
    // 1. Fetch event and tier metadata
    const event = await eventService.getEventById(request.eventId);
    if (!event) {
      throw new Error(`Event ${request.eventId} not found`);
    }

    // Find the ticket tier
    const tier = await prisma.eventTicketType.findFirst({
      where: {
        eventId: request.eventId,
        name: request.ticketTier,
      },
    });

    if (!tier) {
      throw new Error(`Ticket tier "${request.ticketTier}" not found for event ${request.eventId}`);
    }

    // 2. Get contract configuration
    const NETWORK = process.env.NEXT_PUBLIC_NETWORK === 'mainnet' ? 'mainnet' : 'testnet';
    const CONTRACT_ADDRESS = (process.env.NFT_CONTRACT_ADDRESS || process.env.NEXT_PUBLIC_CONTRACT_ADDRESS) as Address;
    const _chain = NETWORK === 'mainnet' ? base : baseSepolia;

    if (!CONTRACT_ADDRESS) {
      throw new Error('Contract address not configured');
    }

    // 3. Build the mint transaction calldata
    // For now, we'll mint the first ticket. In a real implementation,
    // you'd loop through and mint multiple tickets based on quantity
    const calldata = encodeFunctionData({
      abi: contractArtifact.abi,
      functionName: 'mintTicketWithTier',
      args: [
        BigInt(request.eventId),
        BigInt(tier.id),
        request.walletAddress as Address,
        'GENERAL', // section - could be passed from request
        '1', // row - could be passed from request
        '1', // seat - could be passed from request
      ],
    });

    // 4. Request gas sponsorship from Base Paymaster
    // This is a simplified implementation - the actual CDP SDK integration
    // would use the smart wallet SDK to sponsor the transaction
    console.log('[PaymasterService] Requesting gas sponsorship for wallet:', request.walletAddress);
    console.log('[PaymasterService] Contract:', CONTRACT_ADDRESS);
    console.log('[PaymasterService] Calldata length:', calldata.length);

    // 5. Submit the sponsored transaction
    // In a real implementation, this would:
    // - Create a UserOperation for the smart wallet
    // - Get paymaster data from Base Paymaster
    // - Submit via bundler
    // For now, we return a mock hash
    const transactionHash = randomUUID();

    console.log('[PaymasterService] Mock transaction submitted:', transactionHash);

    return {
      transactionId: transactionHash,
    };
  } catch (error) {
    console.error('[PaymasterService] Minting failed:', error);
    throw new Error(
      `Failed to mint tickets: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
