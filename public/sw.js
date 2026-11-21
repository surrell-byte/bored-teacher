const CACHE_NAME = 'bored-teacher-runtime-v6';

self.addEventListener('install', event => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key.startsWith('bored-teacher-runtime-') && key !== CACHE_NAME).map(key => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

  const url = new URL(request.url);
  const isPublicAsset = url.pathname.startsWith('/assets/');
  const isPwaIcon = /^\/icons\/app-icon-\d+\.png$/i.test(url.pathname);
  const isLegacyPng = request.destination === 'image'
    && /\.png$/i.test(url.pathname)
    && !isPwaIcon;
  if (!isPublicAsset && !isLegacyPng) return;

  let preferredRequest = request;
  let fallbackRequest = request;
  if (isLegacyPng && !isPublicAsset) {
    const webpUrl = new URL(url);
    webpUrl.pathname = webpUrl.pathname.replace(/\.png$/i, '.webp');
    webpUrl.search = '';
    preferredRequest = new Request(webpUrl, {
      method: 'GET',
      headers: request.headers,
      redirect: 'follow',
    });
  }

  if (
    request.destination === 'image'
    && /\.(?:png|jpe?g)$/i.test(url.pathname)
    && url.pathname.startsWith('/assets/')
    && !url.pathname.includes('/.optimized/')
  ) {
    const optimizedUrl = new URL(url);
    const originalPath = optimizedUrl.pathname
      .replace(/^\/assets\//, '')
      .replace(/\.(?:png|jpe?g)$/i, '.webp');
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

      if (isLegacyPng && isPublicAsset && fallbackRequest !== preferredRequest) {
        const fallback = await fetch(fallbackRequest).then(res => {
          if (res.ok) cache.put(fallbackRequest, res.clone());
          return res;
        }).catch(() => cached);
        return fallback;
      }

      return refresh;
    })
  );
});