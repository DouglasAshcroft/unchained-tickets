/**
 * Grant MINTER_ROLE to the minting wallet
 *
 * This allows the minting wallet to mint NFT tickets
 * Must be run by the contract owner (deployer)
 */

const hre = require("hardhat");

async function main() {
  console.log("🔐 Granting MINTER_ROLE to minting wallet...\n");

  // Load contract address from deployment
  const fs = require("fs");
  const path = require("path");

  const deploymentFile = path.join(__dirname, "../deployments/baseSepolia.json");

  if (!fs.existsSync(deploymentFile)) {
    throw new Error("❌ Deployment file not found. Deploy the contract first.");
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentFile, "utf-8"));
  const contractAddress = deployment.contractAddress;
  const mintingWallet = process.env.MINTING_WALLET_ADDRESS || "0x5B33aA418a6d455AADc391841788e8F72Df5ECd9";

  console.log("📋 Configuration:");
  console.log("  Contract:", contractAddress);
  console.log("  Minting Wallet:", mintingWallet);
  console.log();

  // Get the contract
  const [owner] = await hre.ethers.getSigners();
  console.log("  Owner (signer):", owner.address);
  console.log();

  const UnchainedTickets = await hre.ethers.getContractFactory("UnchainedTickets");
  const contract = UnchainedTickets.attach(contractAddress);

  // MINTER_ROLE is keccak256("MINTER_ROLE")
  const MINTER_ROLE = "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6";

  // Check if already has role
  console.log("🔍 Checking current role status...");
  const hasRole = await contract.hasRole(MINTER_ROLE, mintingWallet);

  if (hasRole) {
    console.log("✅ Minting wallet already has MINTER_ROLE!");
    console.log();
    return;
  }

  console.log("⏳ Granting MINTER_ROLE...");

  // Grant the role
  const tx = await contract.grantRole(MINTER_ROLE, mintingWallet);
  console.log("  Transaction hash:", tx.hash);

  // Wait for confirmation
  const receipt = await tx.wait();
  console.log("  Block number:", receipt.blockNumber);
  console.log();

  // Verify it was granted
  const hasRoleNow = await contract.hasRole(MINTER_ROLE, mintingWallet);

  if (hasRoleNow) {
    console.log("✅ MINTER_ROLE successfully granted!");
    console.log();
    console.log("🎉 The minting wallet can now mint NFT tickets!");
  } else {
    console.log("❌ Failed to grant MINTER_ROLE. Please check permissions.");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
