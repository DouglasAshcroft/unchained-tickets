/**
 * Deploy UnchainedTickets contract to Base Mainnet
 *
 * ⚠️  WARNING: This deploys to MAINNET and uses REAL ETH!
 *
 * Usage:
 *   npx hardhat run scripts/deploy/deploy-mainnet.cjs --network baseMainnet
 *
 * Prerequisites:
 *   - MINTING_WALLET_PRIVATE_KEY set in .env
 *   - Wallet has at least 0.05 ETH on Base mainnet
 *   - BASESCAN_API_KEY set for verification
 *   - Contract tested successfully on Sepolia testnet
 */

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans);
    })
  );
}

async function main() {
  console.log("🚀 Deploying UnchainedTickets to Base Mainnet...\n");
  console.log("⚠️  WARNING: You are deploying to MAINNET!");
  console.log("⚠️  This will use REAL ETH and cannot be undone!\n");

  // Configuration
  const BASE_URI = "https://unchainedtickets.xyz/api/metadata/";
  const NETWORK = "baseMainnet";
  const CHAIN_ID = 8453;
  const MIN_BALANCE_ETH = "0.05"; // Minimum recommended balance

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  const balanceInEth = hre.ethers.formatEther(balance);

  console.log("📋 Deployment Configuration:");
  console.log("  Network:", NETWORK);
  console.log("  Chain ID:", CHAIN_ID);
  console.log("  Deployer:", deployer.address);
  console.log("  Balance:", balanceInEth, "ETH");
  console.log("  Base URI:", BASE_URI);
  console.log();

  // Check balance
  const minBalance = hre.ethers.parseEther(MIN_BALANCE_ETH);
  if (balance < minBalance) {
    throw new Error(
      `❌ Insufficient balance! You have ${balanceInEth} ETH, but need at least ${MIN_BALANCE_ETH} ETH for deployment and gas.`
    );
  }

  // Safety confirmation
  const answer = await askQuestion(
    "🔴 Are you SURE you want to deploy to MAINNET? Type 'DEPLOY' to continue: "
  );

  if (answer.toUpperCase() !== "DEPLOY") {
    console.log("❌ Deployment cancelled by user.");
    process.exit(0);
  }

  console.log();
  console.log("📦 Deploying contract...");

  // Deploy contract
  const UnchainedTickets = await hre.ethers.getContractFactory("UnchainedTickets");
  const contract = await UnchainedTickets.deploy(BASE_URI);

  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  console.log("✅ Contract deployed to:", contractAddress);
  console.log();

  // Wait for confirmations before verifying
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
      console.log(`   npx hardhat verify --network baseMainnet ${contractAddress} "${BASE_URI}"`);
    }
  }
  console.log();

  // Get final balance
  const finalBalance = await hre.ethers.provider.getBalance(deployer.address);
  const gasUsed = balance - finalBalance;

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
    gasUsed: hre.ethers.formatEther(gasUsed),
    basescanUrl: `https://basescan.org/address/${contractAddress}`,
    production: true,
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

  console.log("🎉 MAINNET Deployment Complete!");
  console.log();
  console.log("⚠️  CRITICAL NEXT STEPS:");
  console.log();
  console.log("1. UPDATE VERCEL ENVIRONMENT VARIABLES:");
  console.log(`   NFT_CONTRACT_ADDRESS="${contractAddress}"`);
  console.log(`   NEXT_PUBLIC_NETWORK="mainnet"`);
  console.log(`   NEXT_PUBLIC_CHAIN_ID="8453"`);
  console.log("   Then: Trigger redeploy in Vercel");
  console.log();
  console.log("2. UPDATE LOCAL .env:");
  console.log(`   NFT_CONTRACT_ADDRESS="${contractAddress}"`);
  console.log(`   NEXT_PUBLIC_NETWORK="mainnet"`);
  console.log(`   NEXT_PUBLIC_CHAIN_ID="8453"`);
  console.log();
  console.log("3. ADD CONTRACT TO DATABASE:");
  console.log("   npm run tsx scripts/ops/add-contract-to-db.ts");
  console.log();
  console.log("4. VERIFY ON BASESCAN:");
  console.log(`   https://basescan.org/address/${contractAddress}`);
  console.log();
  console.log("5. TEST PRODUCTION:");
  console.log("   - Create test event in admin dashboard");
  console.log("   - Make small purchase ($1-5)");
  console.log("   - Verify NFT mints correctly");
  console.log("   - Check metadata displays");
  console.log();
  console.log("💰 Gas Used:", hre.ethers.formatEther(gasUsed), "ETH");
  console.log("💰 Remaining Balance:", hre.ethers.formatEther(finalBalance), "ETH");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
