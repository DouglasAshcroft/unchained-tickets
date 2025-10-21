export function PaymentTermsContent() {
  return (
    <div className="space-y-8">
      <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4 mb-8">
        <p className="text-sm text-blue-200">
          <strong>Purpose:</strong> This document outlines payment processing and settlement terms for Artists and Venues using the Unchained platform.
        </p>
      </div>

      <section>
        <h2 className="text-2xl font-bold mb-4">1. Payment Methods</h2>
        <p className="mb-4">
          Payments may be made via credit/debit card, ACH transfer, digital wallet or other methods supported by Unchained's payment processor. By providing a payment method, you represent that you are authorized to use it.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">2. Service Fees & Commissions</h2>
        <p className="mb-4">
          Unchained may charge service fees and commissions for facilitating ticket sales. These fees will be disclosed at checkout and included in the total price displayed.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">3. Currency & Taxes</h2>
        <p className="mb-4">
          Transactions are processed in [Currency] unless otherwise stated. Users are responsible for applicable taxes. Unchained may collect and remit taxes in jurisdictions where required.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">4. Chargebacks & Reversals</h2>
        <p className="mb-4">
          If a chargeback or payment reversal occurs, Unchained reserves the right to withhold funds from the relevant Artist, Venue or Organizer to cover the amount. Excessive chargebacks may result in suspension of the user's account.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">5. Payouts to Artists & Venues</h2>
        <p className="mb-4">
          Unchained will disburse funds owed to Artists and Venues according to the settlement schedule. To receive payouts, Artists and Venues must provide accurate bank account or payment details and tax information (e.g., W‑9 or W‑8 forms). Unchained may withhold taxes or reserves as required by law.
        </p>
      </section>
    </div>
  );
}
