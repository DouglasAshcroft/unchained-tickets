import { CommunityGuidelinesContent } from '@/components/legal/CommunityGuidelinesContent';
import { LegalPageLayout } from '@/components/legal/LegalPageLayout';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Community Guidelines | Unchained',
  description: 'Acceptable use policy and community standards for the Unchained platform',
};

export default function CommunityGuidelinesPage() {
  return (
    <LegalPageLayout title="Community Guidelines">
      <CommunityGuidelinesContent />
    </LegalPageLayout>
  );
}
