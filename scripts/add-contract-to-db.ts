import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const contractAddress = process.env.NFT_CONTRACT_ADDRESS;

  if (!contractAddress) {
    console.error('❌ NFT_CONTRACT_ADDRESS not found in .env');
    process.exit(1);
  }

  console.log('\n📝 Adding NFT Contract to Database');
  console.log('===================================');
  console.log('Contract Address:', contractAddress);

  // Check if contract already exists
  const existing = await prisma.nFTContract.findFirst({
    where: { address: contractAddress },
  });

  if (existing) {
    console.log('\n✅ Contract already exists in database');
    console.log('   ID:', existing.id);
    console.log('   Chain:', existing.chain);
    console.log('   Address:', existing.address);
    return;
  }

  // Add contract to database
  const contract = await prisma.nFTContract.create({
    data: {
      chain: 'base-sepolia', // Change to 'base' for mainnet
      address: contractAddress,
      name: 'UnchainedTickets',
      symbol: 'UNCH',
    },
  });

  console.log('\n✅ Contract added to database');
  console.log('   ID:', contract.id);
  console.log('   Chain:', contract.chain);
  console.log('   Address:', contract.address);
  console.log('\n===================================\n');
}

main()
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
