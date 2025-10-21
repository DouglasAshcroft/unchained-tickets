import Link from 'next/link';
import { FooterBaseBadge } from '@/components/branding/BuiltOnBaseBadge';
import { FOOTER_MESSAGES } from '@/lib/content/baseMessaging';

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[var(--background)] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/events" className="hover:text-blue-400 transition-colors">
              {FOOTER_MESSAGES.links.events}
            </Link>
            <Link href="/about" className="hover:text-blue-400 transition-colors">
              {FOOTER_MESSAGES.links.about}
            </Link>
          </nav>
          <div className="flex items-center gap-4">
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
