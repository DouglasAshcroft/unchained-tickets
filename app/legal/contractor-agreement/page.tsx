'use client';

import { ContractorContent } from '@/components/legal/ContractorContent';
import { ProtectedLegalPage } from '@/components/legal/ProtectedLegalPage';

export default function ContractorAgreementPage() {
  return (
    <ProtectedLegalPage
      title="Independent Contractor Agreement"
      allowedRoles={['artist', 'venue', 'admin']}
      accessMessage="This document is only available to registered Artists and Venues. The Independent Contractor Agreement establishes the non-employment relationship with Unchained."
    >
      <ContractorContent />
    </ProtectedLegalPage>
  );
}
