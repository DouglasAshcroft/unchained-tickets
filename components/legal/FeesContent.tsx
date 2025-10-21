export function FeesContent() {
  return (
    <div className="space-y-8">
      <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4 mb-8">
        <p className="text-sm text-blue-200">
          <strong>Purpose:</strong> Pursuant to the FTC Junk Fees Rule, Unchained provides transparent fee disclosures to ensure customers understand the total price before purchase.
        </p>
      </div>

      <p className="mb-8">
        Pursuant to the FTC Junk Fees Rule, Unchained provides the following fee disclosures:
      </p>

      <section>
        <h2 className="text-2xl font-bold mb-4">Total Price</h2>
        <p className="mb-4">
          The price displayed for any ticket or service is the total price, including all mandatory fees and charges. This total price will be prominently displayed and is the amount you will pay at checkout.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Breakdown of Fees</h2>
        <p className="mb-4">
          Where applicable, we disclose a breakdown of the ticket price, service fees, facility fees and taxes before you finalize your purchase.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Optional Add‑Ons</h2>
        <p className="mb-4">
          Optional products or services (e.g., VIP packages, merchandise) will be clearly labelled as optional and will not be pre‑selected. The price of each optional add‑on will be displayed separately.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Refundability of Fees</h2>
        <p className="mb-4">
          Mandatory fees may be refundable or non‑refundable depending on the event and our Refund & Cancellation Policy. Any non‑refundable fees will be identified.
        </p>
      </section>
    </div>
  );
}
