export function ContractorContent() {
  return (
    <div className="space-y-8">
      <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4 mb-8">
        <p className="text-sm text-blue-200">
          <strong>Purpose:</strong> Because artists and venues are independent contractors, we require a general independent contractor agreement that establishes the non-employment relationship and outlines responsibilities.
        </p>
      </div>

      <section>
        <h2 className="text-2xl font-bold mb-4">Parties & Services</h2>
        <p className="mb-4">
          Define the contractor and the services they provide (e.g., performances, venue management). Clarify that the contractor has discretion over how to deliver the services.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Payment & Expenses</h2>
        <p className="mb-4">
          Outline compensation and reimbursement of expenses. Contractors are responsible for their own taxes and insurance.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Term & Termination</h2>
        <p className="mb-4">
          Specify duration and termination rights.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Confidentiality</h2>
        <p className="mb-4">
          Require contractors to maintain confidentiality of proprietary information.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Indemnification</h2>
        <p className="mb-4">
          Contractor indemnifies Unchained against claims arising from their actions.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Compliance with Laws</h2>
        <p className="mb-4">
          Contractor must comply with all applicable laws and obtain necessary licenses.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">No Employment Relationship</h2>
        <p className="mb-4">
          Confirm that nothing in the agreement creates an employer–employee relationship.
        </p>
      </section>
    </div>
  );
}
