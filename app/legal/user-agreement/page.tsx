import { UserAgreementContent } from '@/components/legal/UserAgreementContent';
import { LegalPageLayout } from '@/components/legal/LegalPageLayout';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'User Agreement | Unchained',
  description: 'Terms for ticket buyers and event attendees on the Unchained platform',
};

export default function UserAgreementPage() {
  return (
    <LegalPageLayout title="User Agreement">
      <UserAgreementContent />
    </LegalPageLayout>
  );
}
