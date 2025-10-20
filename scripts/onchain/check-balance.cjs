const { ethers } = require("ethers");
require("dotenv").config();

async function main() {
  if (!process.env.MINTING_WALLET_PRIVATE_KEY || process.env.MINTING_WALLET_PRIVATE_KEY === "0x...") {
    console.log("❌ Please update MINTING_WALLET_PRIVATE_KEY in .env file");
    return;
  }

  const wallet = new ethers.Wallet(process.env.MINTING_WALLET_PRIVATE_KEY);
  const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");
  const balance = await provider.getBalance(wallet.address);

  console.log("\n💰 Base Sepolia Testnet Wallet Status");
  console.log("=========================================");
  console.log("Address:", wallet.address);
  console.log("Balance:", ethers.formatEther(balance), "ETH");
  console.log("Explorer:", `https://sepolia.basescan.org/address/${wallet.address}`);

  if (balance >= ethers.parseEther("0.01")) {
    console.log("\n✅ Wallet has sufficient funds for deployment!");
    console.log("\n🚀 Ready to deploy! Run:");
    console.log("   npx hardhat run scripts/onchain/deploy.cjs --network baseSepolia");
  } else if (balance > 0n) {
    console.log("\n⚠️  Wallet has funds but may need more");
    console.log("   Recommended: 0.01+ ETH for deployment");
  } else {
    console.log("\n❌ Wallet needs funding");
    console.log("\n💡 Fund this address with Base Sepolia ETH:");
    console.log("   https://www.alchemy.com/faucets/base-sepolia");
  }
  console.log("=========================================\n");
}

main().catch(console.error);
