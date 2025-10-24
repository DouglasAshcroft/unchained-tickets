import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import { mintTicket } from '@/lib/services/NFTMintingService';
import { getCoinbaseCommerceService } from '@/lib/services/CoinbaseCommerceService';
import { checkTierCapacity, getNextTicketNumber, formatSeatAssignment } from '@/lib/services/TicketReservationService';
import type { Address } from 'viem';

function toDecimal(value: number): Prisma.Decimal {
  return new Prisma.Decimal(value.toFixed(2));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      eventId,
      ticketTier,
      quantity,
      totalPrice,
      walletAddress,
      email,
      paymentMethod = 'wallet',
      onrampSessionId
    } = body;

    if (!eventId || !ticketTier || !quantity || quantity <= 0 || !totalPrice) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Email is required for all purchases now
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email address is required' }, { status: 400 });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { venue: true },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true';
    const perTicketPriceCents = Math.round((Number(totalPrice) / Number(quantity)) * 100);
    const totalPriceDecimal = toDecimal(Number(totalPrice));
    const rpcUrl = process.env.BASE_RPC_URL || process.env.NEXT_PUBLIC_BASE_RPC_URL;
    const mintingPrivateKey = process.env.MINTING_PRIVATE_KEY || process.env.MINTING_WALLET_PRIVATE_KEY;
    const mintingContractAddress = process.env.NFT_CONTRACT_ADDRESS || process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS;
    const canMintOnChain = Boolean(rpcUrl && mintingPrivateKey && mintingContractAddress);
    // Unused during Phase 1, will be needed in Phase 3.1 for NFT minting
    // const _maxMintRetries = Number(process.env.MINT_MAX_RETRIES ?? '3');

    if (isDevMode) {
      // Look up the ticket type based on tier name
      const ticketType = await prisma.eventTicketType.findFirst({
        where: {
          eventId,
          name: ticketTier,
          isActive: true,
        },
      });

      if (!ticketType) {
        return NextResponse.json({
          error: `Ticket tier "${ticketTier}" not found for this event`,
        }, { status: 404 });
      }

      // Check capacity BEFORE attempting to create ticket
      console.log('[create-charge] Checking tier capacity...');
      const capacityCheck = await checkTierCapacity(eventId, ticketType.id);

      if (capacityCheck.soldOut) {
        console.error(`[create-charge] ❌ Tier sold out: ${capacityCheck.ticketCount}/${capacityCheck.capacity}`);
        return NextResponse.json({
          success: false,
          error: 'Sold out',
          message: `Sorry, this ticket tier is sold out. All ${capacityCheck.capacity} tickets have been claimed.`,
        }, { status: 400 });
      }

      // Warn if low availability (less than 5 tickets)
      if (capacityCheck.available < 5 && capacityCheck.available > 0) {
        console.warn(`[create-charge] ⚠️ Low availability: only ${capacityCheck.available} tickets remaining`);
      }

      // Determine initial status based on payment method
      const initialStatus = paymentMethod === 'onramp' ? 'pending' : 'pending';
      const ticketStatus = paymentMethod === 'onramp' ? 'reserved' : 'reserved';

      // Retry logic to handle race conditions
      const MAX_RETRIES = 3;
      let retryCount = 0;
      let ticket;
      let charge;

      while (retryCount < MAX_RETRIES) {
        try {
          // Get next ticket number (atomic)
          const ticketNumber = await getNextTicketNumber(eventId, ticketType.id);

          if (ticketNumber.isAtCapacity) {
            console.error(`[create-charge] ❌ Capacity reached during ticket creation`);
            return NextResponse.json({
              success: false,
              error: 'Sold out',
              message: 'Sorry, this event just sold out. All tickets have been claimed.',
            }, { status: 400 });
          }

          // Format seat assignment
          const seatAssignment = formatSeatAssignment(ticketType.name, ticketNumber.seatNumber);
          console.log('[create-charge] Seat assignment:', seatAssignment);

          // Use transaction to ensure atomicity
          const result = await prisma.$transaction(async (tx) => {
            const ticket = await tx.ticket.create({
              data: {
                eventId,
                ticketTypeId: ticketType.id,
                userId: null,
                qrHash: `charge-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                priceCents: Number.isFinite(perTicketPriceCents) ? perTicketPriceCents : null,
                currency: 'USD',
                status: ticketStatus,
                // Add seat assignment to prevent duplicates
                seatSection: seatAssignment.seatSection,
                seatRow: seatAssignment.seatRow,
                seat: seatAssignment.seat,
              },
            });

            const chargeId = onrampSessionId || `mock-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

            const charge = await tx.charge.create({
              data: {
                chargeId,
                eventId,
                ticketId: ticket.id,
                ticketTier,
                quantity,
                totalPrice: totalPriceDecimal,
                status: initialStatus,
                walletAddress: walletAddress?.toLowerCase(),
                mintRetryCount: 0,
                mintLastError: null,
              },
            });

            return { ticket, charge };
          });

          // Success - assign to outer scope variables and break retry loop
          ticket = result.ticket;
          charge = result.charge;
          console.log(`[create-charge] ✅ Ticket created successfully: ${ticket.seatSection} ${ticket.seat}`);
          break;

        } catch (error) {
          // Check if this is a unique constraint error (race condition)
          if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            retryCount++;
            console.warn(`[create-charge] ⚠️ Unique constraint error, retry ${retryCount}/${MAX_RETRIES}`);

            if (retryCount >= MAX_RETRIES) {
              console.error('[create-charge] ❌ Max retries exceeded, event likely sold out');
              return NextResponse.json({
                success: false,
                error: 'High demand',
                message: 'This event is experiencing high demand. Please try again in a moment.',
              }, { status: 409 });
            }

            // Wait a bit before retrying (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, retryCount * 100));
            continue;
          }

          // Other error - throw it
          throw error;
        }
      }

      // Safety check - should never happen
      if (!ticket || !charge) {
        console.error('[create-charge] ❌ Ticket or charge not created after retry loop');
        return NextResponse.json({
          success: false,
          error: 'Internal error',
          message: 'Failed to create ticket. Please try again.',
        }, { status: 500 });
      }

      // Mint NFT if wallet address is provided and minting is configured
      if (walletAddress && canMintOnChain) {
        console.log('[create-charge] 🎫 Starting NFT minting process...');
        console.log('[create-charge] Wallet:', walletAddress);
        console.log('[create-charge] Event ID:', eventId);
        console.log('[create-charge] Ticket ID:', ticket.id);

        try {
          // Look up on-chain event ID and tier ID
          const blockchainRegistry = await prisma.eventBlockchainRegistry.findUnique({
            where: { eventId },
            include: {
              tierRegistrations: {
                where: { ticketTypeId: ticket.ticketTypeId! },
              },
            },
          });

          if (!blockchainRegistry) {
            console.error('[create-charge] ❌ Event not registered on blockchain');
            return NextResponse.json({
              success: false,
              error: 'Event not registered on blockchain. Cannot mint NFT.',
              message: '❌ This event is not set up for NFT minting.',
            }, { status: 500 });
          }

          const tierRegistration = blockchainRegistry.tierRegistrations[0];
          if (!tierRegistration) {
            console.error('[create-charge] ❌ Ticket tier not registered on blockchain');
            return NextResponse.json({
              success: false,
              error: 'Ticket tier not registered on blockchain. Cannot mint NFT.',
              message: '❌ This ticket type is not set up for NFT minting.',
            }, { status: 500 });
          }

          const onChainEventId = blockchainRegistry.onChainEventId;
          const onChainTierId = tierRegistration.onChainTierId;

          console.log('[create-charge] Using on-chain Event ID:', onChainEventId);
          console.log('[create-charge] Using on-chain Tier ID:', onChainTierId);

          const mintResult = await mintTicket({
            eventId: onChainEventId, // Use on-chain event ID
            tierId: onChainTierId, // Use on-chain tier ID
            recipient: walletAddress as Address,
            section: ticketTier,
            row: '1',
            seat: String(quantity),
          });

          if (mintResult.success) {
            console.log('[create-charge] ✅ NFT minted successfully!');
            console.log('[create-charge] Token ID:', mintResult.tokenId.toString());
            console.log('[create-charge] TX Hash:', mintResult.transactionHash);

            // Get the NFT contract for NFTMint record
            const contractAddress = process.env.NFT_CONTRACT_ADDRESS || process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS;
            const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID) || 84532;

            // Find or create NFT contract record
            const nftContract = await prisma.nFTContract.upsert({
              where: { address: contractAddress! },
              update: {},
              create: {
                chain: chainId === 84532 ? 'base-sepolia' : 'base',
                address: contractAddress!,
                name: 'Unchained Tickets',
                symbol: 'UNCHAINED',
              },
            });

            // Check if NFTMint record already exists (in case of retry)
            const existingMint = await prisma.nFTMint.findFirst({
              where: {
                contractId: nftContract.id,
                tokenId: mintResult.tokenId.toString(),
              },
            });

            // Update charge and ticket status, create NFTMint record if needed
            await prisma.$transaction(async (tx) => {
              await tx.charge.update({
                where: { id: charge.id },
                data: {
                  status: 'confirmed',
                  mintedTokenId: mintResult.tokenId.toString(),
                  transactionHash: mintResult.transactionHash,
                },
              });

              await tx.ticket.update({
                where: { id: ticket.id },
                data: {
                  status: 'minted',
                },
              });

              // Only create NFTMint if it doesn't already exist
              if (!existingMint) {
                await tx.nFTMint.create({
                  data: {
                    ticketId: ticket.id,
                    contractId: nftContract.id,
                    tokenId: mintResult.tokenId.toString(),
                    txHash: mintResult.transactionHash,
                    mintedAt: new Date(),
                  },
                });
              }
            });

            return NextResponse.json({
              success: true,
              chargeId: charge.chargeId,
              ticketId: ticket.id,
              tokenId: mintResult.tokenId.toString(),
              txHash: mintResult.transactionHash,
              status: 'confirmed',
              paymentMethod,
              message: '🎉 NFT ticket minted successfully! Check your wallet.',
            });
          } else {
            // Minting failed - update charge with error
            console.error('[create-charge] ❌ NFT minting failed:', mintResult.error);

            await prisma.charge.update({
              where: { id: charge.id },
              data: {
                status: 'failed',
                mintLastError: mintResult.error || 'Unknown minting error',
                mintRetryCount: 1,
              },
            });

            return NextResponse.json({
              success: false,
              chargeId: charge.chargeId,
              ticketId: ticket.id,
              status: 'failed',
              paymentMethod,
              error: mintResult.error,
              message: '❌ NFT minting failed. Please contact support with your charge ID.',
            }, { status: 500 });
          }
        } catch (mintError) {
          console.error('[create-charge] ❌ NFT minting exception:', mintError);

          // Update charge with error
          await prisma.charge.update({
            where: { id: charge.id },
            data: {
              status: 'failed',
              mintLastError: mintError instanceof Error ? mintError.message : 'Unknown error',
              mintRetryCount: 1,
            },
          });

          return NextResponse.json({
            success: false,
            chargeId: charge.chargeId,
            ticketId: ticket.id,
            status: 'failed',
            paymentMethod,
            error: mintError instanceof Error ? mintError.message : 'Unknown error',
            message: '❌ An error occurred during NFT minting. Please contact support.',
          }, { status: 500 });
        }
      }

      // No wallet or minting not configured
      if (walletAddress && !canMintOnChain) {
        console.warn('[create-charge] ⚠️ Minting skipped: missing configuration');
        console.warn('[create-charge] Required env vars: BASE_RPC_URL, MINTING_PRIVATE_KEY, NFT_CONTRACT_ADDRESS');
      }

      return NextResponse.json({
        success: true,
        chargeId: charge.chargeId,
        ticketId: ticket.id,
        status: walletAddress ? 'pending-mint' : 'pending-wallet',
        paymentMethod,
        message: paymentMethod === 'onramp'
          ? 'Charge created. Waiting for onramp confirmation.'
          : 'Charge created. Minting configuration needed.',
      });
    }

    try {
      // Look up the ticket type based on tier name
      const ticketType = await prisma.eventTicketType.findFirst({
        where: {
          eventId,
          name: ticketTier,
          isActive: true,
        },
      });

      if (!ticketType) {
        return NextResponse.json({
          error: `Ticket tier "${ticketTier}" not found for this event`,
        }, { status: 404 });
      }

      // Check capacity BEFORE attempting to create ticket (production mode)
      console.log('[create-charge] [PROD] Checking tier capacity...');
      const capacityCheck = await checkTierCapacity(eventId, ticketType.id);

      if (capacityCheck.soldOut) {
        console.error(`[create-charge] [PROD] ❌ Tier sold out: ${capacityCheck.ticketCount}/${capacityCheck.capacity}`);
        return NextResponse.json({
          success: false,
          error: 'Sold out',
          message: `Sorry, this ticket tier is sold out. All ${capacityCheck.capacity} tickets have been claimed.`,
        }, { status: 400 });
      }

      // Get next ticket number
      const ticketNumber = await getNextTicketNumber(eventId, ticketType.id);

      if (ticketNumber.isAtCapacity) {
        console.error(`[create-charge] [PROD] ❌ Capacity reached during ticket creation`);
        return NextResponse.json({
          success: false,
          error: 'Sold out',
          message: 'Sorry, this event just sold out. All tickets have been claimed.',
        }, { status: 400 });
      }

      // Format seat assignment
      const seatAssignment = formatSeatAssignment(ticketType.name, ticketNumber.seatNumber);
      console.log('[create-charge] [PROD] Seat assignment:', seatAssignment);

      const commerce = getCoinbaseCommerceService();
      const amountString = totalPriceDecimal.toString();

      // Create ticket first (outside transaction as we need to rollback if Coinbase fails)
      const ticket = await prisma.ticket.create({
        data: {
          eventId,
          ticketTypeId: ticketType.id,
          userId: null,
          qrHash: `charge-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          priceCents: Number.isFinite(perTicketPriceCents) ? perTicketPriceCents : null,
          currency: 'USD',
          status: 'reserved',
          // Add seat assignment to prevent duplicates
          seatSection: seatAssignment.seatSection,
          seatRow: seatAssignment.seatRow,
          seat: seatAssignment.seat,
        },
      });

      try {
        const charge = await commerce.createCharge({
          name: `${event.title} Ticket`,
          description: `Event on ${new Date(event.startsAt).toLocaleDateString()}`,
          localPrice: {
            amount: amountString,
            currency: 'USD',
          },
          metadata: {
            ticketId: ticket.id,
            eventId,
            ticketTier,
            quantity,
            walletAddress,
            email,
            paymentMethod,
          },
        });

        // Use transaction to link ticket and charge atomically
        await prisma.$transaction(async (tx) => {
          await tx.charge.create({
            data: {
              chargeId: charge.id,
              eventId,
              ticketId: ticket.id,
              ticketTier,
              quantity,
              totalPrice: totalPriceDecimal,
              status: 'pending',
              walletAddress,
              mintRetryCount: 0,
              mintLastError: null,
            },
          });
        });

        return NextResponse.json(
          {
            chargeId: charge.id,
            ticketId: ticket.id,
            hostedUrl: charge.hosted_url,
            status: 'pending',
          },
          { status: 201 }
        );
      } catch (chargeError) {
        // If Coinbase charge creation fails, clean up the ticket
        await prisma.ticket.delete({ where: { id: ticket.id } }).catch(console.error);
        throw chargeError;
      }
    } catch (error) {
      console.error('Charge creation error:', error);
      return NextResponse.json(
        {
          error: 'Failed to create charge',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in create-charge:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
