import { Suspense } from 'react';
import VerifyOtpSigninClient, { VerifyOtpSigninFallback } from './VerifyOtpSigninClient';

export default function VerifyOtpSigninPage() {
  return (
    <Suspense fallback={<VerifyOtpSigninFallback />}>
      <VerifyOtpSigninClient />
    </Suspense>
  );
}
