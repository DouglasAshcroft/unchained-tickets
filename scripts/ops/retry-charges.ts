#!/usr/bin/env ts-node

import { prisma } from '../../lib/db/prisma';

async function main() {
  const maxRetries = Number(process.env.MINT_MAX_RETRIES ?? '3');
  const charges = await prisma.charge.findMany({
    where: {
      status: 'retrying',
      mintRetryCount: {
        lt: maxRetries,
      },
    },
  });

  if (!charges.length) {
    console.log('No charges marked as retrying.');
    return;
  }

  console.log(`Found ${charges.length} retrying charge(s). Resetting to pending...`);

  for (const charge of charges) {
    await prisma.charge.update({
      where: { id: charge.id },
      data: {
        status: 'pending',
      },
    });
    console.log(`Charge ${charge.chargeId} reset to pending.`);
  }

  console.log('Done.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
