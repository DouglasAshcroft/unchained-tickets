'use client';

import { ReactNode } from 'react';
import Link from 'next/link';

interface LegalPageLayoutProps {
  title: string;
  lastUpdated?: string;
  children: ReactNode;
}

export function LegalPageLayout({ title, lastUpdated, children }: LegalPageLayoutProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Breadcrumb Navigation */}
      <nav className="border-b border-white/10 bg-[var(--bg-secondary)] print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-gray-400 hover:text-white transition-colors">
              Home
            </Link>
            <span className="text-gray-600">/</span>
            <Link href="/legal" className="text-gray-400 hover:text-white transition-colors">
              Legal
            </Link>
            <span className="text-gray-600">/</span>
            <span className="text-white">{title}</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">{title}</h1>
            {lastUpdated && (
              <p className="text-sm text-gray-400">
                Last Updated: {lastUpdated}
              </p>
            )}
            <button
              onClick={handlePrint}
              className="mt-4 px-4 py-2 bg-resistance-500 hover:bg-resistance-600 rounded-lg text-sm font-medium transition-colors print:hidden"
            >
              Print Document
            </button>
          </div>

          {/* Legal Content */}
          <div className="prose prose-invert prose-lg max-w-none">
            {children}
          </div>

          {/* Back to Legal Hub */}
          <div className="mt-12 pt-8 border-t border-white/10 print:hidden">
            <Link
              href="/legal"
              className="text-resistance-500 hover:text-resistance-400 transition-colors"
            >
              ← Back to All Legal Documents
            </Link>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white;
            color: black;
          }
          .prose-invert {
            color: black !important;
          }
          a {
            color: black !important;
            text-decoration: underline;
          }
        }
      `}</style>
    </div>
  );
}
