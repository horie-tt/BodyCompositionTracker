// Service Worker for Body Composition Tracker
const CACHE_NAME = 'body-composition-tracker-v1'
const STATIC_CACHE_NAME = 'static-v1'
const DYNAMIC_CACHE_NAME = 'dynamic-v1'

const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  '/apple-touch-icon.png',
  '/favicon-16x16.png',
  '/favicon-32x32.png',
]

const API_ENDPOINTS = [
  '/api/health',
  '/api/app-info',
  '/api/body-data',
  '/api/stats',
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log('Static assets cached successfully')
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error('Failed to cache static assets:', error)
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...')
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('Service Worker activated')
        return self.clients.claim()
      })
  )
})

// Fetch event - handle network requests
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }
  
  // Skip chrome-extension and other non-http(s) protocols
  if (!url.protocol.startsWith('http')) {
    return
  }
  
  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request))
    return
  }
  
  // Handle static assets
  if (STATIC_ASSETS.includes(url.pathname)) {
    event.respondWith(handleStaticAsset(request))
    return
  }
  
  // Handle other requests (pages, images, etc.)
  event.respondWith(handleDynamicRequest(request))
})

// Handle API requests with network-first strategy
async function handleApiRequest(request) {
  const url = new URL(request.url)
  
  try {
    // Try network first
    const networkResponse = await fetch(request)
    
    // Cache successful responses for offline use
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME)
      await cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('Network failed for API request, trying cache:', url.pathname)
    
    // Fallback to cache
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Return offline response for critical endpoints
    if (url.pathname === '/api/health') {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Offline - Service Worker active',
          data: {
            status: 'offline',
            timestamp: new Date().toISOString()
          }
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
    
    // Return error response for other API endpoints
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Network unavailable and no cached data'
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

// Handle static assets with cache-first strategy
async function handleStaticAsset(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Fallback to network
    const networkResponse = await fetch(request)
    
    // Cache the response
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME)
      await cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.error('Failed to fetch static asset:', request.url, error)
    
    // Return a basic offline page for navigation requests
    if (request.mode === 'navigate') {
      return new Response(
        `<!DOCTYPE html>
        <html>
        <head>
          <title>オフライン - 体組成記録アプリ</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: sans-serif; text-align: center; padding: 50px; }
            .offline { color: #666; }
          </style>
        </head>
        <body>
          <h1>オフライン</h1>
          <p class="offline">インターネット接続を確認してください。</p>
          <button onclick="location.reload()">再読み込み</button>
        </body>
        </html>`,
        {
          status: 200,
          headers: { 'Content-Type': 'text/html' }
        }
      )
    }
    
    throw error
  }
}

// Handle dynamic requests with stale-while-revalidate strategy
async function handleDynamicRequest(request) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE_NAME)
    const cachedResponse = await cache.match(request)
    
    // Fetch from network in background
    const networkPromise = fetch(request)
      .then((response) => {
        if (response.ok) {
          cache.put(request, response.clone())
        }
        return response
      })
      .catch(() => null)
    
    // Return cached response if available, otherwise wait for network
    if (cachedResponse) {
      // Update cache in background
      networkPromise.catch(() => {}) // Ignore errors in background update
      return cachedResponse
    }
    
    return await networkPromise
  } catch (error) {
    console.error('Failed to handle dynamic request:', request.url, error)
    throw error
  }
}

// Handle background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('Background sync triggered')
    event.waitUntil(handleBackgroundSync())
  }
})

async function handleBackgroundSync() {
  try {
    // Sync cached data when connection is restored
    console.log('Performing background sync...')
    
    // Implement your background sync logic here
    // For example, sync pending data submissions
    
    console.log('Background sync completed')
  } catch (error) {
    console.error('Background sync failed:', error)
  }
}

// Handle push notifications (if implemented)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json()
    
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: '/android-chrome-192x192.png',
        badge: '/favicon-32x32.png',
        vibrate: [200, 100, 200],
        data: data.data || {},
        actions: data.actions || []
      })
    )
  }
})

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  )
})

// Handle message from main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME })
  }
})

// Periodic cleanup
setInterval(() => {
  cleanupOldCaches()
}, 24 * 60 * 60 * 1000) // Once per day

async function cleanupOldCaches() {
  try {
    const cacheNames = await caches.keys()
    const oldCaches = cacheNames.filter((name) => 
      name !== STATIC_CACHE_NAME && name !== DYNAMIC_CACHE_NAME
    )
    
    await Promise.all(oldCaches.map((name) => caches.delete(name)))
    console.log('Old caches cleaned up:', oldCaches)
  } catch (error) {
    console.error('Cache cleanup failed:', error)
  }
}

console.log('Service Worker loaded')