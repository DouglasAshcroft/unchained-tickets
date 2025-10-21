import Link from 'next/link';
import { FooterBaseBadge } from '@/components/branding/BuiltOnBaseBadge';
import { FOOTER_MESSAGES } from '@/lib/content/baseMessaging';

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[var(--bg-primary)] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Organized grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">

          {/* Platform */}
          <div>
            <h3 className="font-semibold mb-4 text-white">Platform</h3>
            <nav className="flex flex-col gap-2 text-sm">
              <Link href="/events" className="text-gray-400 hover:text-resistance-400 transition-colors">
                {FOOTER_MESSAGES.links.events}
              </Link>
              <Link href="/about" className="text-gray-400 hover:text-resistance-400 transition-colors">
                {FOOTER_MESSAGES.links.about}
              </Link>
            </nav>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4 text-white">Legal</h3>
            <nav className="flex flex-col gap-2 text-sm">
              <Link href="/legal/terms" className="text-gray-400 hover:text-resistance-400 transition-colors">
                Terms of Service
              </Link>
              <Link href="/legal/privacy" className="text-gray-400 hover:text-resistance-400 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/legal/cookies" className="text-gray-400 hover:text-resistance-400 transition-colors">
                Cookie Policy
              </Link>
              <Link href="/legal/refunds" className="text-gray-400 hover:text-resistance-400 transition-colors">
                Refund Policy
              </Link>
            </nav>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4 text-white">Support</h3>
            <nav className="flex flex-col gap-2 text-sm">
              <Link href="/legal/community-guidelines" className="text-gray-400 hover:text-resistance-400 transition-colors">
                Community Guidelines
              </Link>
              <Link href="/legal/accessibility" className="text-gray-400 hover:text-resistance-400 transition-colors">
                Accessibility
              </Link>
              <Link href="/legal/dmca" className="text-gray-400 hover:text-resistance-400 transition-colors">
                Copyright & DMCA
              </Link>
            </nav>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-4 text-white">Resources</h3>
            <nav className="flex flex-col gap-2 text-sm">
              <Link href="/legal/fees" className="text-gray-400 hover:text-resistance-400 transition-colors">
                Fee Disclosure
              </Link>
              <Link href="/legal" className="text-gray-400 hover:text-resistance-400 transition-colors">
                All Legal Documents
              </Link>
            </nav>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-500">
              {FOOTER_MESSAGES.copyright(new Date().getFullYear())}
            </div>
            <FooterBaseBadge />
          </div>
        </div>
      </div>
    </footer>
  );
}
