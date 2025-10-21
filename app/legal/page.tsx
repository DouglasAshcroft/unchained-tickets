import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Legal Documents | Unchained',
  description: 'Access all legal documents, policies, and agreements for the Unchained platform',
};

export default function LegalHubPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Legal Documents</h1>
          <p className="text-gray-400 mb-12">
            Access all legal documents, policies, and agreements for the Unchained platform.
          </p>

          {/* Public Legal Documents */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">General Legal Documents</h2>
            <div className="grid gap-4">
              <LegalDocumentCard
                title="Terms of Service"
                description="Platform terms and conditions for all users"
                href="/legal/terms"
              />
              <LegalDocumentCard
                title="Privacy Policy"
                description="How we collect, use, and protect your personal information"
                href="/legal/privacy"
              />
              <LegalDocumentCard
                title="Cookie Policy"
                description="Information about cookies and tracking technologies we use"
                href="/legal/cookies"
              />
              <LegalDocumentCard
                title="Community Guidelines"
                description="Acceptable use policy and community standards"
                href="/legal/community-guidelines"
              />
              <LegalDocumentCard
                title="Copyright & DMCA Policy"
                description="Intellectual property rights and DMCA procedures"
                href="/legal/dmca"
              />
              <LegalDocumentCard
                title="Refund & Cancellation Policy"
                description="Refund eligibility and cancellation procedures"
                href="/legal/refunds"
              />
              <LegalDocumentCard
                title="Fee Disclosure"
                description="Transparent fee and pricing information"
                href="/legal/fees"
              />
              <LegalDocumentCard
                title="Accessibility Statement"
                description="Our commitment to accessibility and non-discrimination"
                href="/legal/accessibility"
              />
              <LegalDocumentCard
                title="User Agreement"
                description="Terms for ticket buyers and event attendees"
                href="/legal/user-agreement"
              />
            </div>
          </section>

          {/* Role-Based Documents */}
          <section>
            <h2 className="text-2xl font-semibold mb-2">Professional Agreements</h2>
            <p className="text-sm text-gray-400 mb-6">
              The following documents are available to registered Artists and Venues.
              <Link href="/login" className="text-resistance-500 hover:underline ml-1">
                Log in
              </Link> to access.
            </p>
            <div className="grid gap-4">
              <LegalDocumentCard
                title="Artist Agreement"
                description="Terms for artists performing on the platform"
                href="/legal/artist-agreement"
                protected="Artist"
              />
              <LegalDocumentCard
                title="Venue Agreement"
                description="Terms for venues hosting events"
                href="/legal/venue-agreement"
                protected="Venue"
              />
              <LegalDocumentCard
                title="Event Listing Agreement"
                description="Terms for listing events on the platform"
                href="/legal/event-listing-agreement"
                protected="Venue"
              />
              <LegalDocumentCard
                title="Payment Terms"
                description="Payment processing and settlement terms"
                href="/legal/payment-terms"
                protected="Artist/Venue"
              />
              <LegalDocumentCard
                title="Data Processing Addendum"
                description="GDPR-compliant data processing terms"
                href="/legal/data-processing"
                protected="Artist/Venue"
              />
              <LegalDocumentCard
                title="Independent Contractor Agreement"
                description="Contractor relationship terms"
                href="/legal/contractor-agreement"
                protected="Artist/Venue"
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

interface LegalDocumentCardProps {
  title: string;
  description: string;
  href: string;
  protected?: string;
}

function LegalDocumentCard({ title, description, href, protected: protectedRole }: LegalDocumentCardProps) {
  return (
    <Link
      href={href}
      className="block p-6 bg-[var(--bg-secondary)] border border-white/10 rounded-lg hover:border-resistance-500/50 transition-all group"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2 group-hover:text-resistance-400 transition-colors">
            {title}
          </h3>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
        {protectedRole && (
          <span className="ml-4 px-3 py-1 bg-resistance-500/20 text-resistance-400 text-xs font-medium rounded-full border border-resistance-500/30">
            {protectedRole}
          </span>
        )}
      </div>
    </Link>
  );
}
