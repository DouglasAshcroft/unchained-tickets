import crypto from 'crypto';

const COINBASE_API_BASE = 'https://api.commerce.coinbase.com';
const API_VERSION = '2018-03-22';

type CreateChargeParams = {
  name: string;
  description?: string;
  localPrice: {
    amount: string;
    currency: string;
  };
  metadata?: Record<string, any>;
  redirectUrl?: string;
  cancelUrl?: string;
};

type CreateChargeResponse = {
  id: string;
  hosted_url?: string;
  timeline?: Array<{ status: string; time: string }>;
  metadata?: Record<string, any>;
};

export class CoinbaseCommerceService {
  private apiKey: string;

  constructor(apiKey?: string) {
    const key = apiKey ?? process.env.COINBASE_COMMERCE_API_KEY;
    if (!key) {
      throw new Error('COINBASE_COMMERCE_API_KEY is not configured');
    }
    this.apiKey = key;
  }

  async createCharge(params: CreateChargeParams): Promise<CreateChargeResponse> {
    const response = await fetch(`${COINBASE_API_BASE}/charges`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CC-Api-Key': this.apiKey,
        'X-CC-Version': API_VERSION,
      },
      body: JSON.stringify({
        name: params.name,
        description: params.description,
        pricing_type: 'fixed_price',
        local_price: params.localPrice,
        metadata: params.metadata,
        redirect_url: params.redirectUrl,
        cancel_url: params.cancelUrl,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Coinbase Commerce charge creation failed: ${response.status} ${errorBody}`);
    }

    const json = await response.json();
    return json.data as CreateChargeResponse;
  }

  static verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
    const secret = process.env.COINBASE_WEBHOOK_SECRET;
    if (!secret || !signature) {
      return false;
    }

    const computed = crypto
      .createHmac('sha256', secret)
      .update(rawBody, 'utf8')
      .digest('hex');

    const signatureBuffer = Buffer.from(signature, 'utf8');
    const computedBuffer = Buffer.from(computed, 'utf8');

    if (signatureBuffer.length !== computedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(signatureBuffer, computedBuffer);
  }
}

export function getCoinbaseCommerceService(apiKey?: string) {
  return new CoinbaseCommerceService(apiKey);
}
