const { ethers } = require("ethers");

async function main() {
  // Generate a random wallet
  const wallet = ethers.Wallet.createRandom();

  console.log("\n🔑 New Wallet Generated for Testnet Minting");
  console.log("==========================================\n");
  console.log("Address:", wallet.address);
  console.log("Private Key:", wallet.privateKey);
  console.log("\n⚠️  SECURITY WARNINGS:");
  console.log("1. This is for TESTNET ONLY - never use this wallet on mainnet");
  console.log("2. Add private key to .env file (MINTING_WALLET_PRIVATE_KEY)");
  console.log("3. NEVER commit .env file to git");
  console.log("4. For mainnet, use a hardware wallet or secure key management");

  console.log("\n📝 Add to your .env file:");
  console.log(`MINTING_WALLET_PRIVATE_KEY="${wallet.privateKey}"`);
  console.log(`MINTING_WALLET_ADDRESS="${wallet.address}"`);

  console.log("\n💰 Fund this wallet with Base Sepolia ETH:");
  console.log("1. Go to: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet");
  console.log("2. Or use: https://docs.base.org/tools/network-faucets");
  console.log("3. Send testnet ETH to:", wallet.address);
  console.log("\n🔍 Check balance at:");
  console.log(`https://sepolia.basescan.org/address/${wallet.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
