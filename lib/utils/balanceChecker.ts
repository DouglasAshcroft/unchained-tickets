import { createPublicClient, http, formatUnits, type Address } from 'viem';
import { base, baseSepolia } from 'viem/chains';

// USDC contract addresses
const BASE_USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as Address;
const BASE_SEPOLIA_USDC_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e' as Address;

// ERC20 ABI for balanceOf
const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
] as const;

/**
 * Get USDC balance for a wallet address
 * @param address - Wallet address to check
 * @returns USDC balance as a number (e.g., 25.50)
 */
export async function getUSDCBalance(address: string): Promise<number> {
  const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID) || 8453;
  const chain = chainId === 84532 ? baseSepolia : base;
  const usdcAddress = chainId === 84532 ? BASE_SEPOLIA_USDC_ADDRESS : BASE_USDC_ADDRESS;

  const publicClient = createPublicClient({
    chain,
    transport: http(),
  });

  try {
    const balance = await publicClient.readContract({
      address: usdcAddress,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [address as Address],
    });

    // USDC has 6 decimals
    return parseFloat(formatUnits(balance, 6));
  } catch (error) {
    console.error('Error fetching USDC balance:', error);
    return 0;
  }
}

/**
 * Poll for balance to reach or exceed target amount
 * Useful after onramp funding completes
 *
 * @param address - Wallet address to check
 * @param targetAmount - Target balance in USDC
 * @param maxAttempts - Maximum polling attempts (default: 30)
 * @param intervalMs - Polling interval in milliseconds (default: 2000)
 * @returns Promise that resolves with final balance or rejects on timeout
 */
export async function pollForBalance(
  address: string,
  targetAmount: number,
  maxAttempts: number = 30,
  intervalMs: number = 2000
): Promise<number> {
  return new Promise((resolve, reject) => {
    let attempts = 0;

    const checkBalance = async () => {
      attempts++;

      try {
        const balance = await getUSDCBalance(address);

        if (balance >= targetAmount) {
          resolve(balance);
          return;
        }

        if (attempts >= maxAttempts) {
          reject(
            new Error(
              `Balance polling timeout. Current: ${balance} USDC, Target: ${targetAmount} USDC`
            )
          );
          return;
        }

        // Continue polling
        setTimeout(checkBalance, intervalMs);
      } catch (error) {
        reject(error);
      }
    };

    // Start polling
    checkBalance();
  });
}

/**
 * Check if wallet has sufficient USDC balance
 * @param address - Wallet address
 * @param requiredAmount - Required amount in USDC
 * @returns Object with hasSufficient flag and current balance
 */
export async function checkSufficientBalance(
  address: string,
  requiredAmount: number
): Promise<{ hasSufficient: boolean; balance: number; shortfall: number }> {
  const balance = await getUSDCBalance(address);
  const hasSufficient = balance >= requiredAmount;
  const shortfall = hasSufficient ? 0 : requiredAmount - balance;

  return {
    hasSufficient,
    balance,
    shortfall,
  };
}
