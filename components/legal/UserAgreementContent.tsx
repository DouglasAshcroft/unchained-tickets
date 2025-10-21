export function UserAgreementContent() {
  return (
    <div className="space-y-8">
      <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4 mb-8">
        <p className="text-sm text-blue-200">
          <strong>Purpose:</strong> This agreement supplements the TOS for ticket buyers and attendees.
        </p>
      </div>

      <section>
        <h2 className="text-2xl font-bold mb-4">1. Ticket Purchase & Use</h2>

        <p className="mb-2">Tickets purchased through the Platform are revocable licenses that grant the holder the right to attend the event specified. Tickets may not be resold or transferred except as permitted by the event organizer and applicable law.</p>

        <p className="mb-2">All ticket sales are final unless the event is cancelled or rescheduled. Refund eligibility is described in the Refund & Cancellation Policy.</p>

        <p className="mb-4">Attendees may be subject to search for security purposes and must comply with venue rules (including age restrictions, prohibited items and code of conduct). Failure to comply may result in denial of entry without refund.</p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">2. Assumption of Risk</h2>
        <p className="mb-4">
          Attending live events involves certain inherent risks (e.g., crowd activity, loud music, lighting effects). Attendees assume all risks and release Unchained, artists and venues from liability for personal injury, property damage or other loss, except as caused by gross negligence.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">3. Conduct at Events</h2>
        <p className="mb-4">
          Attendees must behave respectfully and comply with event and venue policies. Unruly behaviour, harassment, intoxication, illegal drug use or violence may result in removal from the event without refund.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">4. Prohibited Items & Activities</h2>
        <p className="mb-4">
          Prohibited items may include weapons, illegal substances, recording equipment (unless authorized), and other items listed by the venue. Unauthorized commercial activity (e.g., vending, solicitation) is prohibited.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">5. Media Release</h2>
        <p className="mb-4">
          Attendees grant Unchained and the event organizer the right to record, photograph and use their image, likeness and voice for promotional purposes without compensation.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">6. Accessibility</h2>
        <p className="mb-4">
          If you require accommodations due to a disability, please contact the venue or Unchained in advance. We will make reasonable efforts to provide accessible seating and services.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">7. Dispute Resolution</h2>
        <p className="mb-4">
          Any disputes arising from ticket purchases or attendance shall be handled as described in the TOS.
        </p>
      </section>
    </div>
  );
}
