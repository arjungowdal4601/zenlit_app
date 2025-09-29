import { Suspense } from 'react';
import VerifyOtpClient, { VerifyOtpFallback } from './VerifyOtpClient';

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<VerifyOtpFallback />}>
      <VerifyOtpClient />
    </Suspense>
  );
}
