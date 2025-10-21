import { CookieContent } from '@/components/legal/CookieContent';
import { LegalPageLayout } from '@/components/legal/LegalPageLayout';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy | Unchained',
  description: 'Information about cookies and tracking technologies used on the Unchained platform',
};

export default function CookiePage() {
  return (
    <LegalPageLayout title="Cookie Policy">
      <CookieContent />
    </LegalPageLayout>
  );
}
