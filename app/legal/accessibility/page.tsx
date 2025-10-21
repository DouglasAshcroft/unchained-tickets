import { AccessibilityContent } from '@/components/legal/AccessibilityContent';
import { LegalPageLayout } from '@/components/legal/LegalPageLayout';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Accessibility Statement | Unchained',
  description: 'Our commitment to accessibility and non-discrimination on the Unchained platform',
};

export default function AccessibilityPage() {
  return (
    <LegalPageLayout title="Accessibility Statement">
      <AccessibilityContent />
    </LegalPageLayout>
  );
}
