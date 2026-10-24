'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    if (process.env.NODE_ENV !== 'production') {
      void (async () => {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(registration => registration.unregister()));
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames
            .filter(name => name.startsWith('bored-teacher-runtime-'))
            .map(name => caches.delete(name)),
        );
      })().catch(error => {
        console.error('Unable to clear the app service-worker cache in development.', error);
      });
      return;
    }

    navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' }).catch(error => {
      console.error('Unable to register the app service worker.', error);
    });
  }, []);

  return null;
}