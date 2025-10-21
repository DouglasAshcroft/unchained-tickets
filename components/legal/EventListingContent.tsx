export function EventListingContent() {
  return (
    <div className="space-y-8">
      <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4 mb-8">
        <p className="text-sm text-blue-200">
          <strong>Purpose:</strong> This agreement is for promoters, venues or artists (collectively, "Event Organizers") listing events on the Platform. It covers obligations to provide accurate information, comply with pricing disclosure laws and manage refunds and cancellations.
        </p>
      </div>

      <section>
        <h2 className="text-2xl font-bold mb-4">1. Listing Events</h2>

        <h3 className="text-xl font-semibold mb-3">1.1 Event Submission</h3>
        <p className="mb-4">
          Event Organizers must provide accurate details, including event name, description, location, date, start/end times, pricing, age restrictions, accessibility information, and any additional fees. Organizers warrant that the information is correct and not misleading.
        </p>

        <h3 className="text-xl font-semibold mb-3">1.2 Approval</h3>
        <p className="mb-4">
          Unchained reserves the right to review and approve or reject event listings. We may request additional information or modifications.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">2. Pricing & Fee Disclosure</h2>

        <h3 className="text-xl font-semibold mb-3">2.1 All‑In Pricing</h3>
        <p className="mb-4">
          Organizers agree to comply with the FTC Junk Fees Rule, which requires that all mandatory fees (service fees, venue fees, taxes) be included in the total ticket price and displayed more prominently than any partial price. Optional add‑ons must be clearly identified and may not be pre‑selected.
        </p>

        <h3 className="text-xl font-semibold mb-3">2.2 Fee Changes</h3>
        <p className="mb-4">
          Organizers may not increase ticket prices or add new mandatory fees after tickets go on sale without the consent of ticket holders and Unchained.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">3. Refund & Cancellation Policy</h2>

        <h3 className="text-xl font-semibold mb-3">3.1 Organizer Cancellations</h3>
        <p className="mb-4">
          If an event is cancelled, Organizers must notify Unchained immediately. Ticket holders will be offered a full refund or, if feasible, the option to attend a rescheduled event.
        </p>

        <h3 className="text-xl font-semibold mb-3">3.2 Attendee Cancellations</h3>
        <p className="mb-4">
          Attendees may request a refund or exchange according to the Refund & Cancellation Policy (see section below). Organizers agree to honour these policies.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">4. Settlement & Reporting</h2>

        <h3 className="text-xl font-semibold mb-3">4.1 Settlement Schedule</h3>
        <p className="mb-4">
          Unchained will remit ticket revenue to Organizers, less commissions, processing fees, chargebacks and taxes, within [Number] business days after the event. Detailed settlement statements will be provided.
        </p>

        <h3 className="text-xl font-semibold mb-3">4.2 Chargebacks & Fraud</h3>
        <p className="mb-4">
          Organizers are responsible for fraudulent transactions relating to their events. If excessive chargebacks occur, Unchained may withhold additional reserves or terminate the listing.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">5. Compliance</h2>
        <p className="mb-4">
          Organizers must comply with all applicable laws, including consumer protection, data privacy, health and safety, and non‑discrimination laws. Organizers must obtain all required permits and licences. Unchained may remove listings that violate laws or our policies.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">6. Term & Termination</h2>
        <p className="mb-4">
          This Agreement applies to each event listing and continues until the event is concluded and all obligations are fulfilled. Unchained may remove listings for material breaches of this Agreement or the TOS.
        </p>
      </section>
    </div>
  );
}
