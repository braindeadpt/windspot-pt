'use client';

import ServiceWorkerRegistration from './ServiceWorkerRegistration';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ServiceWorkerRegistration />
      {children}
    </>
  );
}