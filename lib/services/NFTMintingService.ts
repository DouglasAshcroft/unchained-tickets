import { ethers } from 'ethers';
import UnchainedTicketsABI from '@/contracts/UnchainedTickets.json';

export interface MintTicketParams {
  eventId: number;
  tierId: number;
  recipientAddress: string;
  section?: string;
  row?: string;
  seat?: string;
}

export interface CreateEventParams {
  eventId: number;
  maxSupply: number;
  eventTimestamp: number;
  eventEndTimestamp: number;
  metadataURI: string;
  souvenirMetadataURI: string;
  royaltyRecipient: string;
  royaltyBps: number;
}

export interface CreateTierParams {
  eventId: number;
  tierName: string;
  tier: number; // 0=GA, 1=VIP, 2=Premium, etc.
  maxSupply: number;
  priceCents: number;
  accessAreas: string[];
  includedPerks: string[];
}

export class NFTMintingService {
  private provider: ethers.Provider;
  private wallet: ethers.Wallet;
  private contract: ethers.Contract;
  private contractAddress: string;

  constructor() {
    // Initialize provider (Base Sepolia for testnet, Base mainnet for production)
    const rpcUrl = process.env.BASE_RPC_URL || process.env.NEXT_PUBLIC_BASE_RPC_URL;
    if (!rpcUrl) {
      throw new Error('BASE_RPC_URL or NEXT_PUBLIC_BASE_RPC_URL not configured');
    }

    this.provider = new ethers.JsonRpcProvider(rpcUrl);

    // Initialize minting wallet
    const privateKey = process.env.MINTING_PRIVATE_KEY || process.env.MINTING_WALLET_PRIVATE_KEY;
    if (!privateKey) {
      throw new Error('MINTING_PRIVATE_KEY (or legacy MINTING_WALLET_PRIVATE_KEY) not configured');
    }

    this.wallet = new ethers.Wallet(privateKey, this.provider);

    // Initialize contract
    this.contractAddress =
      process.env.NFT_CONTRACT_ADDRESS || process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS || '';
    if (!this.contractAddress) {
      throw new Error('NFT_CONTRACT_ADDRESS not configured');
    }

    this.contract = new ethers.Contract(
      this.contractAddress,
      UnchainedTicketsABI.abi,
      this.wallet
    );
  }

  /**
   * Create an event on the smart contract
   */
  async createEvent(params: CreateEventParams): Promise<string> {
    try {
      const tx = await this.contract.createEvent(
        params.eventId,
        params.maxSupply,
        params.eventTimestamp,
        params.eventEndTimestamp,
        params.metadataURI,
        params.souvenirMetadataURI,
        params.royaltyRecipient,
        params.royaltyBps
      );

      const receipt = await tx.wait();
      return receipt.hash;
    } catch (error) {
      console.error('Error creating event on chain:', error);
      throw new Error(`Failed to create event on chain: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create a ticket tier for an event
   */
  async createTier(params: CreateTierParams): Promise<string> {
    try {
      const tx = await this.contract.createTier(
        params.eventId,
        params.tierName,
        params.tier,
        params.maxSupply,
        params.priceCents,
        params.accessAreas,
        params.includedPerks
      );

      const receipt = await tx.wait();
      return receipt.hash;
    } catch (error) {
      console.error('Error creating tier on chain:', error);
      throw new Error(`Failed to create tier on chain: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Mint a ticket NFT for a user
   */
  async mintTicket(params: MintTicketParams): Promise<{ txHash: string; tokenId: string }> {
    try {
      // Call contract to mint ticket
      const tx = await this.contract.mintTicketWithTier(
        params.eventId,
        params.tierId,
        params.recipientAddress,
        params.section || '',
        params.row || '',
        params.seat || ''
      );

      const receipt = await tx.wait();

      // Extract token ID from event logs
      const mintEvent = receipt.logs
        .map((log: any) => {
          try {
            return this.contract.interface.parseLog(log);
          } catch {
            return null;
          }
        })
        .find((event: any) => event?.name === 'TicketMinted');

      if (!mintEvent) {
        throw new Error('TicketMinted event not found in transaction logs');
      }

      const tokenId = mintEvent.args.tokenId.toString();

      return {
        txHash: receipt.hash,
        tokenId: tokenId,
      };
    } catch (error) {
      console.error('Error minting ticket:', error);
      throw new Error(`Failed to mint ticket: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check in a ticket (mark as used)
   */
  async useTicket(tokenId: string | number, ticketHolderAddress: string, transformToSouvenir: boolean = true): Promise<string> {
    try {
      const tx = await this.contract.useTicket(
        tokenId,
        ticketHolderAddress,
        transformToSouvenir
      );

      const receipt = await tx.wait();
      return receipt.hash;
    } catch (error) {
      console.error('Error using ticket:', error);
      throw new Error(`Failed to use ticket: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Consume a perk (e.g., redeem a beer)
   */
  async consumePerk(eventId: number, ticketHolderAddress: string, perkName: string, quantity: number = 1): Promise<string> {
    try {
      const tx = await this.contract.consumePerk(
        eventId,
        ticketHolderAddress,
        perkName,
        quantity
      );

      const receipt = await tx.wait();
      return receipt.hash;
    } catch (error) {
      console.error('Error consuming perk:', error);
      throw new Error(`Failed to consume perk: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if a user can access a specific area
   */
  async canAccessArea(eventId: number, tokenId: string | number, area: string): Promise<boolean> {
    try {
      return await this.contract.canAccessArea(eventId, tokenId, area);
    } catch (error) {
      console.error('Error checking access:', error);
      return false;
    }
  }

  /**
   * Get ticket state (ACTIVE, USED, SOUVENIR)
   */
  async getTicketState(tokenId: string | number): Promise<number> {
    try {
      return await this.contract.getTicketState(tokenId);
    } catch (error) {
      console.error('Error getting ticket state:', error);
      throw new Error(`Failed to get ticket state: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get perk consumption status
   */
  async getPerkStatus(eventId: number, holderAddress: string, perkName: string): Promise<{ maxQuantity: number; consumed: number }> {
    try {
      const [maxQuantity, consumed] = await this.contract.getPerkStatus(
        eventId,
        holderAddress,
        perkName
      );

      return {
        maxQuantity: Number(maxQuantity),
        consumed: Number(consumed),
      };
    } catch (error) {
      console.error('Error getting perk status:', error);
      throw new Error(`Failed to get perk status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get seat assignment for a token
   */
  async getSeatAssignment(eventId: number, tokenId: string | number): Promise<{ section: string; row: string; seat: string }> {
    try {
      const [section, row, seat] = await this.contract.getSeatAssignment(eventId, tokenId);

      return { section, row, seat };
    } catch (error) {
      console.error('Error getting seat assignment:', error);
      throw new Error(`Failed to get seat assignment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get contract address
   */
  getContractAddress(): string {
    return this.contractAddress;
  }

  /**
   * Get minting wallet address
   */
  getMintingWalletAddress(): string {
    return this.wallet.address;
  }

  /**
   * Check minting wallet balance
   */
  async getMintingWalletBalance(): Promise<string> {
    const balance = await this.provider.getBalance(this.wallet.address);
    return ethers.formatEther(balance);
  }
}
