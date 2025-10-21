import { TOSContent } from '@/components/legal/TOSContent';
import { LegalPageLayout } from '@/components/legal/LegalPageLayout';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | Unchained',
  description: 'Platform Terms of Service for Unchained ticketing platform',
};

export default function TermsPage() {
  return (
    <LegalPageLayout title="Terms of Service">
      <TOSContent />
    </LegalPageLayout>
  );
}
