import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[var(--background)] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/events" className="hover:text-blue-400 transition-colors">
              Events
            </Link>
            <Link href="/artists" className="hover:text-blue-400 transition-colors">
              Artists
            </Link>
            <Link href="/venues" className="hover:text-blue-400 transition-colors">
              Venues
            </Link>
            <Link href="/about" className="hover:text-blue-400 transition-colors">
              About
            </Link>
          </nav>
          <div className="text-sm text-gray-500">
            © {new Date().getFullYear()} Unchained. Powered by Base.
          </div>
        </div>
      </div>
    </footer>
  );
}
