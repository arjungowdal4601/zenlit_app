import { Suspense } from 'react';
import SetupPasswordClient, { SetupPasswordFallback } from './SetupPasswordClient';

export default function SetupPasswordPage() {
  return (
    <Suspense fallback={<SetupPasswordFallback />}>
      <SetupPasswordClient />
    </Suspense>
  );
}
