const CACHE_NAME = 'bored-teacher-runtime-v2';

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

  const url = new URL(request.url);
  const isNextStatic = url.pathname.startsWith('/_next/static/');
  const isPublicAsset = url.pathname.startsWith('/assets/');
  if (!isNextStatic && !isPublicAsset) return;

  let preferredRequest = request;
  if (request.destination === 'image' && url.pathname.startsWith('/assets/') && !url.pathname.includes('/.optimized/')) {
    const optimizedUrl = new URL(url);
    const originalPath = optimizedUrl.pathname.replace(/^\/assets\//, '');
    optimizedUrl.pathname = `/assets/.optimized/${originalPath}`;
    optimizedUrl.search = '';

    const optimizedRequest = new Request(optimizedUrl, {
      method: 'GET',
      headers: request.headers,
      redirect: 'follow',
    });

    preferredRequest = optimizedRequest;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(async cache => {
      const cached = await cache.match(preferredRequest);
      const refresh = fetch(preferredRequest).then(response => {
        if (response.ok) cache.put(preferredRequest, response.clone());
        return response;
      }).catch(() => cached);

      if (cached) return cached;

      if (request.destination === 'image' && url.pathname.startsWith('/assets/') && !url.pathname.includes('/.optimized/')) {
        const fallback = await fetch(request).then(res => {
          if (res.ok) cache.put(request, res.clone());
          return res;
        }).catch(() => cached);
        return fallback;
      }

      return refresh;
    })
  );
});