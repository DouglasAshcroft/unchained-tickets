'use client';

import { PaymentTermsContent } from '@/components/legal/PaymentTermsContent';
import { ProtectedLegalPage } from '@/components/legal/ProtectedLegalPage';

export default function PaymentTermsPage() {
  return (
    <ProtectedLegalPage
      title="Payment Terms"
      allowedRoles={['artist', 'venue', 'admin']}
      accessMessage="This document is only available to registered Artists and Venues. If you need access to payment terms, please contact support."
    >
      <PaymentTermsContent />
    </ProtectedLegalPage>
  );
}
