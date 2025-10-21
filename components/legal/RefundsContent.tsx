export function RefundsContent() {
  return (
    <div className="space-y-8">
      <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4 mb-8">
        <p className="text-sm text-blue-200">
          <strong>Purpose:</strong> This policy outlines the conditions under which ticket refunds are available and the process for requesting them.
        </p>
      </div>

      <section>
        <h2 className="text-2xl font-bold mb-4">1. General Policy</h2>
        <p className="mb-2">Tickets are non‑refundable except in the following circumstances:</p>

        <p className="mb-2"><strong>Event Cancellation:</strong> If an event is cancelled and not rescheduled, ticket holders will receive a full refund of the face value and mandatory fees.</p>

        <p className="mb-2"><strong>Event Rescheduling:</strong> If an event is rescheduled, tickets will be valid for the new date. Ticket holders may request a refund within [Number] days of the announcement.</p>

        <p className="mb-4"><strong>Significant Change:</strong> If the main artist or event is substantially changed (e.g., change in headliner), ticket holders may request a refund.</p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">2. Refund Process</h2>
        <p className="mb-4">
          Refund requests must be submitted through the Platform or by contacting [support@unchained.example.com] within the specified time frame. Refunds will be issued to the original payment method. Processing times may vary.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">3. Service Fees</h2>
        <p className="mb-4">
          Service fees and processing fees may be non‑refundable, except where required by law or if the event is cancelled.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">4. Partial Refunds</h2>
        <p className="mb-4">
          If a multi‑day event is partially cancelled, refunds may be prorated.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">5. Force Majeure</h2>
        <p className="mb-4">
          Events cancelled due to force majeure (e.g., natural disasters, government orders) may be subject to special refund rules. Unchained will work with Organizers to determine appropriate solutions.
        </p>
      </section>
    </div>
  );
}
