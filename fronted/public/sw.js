const CACHE_VERSION = 'v2'
const CACHE_NAME = `sanfoody-${CACHE_VERSION}`

const ASSETS_TO_CACHE = [
  '/',
  '/manifest.json',
  '/offline.html',
]

const FONT_ASSETS = [
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap',
]

// Install event - cache core assets.
// Uses Promise.allSettled + per-item catch instead of cache.addAll() so a
// single missing file (e.g. an icon that hasn't been generated yet) can't
// fail the whole install and leave an old worker stuck in control.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      const allAssets = [...ASSETS_TO_CACHE, ...FONT_ASSETS]
      await Promise.allSettled(
        allAssets.map((url) =>
          cache.add(url).catch((err) => console.warn('SW: failed to cache', url, err)),
        ),
      )
      return self.skipWaiting()
    }),
  )
})

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))),
      )
      .then(() => self.clients.claim()),
  )
})

function isStaticAsset(request) {
  return ['image', 'font', 'style'].includes(request.destination)
}

// Fetch event.
// - Navigations, JS, and other dynamic requests: network-first, falling
//   back to cache (and then offline.html) only when the network fails.
//   This guarantees a fresh deploy is served immediately instead of a
//   stale cached bundle.
// - Static assets (images/fonts/css): cache-first for speed, refreshed in
//   the background.
self.addEventListener('fetch', (event) => {
  const request = event.request

  if (!request.url.startsWith(self.location.origin) && !FONT_ASSETS.includes(request.url)) return
  if (request.method !== 'GET') return
  if (request.url.includes('analytics') || request.url.includes('tracking')) return

  if (isStaticAsset(request)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) {
          event.waitUntil(updateCache(request))
          return cached
        }
        return fetch(request)
          .then((response) => {
            cachePut(request, response.clone())
            return response
          })
          .catch(() => cached)
      }),
    )
    return
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        cachePut(request, response.clone())
        return response
      })
      .catch(async () => {
        const cached = await caches.match(request)
        if (cached) return cached
        if (request.headers.get('accept')?.includes('text/html')) {
          return caches.match('/offline.html')
        }
        return new Response('Offline', { status: 503, statusText: 'Service Unavailable' })
      }),
  )
})

function cachePut(request, response) {
  if (response && response.status === 200) {
    caches.open(CACHE_NAME).then((cache) => cache.put(request, response))
  }
}

async function updateCache(request) {
  try {
    const response = await fetch(request)
    if (response && response.status === 200) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, response.clone())
    }
  } catch {
    // Silent fail - keep using cached version
  }
}

// Background sync for offline orders
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-orders') {
    event.waitUntil(syncOrders())
  }
})

async function syncOrders() {
  const cache = await caches.open(CACHE_NAME)
  const requests = await cache.keys()
  const orderRequests = requests.filter((req) => req.url.includes('/api/orders') && req.method === 'POST')

  for (const req of orderRequests) {
    try {
      const response = await fetch(req)
      if (response.ok) {
        await cache.delete(req)
      }
    } catch {
      // Keep for retry
    }
  }
}

// Push notifications
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {
    title: 'SanFoody',
    body: 'New update from SanFoody!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icons/icon-192x192.png',
    badge: data.badge || '/icons/badge-72x72.png',
    data: data.url || '/',
    actions: data.actions || [
      { action: 'open', title: 'View' },
      { action: 'close', title: 'Dismiss' },
    ],
    vibrate: [200, 100, 200],
  }

  event.waitUntil(self.registration.showNotification(data.title, options))
})

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data || '/'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      const matchingClient = windowClients.find((client) => client.url === url)
      if (matchingClient) return matchingClient.focus()
      return clients.openWindow(url)
    }),
  )
})