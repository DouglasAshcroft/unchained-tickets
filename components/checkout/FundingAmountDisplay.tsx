'use client';

interface FundingAmountDisplayProps {
  ticketPrice: number;
  fundingAmount: number;
  minimumRequired: number;
  currentBalance?: number;
  showBreakdown?: boolean;
}

/**
 * FundingAmountDisplay Component
 *
 * Shows clear breakdown when ticket price is below Coinbase minimum
 * or when user has partial balance and needs additional funding.
 */
export function FundingAmountDisplay({
  ticketPrice,
  fundingAmount,
  minimumRequired,
  currentBalance = 0,
  showBreakdown = true,
}: FundingAmountDisplayProps) {
  const isBelowMinimum = ticketPrice < minimumRequired;
  const remainder = fundingAmount - ticketPrice;
  const needsAdditionalFunds = currentBalance > 0 && currentBalance < ticketPrice;

  return (
    <div className="space-y-3">
      {/* Current Balance (if applicable) */}
      {needsAdditionalFunds && (
        <div className="p-3 bg-cobalt-500/10 border border-cobalt-500/30 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-cobalt-300">Current Wallet Balance</span>
          </div>
          <div className="text-lg font-bold text-cobalt-200">
            ${currentBalance.toFixed(2)} USDC
          </div>
        </div>
      )}

      {/* Funding Breakdown */}
      {showBreakdown && (
        <div className="p-4 bg-ink-800/60 border border-grit-500/30 rounded-lg space-y-2">
          <h4 className="text-sm font-semibold text-acid-400 mb-3">
            {isBelowMinimum ? 'Minimum Purchase Required' : 'Funding Breakdown'}
          </h4>

          <div className="space-y-2 text-sm">
            {/* Ticket Price */}
            <div className="flex justify-between items-center">
              <span className="text-grit-300">Ticket Price:</span>
              <span className="text-bone-100 font-semibold">
                ${ticketPrice.toFixed(2)}
              </span>
            </div>

            {/* Minimum requirement notice */}
            {isBelowMinimum && (
              <div className="flex justify-between items-center">
                <span className="text-grit-300">Coinbase Minimum:</span>
                <span className="text-bone-100 font-semibold">
                  ${minimumRequired.toFixed(2)}
                </span>
              </div>
            )}

            {/* Current balance (if partial) */}
            {needsAdditionalFunds && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-grit-300">Current Balance:</span>
                  <span className="text-cobalt-300 font-semibold">
                    -${currentBalance.toFixed(2)}
                  </span>
                </div>
                <div className="border-t border-grit-500/30 pt-2" />
              </>
            )}

            {/* Funding Amount */}
            <div className="flex justify-between items-center pt-2 border-t border-grit-500/30">
              <span className="text-bone-100 font-semibold">
                {needsAdditionalFunds ? 'Additional Funding Needed:' : "You&apos;ll Fund:"}
              </span>
              <span className="text-acid-400 font-bold text-lg">
                ${fundingAmount.toFixed(2)} USDC
              </span>
            </div>

            {/* Ticket Charge */}
            <div className="flex justify-between items-center">
              <span className="text-grit-300">Ticket Charge:</span>
              <span className="text-bone-100">
                ${ticketPrice.toFixed(2)}
              </span>
            </div>

            {/* Remainder */}
            {remainder > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-grit-300">Remaining in Wallet:</span>
                <span className="text-hack-green font-semibold">
                  +${remainder.toFixed(2)} USDC
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Info Message */}
      {isBelowMinimum && (
        <div className="p-3 bg-cobalt-500/10 border border-cobalt-500/30 rounded-lg">
          <div className="flex items-start gap-2">
            <span className="text-cobalt-300 text-lg">ℹ️</span>
            <div className="text-xs text-cobalt-300">
              <p className="font-medium mb-1">Minimum Purchase Required: ${minimumRequired.toFixed(2)}</p>
              <p>
                Coinbase requires a minimum ${minimumRequired.toFixed(2)} purchase.
                We&apos;ll charge ${ticketPrice.toFixed(2)} for your ticket, and the remaining{' '}
                ${remainder.toFixed(2)} USDC will stay in your wallet for future purchases.
              </p>
            </div>
          </div>
        </div>
      )}

      {needsAdditionalFunds && !isBelowMinimum && (
        <div className="p-3 bg-hack-green/10 border border-hack-green/30 rounded-lg">
          <div className="flex items-start gap-2">
            <span className="text-hack-green text-lg">💰</span>
            <div className="text-xs text-hack-green">
              <p className="font-medium mb-1">Top Up Your Wallet</p>
              <p>
                You have ${currentBalance.toFixed(2)} USDC. Add ${fundingAmount.toFixed(2)} more to complete your purchase.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
