'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { LegalPageLayout } from '@/components/legal/LegalPageLayout';
import Link from 'next/link';
import type { UserRole } from '@prisma/client';

interface ProtectedLegalPageProps {
  title: string;
  allowedRoles: UserRole[];
  children: ReactNode;
  accessMessage?: string;
  redirectPath?: string;
}

export function ProtectedLegalPage({
  title,
  allowedRoles,
  children,
  accessMessage,
  redirectPath,
}: ProtectedLegalPageProps) {
  const { user, isLoading } = useAuth();
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // Redirect to login
        const redirect = redirectPath || window.location.pathname;
        window.location.href = `/login?redirect=${redirect}`;
      } else if (!allowedRoles.includes(user.role)) {
        setHasAccess(false);
      } else {
        setHasAccess(true);
      }
    }
  }, [user, isLoading, allowedRoles, redirectPath]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-resistance-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    const roleDisplay = allowedRoles
      .filter(role => role !== 'admin')
      .map(role => role.charAt(0).toUpperCase() + role.slice(1))
      .join(' or ');

    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="max-w-2xl mx-auto p-8 text-center">
          <div className="mb-6">
            <svg className="mx-auto h-16 w-16 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-4">Access Restricted</h1>
          <p className="text-gray-400 mb-6">
            {accessMessage || (
              <>
                This document is only available to registered <strong>{roleDisplay}s</strong>.
                If you need access to this agreement, please contact support.
              </>
            )}
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/legal"
              className="px-6 py-3 bg-[var(--bg-secondary)] border border-white/10 rounded-lg hover:border-resistance-500/50 transition-all"
            >
              Back to Legal Documents
            </Link>
            <Link
              href="/contact"
              className="px-6 py-3 bg-resistance-500 hover:bg-resistance-600 rounded-lg transition-colors"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <LegalPageLayout title={title}>
      {children}
    </LegalPageLayout>
  );
}
