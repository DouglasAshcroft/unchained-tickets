'use client';

import { VenueAgreementContent } from '@/components/legal/VenueAgreementContent';
import { ProtectedLegalPage } from '@/components/legal/ProtectedLegalPage';

export default function VenueAgreementPage() {
  return (
    <ProtectedLegalPage
      title="Venue Agreement"
      allowedRoles={['venue', 'admin']}
      accessMessage="This document is only available to registered Venues. If you are a venue operator and need access to this agreement, please contact support."
    >
      <VenueAgreementContent />
    </ProtectedLegalPage>
  );
}
