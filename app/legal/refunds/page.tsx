import { RefundsContent } from '@/components/legal/RefundsContent';
import { LegalPageLayout } from '@/components/legal/LegalPageLayout';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy | Unchained',
  description: 'Refund eligibility and cancellation procedures for the Unchained platform',
};

export default function RefundsPage() {
  return (
    <LegalPageLayout title="Refund & Cancellation Policy">
      <RefundsContent />
    </LegalPageLayout>
  );
}
