'use client';

import { EventListingContent } from '@/components/legal/EventListingContent';
import { ProtectedLegalPage } from '@/components/legal/ProtectedLegalPage';

export default function EventListingAgreementPage() {
  return (
    <ProtectedLegalPage
      title="Event Listing Agreement"
      allowedRoles={['artist', 'venue', 'admin']}
      accessMessage="This document is only available to registered Artists and Venues. If you are an event organizer and need access to this agreement, please contact support."
    >
      <EventListingContent />
    </ProtectedLegalPage>
  );
}
