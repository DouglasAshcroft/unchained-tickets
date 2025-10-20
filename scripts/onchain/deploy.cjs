const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying UnchainedTickets contract with account:", deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)));

  // Base URI for metadata - points to your Next.js API
  const baseURI = process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/api/metadata/`
    : "https://tickets.unchained.xyz/api/metadata/";

  console.log("Base URI:", baseURI);

  // Deploy the contract
  const UnchainedTickets = await hre.ethers.getContractFactory("UnchainedTickets");
  const unchainedTickets = await UnchainedTickets.deploy(baseURI);

  await unchainedTickets.waitForDeployment();

  const contractAddress = await unchainedTickets.getAddress();

  console.log("\n✅ UnchainedTickets deployed to:", contractAddress);
  console.log("\n📝 Save this information to your .env file:");
  console.log(`NFT_CONTRACT_ADDRESS="${contractAddress}"`);
  console.log(`MINTING_WALLET_ADDRESS="${deployer.address}"`);

  console.log("\n⚠️  Don't forget to:");
  console.log("1. Verify the contract on BaseScan (see instructions below)");
  console.log("2. Update your .env file with the contract address");
  console.log("3. Fund the minting wallet with Base ETH for gas fees");

  console.log("\n🔍 To verify on BaseScan, run:");
  console.log(`npx hardhat verify --network ${hre.network.name} ${contractAddress} "${baseURI}"`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
