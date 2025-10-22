/**
 * Deploy UnchainedTickets contract to Base Sepolia Testnet
 *
 * Usage:
 *   npx hardhat run scripts/deploy/deploy-sepolia.cjs --network baseSepolia
 *
 * Prerequisites:
 *   - MINTING_WALLET_PRIVATE_KEY set in .env
 *   - Wallet has Sepolia ETH (get from faucet)
 *   - BASESCAN_API_KEY set for verification
 */

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Deploying UnchainedTickets to Base Sepolia...\n");

  // Configuration
  const BASE_URI = "https://unchainedtickets.xyz/api/metadata/";
  const NETWORK = "baseSepolia";
  const CHAIN_ID = 84532;

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  const balance = await hre.ethers.provider.getBalance(deployer.address);

  console.log("📋 Deployment Configuration:");
  console.log("  Network:", NETWORK);
  console.log("  Chain ID:", CHAIN_ID);
  console.log("  Deployer:", deployer.address);
  console.log("  Balance:", hre.ethers.formatEther(balance), "ETH");
  console.log("  Base URI:", BASE_URI);
  console.log();

  // Check balance
  if (balance === 0n) {
    throw new Error("❌ Deployer has no ETH! Get testnet ETH from: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet");
  }

  console.log("📦 Deploying contract...");

  // Deploy contract
  const UnchainedTickets = await hre.ethers.getContractFactory("UnchainedTickets");
  const contract = await UnchainedTickets.deploy(BASE_URI);

  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  console.log("✅ Contract deployed to:", contractAddress);
  console.log();

  // Wait for a few block confirmations before verifying
  console.log("⏳ Waiting for 5 block confirmations...");
  await contract.deploymentTransaction().wait(5);
  console.log("✅ Confirmed!");
  console.log();

  // Verify on Basescan
  console.log("🔍 Verifying contract on Basescan...");
  try {
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: [BASE_URI],
    });
    console.log("✅ Contract verified on Basescan!");
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("✅ Contract already verified on Basescan!");
    } else {
      console.log("⚠️  Verification failed:", error.message);
      console.log("   You can verify manually later with:");
      console.log(`   npx hardhat verify --network baseSepolia ${contractAddress} "${BASE_URI}"`);
    }
  }
  console.log();

  // Save deployment info
  const deploymentInfo = {
    network: NETWORK,
    chainId: CHAIN_ID,
    contractAddress: contractAddress,
    deployer: deployer.address,
    baseURI: BASE_URI,
    deployedAt: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber(),
    transactionHash: contract.deploymentTransaction().hash,
    basescanUrl: `https://sepolia.basescan.org/address/${contractAddress}`,
  };

  const deploymentsDir = path.join(__dirname, "../..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentFile = path.join(deploymentsDir, `${NETWORK}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));

  console.log("📄 Deployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  console.log();
  console.log("💾 Saved to:", deploymentFile);
  console.log();

  console.log("🎉 Deployment Complete!");
  console.log();
  console.log("📋 Next Steps:");
  console.log("1. Update .env with:");
  console.log(`   NFT_CONTRACT_ADDRESS="${contractAddress}"`);
  console.log(`   NEXT_PUBLIC_NETWORK="testnet"`);
  console.log(`   NEXT_PUBLIC_CHAIN_ID="${CHAIN_ID}"`);
  console.log();
  console.log("2. Add contract to database:");
  console.log("   npm run tsx scripts/ops/add-contract-to-db.ts");
  console.log();
  console.log("3. Test minting:");
  console.log("   - Create an event in admin dashboard");
  console.log("   - Buy a ticket");
  console.log("   - Verify NFT mints correctly");
  console.log();
  console.log("4. If tests pass, deploy to mainnet:");
  console.log("   npx hardhat run scripts/deploy/deploy-mainnet.cjs --network baseMainnet");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
