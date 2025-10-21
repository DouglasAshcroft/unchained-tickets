import { DMCAContent } from '@/components/legal/DMCAContent';
import { LegalPageLayout } from '@/components/legal/LegalPageLayout';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Copyright & DMCA Policy | Unchained',
  description: 'Intellectual property rights and DMCA procedures for the Unchained platform',
};

export default function DMCAPage() {
  return (
    <LegalPageLayout title="Copyright & DMCA Policy">
      <DMCAContent />
    </LegalPageLayout>
  );
}
