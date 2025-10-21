import { FeesContent } from '@/components/legal/FeesContent';
import { LegalPageLayout } from '@/components/legal/LegalPageLayout';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Fee Disclosure | Unchained',
  description: 'Transparent fee and pricing information for the Unchained platform',
};

export default function FeesPage() {
  return (
    <LegalPageLayout title="Fee Disclosure">
      <FeesContent />
    </LegalPageLayout>
  );
}
