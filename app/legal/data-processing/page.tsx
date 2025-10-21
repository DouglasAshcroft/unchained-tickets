'use client';

import { DPAContent } from '@/components/legal/DPAContent';
import { ProtectedLegalPage } from '@/components/legal/ProtectedLegalPage';

export default function DataProcessingPage() {
  return (
    <ProtectedLegalPage
      title="Data Processing Addendum"
      allowedRoles={['artist', 'venue', 'admin']}
      accessMessage="This document is only available to registered Artists and Venues. The Data Processing Addendum is part of GDPR compliance for event organizers."
    >
      <DPAContent />
    </ProtectedLegalPage>
  );
}
