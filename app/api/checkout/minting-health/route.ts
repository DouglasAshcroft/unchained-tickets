import { NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { base, baseSepolia } from 'viem/chains';

/**
 * Health check endpoint for NFT minting readiness
 * Returns whether minting is properly configured and operational
 */
export async function GET() {
  try {
    const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID) || 84532;
    const contractAddress = process.env.NFT_CONTRACT_ADDRESS || process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS;
    const mintingPrivateKey = process.env.MINTING_PRIVATE_KEY || process.env.MINTING_WALLET_PRIVATE_KEY;
    const rpcUrl = process.env.BASE_RPC_URL || process.env.NEXT_PUBLIC_BASE_RPC_URL;

    const checks = {
      contractAddress: !!contractAddress,
      mintingPrivateKey: !!mintingPrivateKey,
      rpcUrl: !!rpcUrl,
      chainId: !!chainId,
    };

    const allConfigured = Object.values(checks).every(Boolean);

    if (!allConfigured) {
      return NextResponse.json({
        healthy: false,
        ready: false,
        message: 'Minting not configured',
        checks,
        missingConfig: Object.entries(checks)
          .filter(([_, value]) => !value)
          .map(([key]) => key),
      }, { status: 503 });
    }

    // Test RPC connection
    const chain = chainId === 84532 ? baseSepolia : base;
    const publicClient = createPublicClient({
      chain,
      transport: http(rpcUrl),
    });

    try {
      const blockNumber = await publicClient.getBlockNumber();

      return NextResponse.json({
        healthy: true,
        ready: true,
        message: 'Minting operational',
        checks: {
          ...checks,
          rpcConnection: true,
          latestBlock: blockNumber.toString(),
        },
        config: {
          chain: chainId === 84532 ? 'base-sepolia' : 'base',
          chainId,
          contractAddress,
        },
      });
    } catch (rpcError) {
      return NextResponse.json({
        healthy: false,
        ready: false,
        message: 'RPC connection failed',
        checks: {
          ...checks,
          rpcConnection: false,
        },
        error: rpcError instanceof Error ? rpcError.message : 'Unknown RPC error',
      }, { status: 503 });
    }
  } catch (error) {
    return NextResponse.json({
      healthy: false,
      ready: false,
      message: 'Health check failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
