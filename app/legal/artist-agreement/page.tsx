'use client';

import { ArtistAgreementContent } from '@/components/legal/ArtistAgreementContent';
import { ProtectedLegalPage } from '@/components/legal/ProtectedLegalPage';

export default function ArtistAgreementPage() {
  return (
    <ProtectedLegalPage
      title="Artist Agreement"
      allowedRoles={['artist', 'admin']}
      accessMessage="This document is only available to registered Artists. If you are an artist and need access to this agreement, please contact support."
    >
      <ArtistAgreementContent />
    </ProtectedLegalPage>
  );
}
