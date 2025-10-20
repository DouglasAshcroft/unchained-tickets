import crypto from 'crypto';

/**
 * Coinbase Onramp Service
 * Handles secure integration with Coinbase Developer Platform (CDP) Onramp API
 *
 * Features:
 * - JWT generation for API authentication
 * - Session token creation for secure onramp initialization
 * - Minimum purchase validation
 * - Onramp configuration fetching
 */

// Types
export type OnrampSessionParams = {
  walletAddress: string;
  clientIp: string;
  presetFiatAmount: number;
  assetSymbol?: string;
  blockchain?: string;
  partnerUserId?: string;
};

export type SessionTokenResponse = {
  token: string;
  expiresAt: string;
};

export type FundingCalculation = {
  fundingAmount: number;
  ticketCharge: number;
  remainder: number;
  belowMinimum: boolean;
};

export type OnrampConfig = {
  supportedCountries: string[];
  supportedPaymentMethods: string[];
  supportedAssets: Array<{
    symbol: string;
    name: string;
    networks: string[];
  }>;
};

export class CoinbaseOnrampService {
  private apiUrl: string;
  private apiKeyName: string | null = null;
  private apiKeyPrivateKey: string | null = null;
  private minimumUsd: number;

  constructor() {
    this.apiUrl = process.env.COINBASE_ONRAMP_API_URL || 'https://api.developer.coinbase.com';
    this.apiKeyName = process.env.CDP_API_KEY_NAME || null;
    this.apiKeyPrivateKey = process.env.CDP_API_KEY_PRIVATE_KEY || null;
    this.minimumUsd = parseFloat(process.env.COINBASE_ONRAMP_MINIMUM_USD || '10.00');
  }

  /**
   * Generate JWT for Coinbase CDP API authentication
   * Uses ES256 algorithm with EC private key
   */
  private generateJWT(): string {
    if (!this.apiKeyName || !this.apiKeyPrivateKey) {
      throw new Error('CDP API credentials not configured. Set CDP_API_KEY_NAME and CDP_API_KEY_PRIVATE_KEY');
    }

    const header = {
      alg: 'ES256',
      typ: 'JWT',
      kid: this.apiKeyName,
    };

    const now = Math.floor(Date.now() / 1000);
    const payload = {
      sub: this.apiKeyName,
      iss: 'coinbase-cloud',
      aud: ['cdp_service'],
      nbf: now,
      exp: now + 120, // 2 minute expiration
      iat: now,
    };

    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const message = `${encodedHeader}.${encodedPayload}`;

    // Sign with EC private key
    const sign = crypto.createSign('SHA256');
    sign.update(message);
    sign.end();

    const signature = sign.sign(
      {
        key: this.apiKeyPrivateKey,
        format: 'pem',
        type: 'pkcs8',
      },
      'base64url'
    );

    return `${message}.${signature}`;
  }

  /**
   * Create a secure onramp session token
   * Required for production Coinbase Onramp initialization
   *
   * @param params Session parameters including wallet address and amount
   * @returns Session token and expiration time
   */
  async createSession(params: OnrampSessionParams): Promise<SessionTokenResponse> {
    const jwt = this.generateJWT();

    const requestBody = {
      destination_wallets: [
        {
          address: params.walletAddress,
          blockchains: [params.blockchain || 'base'],
          assets: [params.assetSymbol || 'USDC'],
        },
      ],
      partner_user_id: params.partnerUserId,
    };

    const response = await fetch(`${this.apiUrl}/onramp/v1/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwt}`,
        'Content-Type': 'application/json',
        'X-Client-IP': params.clientIp,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Coinbase Onramp session creation failed: ${response.status} ${errorBody}`);
    }

    const data = await response.json();

    return {
      token: data.token,
      expiresAt: data.expires_at || new Date(Date.now() + 10 * 60 * 1000).toISOString(), // Default 10 min
    };
  }

  /**
   * Calculate funding amount considering Coinbase minimum
   *
   * @param ticketPrice Actual ticket price
   * @returns Calculation showing funding amount, charge, and remainder
   */
  calculateFundingAmount(ticketPrice: number): FundingCalculation {
    if (ticketPrice >= this.minimumUsd) {
      return {
        fundingAmount: ticketPrice,
        ticketCharge: ticketPrice,
        remainder: 0,
        belowMinimum: false,
      };
    } else {
      return {
        fundingAmount: this.minimumUsd,
        ticketCharge: ticketPrice,
        remainder: this.minimumUsd - ticketPrice,
        belowMinimum: true,
      };
    }
  }

  /**
   * Validate if purchase amount meets minimum requirements
   */
  validateMinimumPurchase(amount: number): boolean {
    return amount >= this.minimumUsd;
  }

  /**
   * Get minimum purchase amount
   */
  getMinimumPurchaseAmount(): number {
    return this.minimumUsd;
  }

  /**
   * Fetch Coinbase Onramp configuration
   * Returns supported countries, payment methods, and assets
   */
  async getOnrampConfig(): Promise<OnrampConfig> {
    const projectId = process.env.NEXT_PUBLIC_CDP_PROJECT_ID;

    if (!projectId) {
      throw new Error('CDP_PROJECT_ID not configured');
    }

    const response = await fetch(
      `${this.apiUrl}/onramp/v1/config?project_id=${projectId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Failed to fetch onramp config: ${response.status} ${errorBody}`);
    }

    const data = await response.json();

    return {
      supportedCountries: data.countries || [],
      supportedPaymentMethods: data.payment_methods || [],
      supportedAssets: data.assets || [],
    };
  }

  /**
   * Check if service is properly configured
   */
  isConfigured(): boolean {
    return !!(
      this.apiKeyName &&
      this.apiKeyPrivateKey &&
      process.env.NEXT_PUBLIC_CDP_PROJECT_ID
    );
  }

  /**
   * Check if onramp is enabled
   */
  isEnabled(): boolean {
    return process.env.NEXT_PUBLIC_COINBASE_ONRAMP_ENABLED === 'true';
  }
}

// Singleton instance
let coinbaseOnrampServiceInstance: CoinbaseOnrampService | null = null;

/**
 * Get or create CoinbaseOnrampService singleton
 */
export function getCoinbaseOnrampService(): CoinbaseOnrampService {
  if (!coinbaseOnrampServiceInstance) {
    coinbaseOnrampServiceInstance = new CoinbaseOnrampService();
  }
  return coinbaseOnrampServiceInstance;
}
