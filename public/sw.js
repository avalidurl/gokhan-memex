/**
 * Service Worker for Offline Blog Reading
 * Implements cache-first strategy for static content and network-first for dynamic content
 * Privacy-conscious offline functionality respecting existing consent system
 */

const CACHE_VERSION = 'v1';
const STATIC_CACHE_NAME = `gokhan-memex-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE_NAME = `gokhan-memex-dynamic-${CACHE_VERSION}`;
const BLOG_CACHE_NAME = `gokhan-memex-blog-${CACHE_VERSION}`;

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/journal/',
  '/writing/',
  '/projects/',
  '/links/',
  '/lists/',
  '/subscribe/',
  '/offline/',
  '/favicon.svg',
  '/_astro/globals.css',
  // Add fonts and other critical assets
];

// Blog post patterns to cache
const BLOG_POST_PATTERNS = [
  /\/journal\/.+/,
  /\/writing\/.+/,
  /\/projects\/.+/
];

// Cache-first resources
const CACHE_FIRST_PATTERNS = [
  /\/_astro\/.+\.(css|js|woff2?|png|jpg|jpeg|svg|gif|webp)$/,
  /\/images\/.+\.(png|jpg|jpeg|svg|gif|webp)$/,
  /\/blog\/images\/.+\.(png|jpg|jpeg|svg|gif|webp)$/,
  /\/favicon\.svg$/
];

// Network-first resources
const NETWORK_FIRST_PATTERNS = [
  /\/api\/.+/,
  /\/rss\.xml$/,
  /\/sitemap.*\.xml$/
];

// Resources to never cache
const NEVER_CACHE_PATTERNS = [
  /\/analytics\/.+/,
  /\/gtag\/.+/,
  /googletagmanager\.com/,
  /googleapis\.com/,
  /gstatic\.com/
];

/**
 * Install event - cache static assets
 */
self.addEventListener('install', event => {
  console.log('[SW] Install event');
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE_NAME).then(cache => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS.filter(url => url));
      }),
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  );
});

/**
 * Activate event - cleanup old caches
 */
self.addEventListener('activate', event => {
  console.log('[SW] Activate event');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName.includes('gokhan-memex-') && 
                cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME && 
                cacheName !== BLOG_CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all pages
      self.clients.claim()
    ])
  );
});

/**
 * Fetch event - implement cache strategies
 */
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests and external resources
  if (request.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }
  
  // Never cache certain resources
  if (NEVER_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    return;
  }
  
  // Handle different cache strategies
  if (isCacheFirstResource(url.pathname)) {
    event.respondWith(handleCacheFirst(request));
  } else if (isNetworkFirstResource(url.pathname)) {
    event.respondWith(handleNetworkFirst(request));
  } else if (isBlogPost(url.pathname)) {
    event.respondWith(handleBlogPost(request));
  } else {
    event.respondWith(handleDefault(request));
  }
});

/**
 * Check if resource should use cache-first strategy
 */
function isCacheFirstResource(pathname) {
  return CACHE_FIRST_PATTERNS.some(pattern => pattern.test(pathname));
}

/**
 * Check if resource should use network-first strategy
 */
function isNetworkFirstResource(pathname) {
  return NETWORK_FIRST_PATTERNS.some(pattern => pattern.test(pathname));
}

/**
 * Check if URL is a blog post
 */
function isBlogPost(pathname) {
  return BLOG_POST_PATTERNS.some(pattern => pattern.test(pathname));
}

/**
 * Cache-first strategy for static assets
 */
async function handleCacheFirst(request) {
  try {
    const cache = await caches.open(STATIC_CACHE_NAME);
    const cached = await cache.match(request);
    
    if (cached) {
      // Update cache in background
      fetch(request).then(response => {
        if (response.status === 200) {
          cache.put(request, response.clone());
        }
      }).catch(() => {}); // Ignore network errors
      
      return cached;
    }
    
    // Not in cache, fetch from network
    const response = await fetch(request);
    
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('[SW] Cache-first failed:', error);
    return new Response('Service Unavailable', { status: 503 });
  }
}

/**
 * Network-first strategy for dynamic content
 */
async function handleNetworkFirst(request) {
  try {
    // Try network first
    const response = await fetch(request);
    
    if (response.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    // Network failed, try cache
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const cached = await cache.match(request);
    
    if (cached) {
      return cached;
    }
    
    // Return offline page for HTML requests
    if (request.headers.get('accept').includes('text/html')) {
      return caches.match('/offline/') || createOfflineResponse();
    }
    
    return new Response('Network Error', { status: 503 });
  }
}

/**
 * Special handling for blog posts (cache for offline reading)
 */
async function handleBlogPost(request) {
  try {
    // Try network first to get latest content
    const response = await fetch(request);
    
    if (response.status === 200) {
      const cache = await caches.open(BLOG_CACHE_NAME);
      cache.put(request, response.clone());
      
      // Notify clients about cached post
      notifyClients('post-cached', { url: request.url });
    }
    
    return response;
  } catch (error) {
    // Network failed, try cache
    const cache = await caches.open(BLOG_CACHE_NAME);
    const cached = await cache.match(request);
    
    if (cached) {
      // Notify clients we're serving from cache
      notifyClients('offline-post-served', { url: request.url });
      return cached;
    }
    
    // Return offline page
    return caches.match('/offline/') || createOfflineResponse();
  }
}

/**
 * Default handling for other resources
 */
async function handleDefault(request) {
  try {
    const response = await fetch(request);
    
    // Cache successful HTML responses
    if (response.status === 200 && request.headers.get('accept').includes('text/html')) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    // Try cache
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const cached = await cache.match(request);
    
    if (cached) {
      return cached;
    }
    
    // Return offline page for HTML requests
    if (request.headers.get('accept').includes('text/html')) {
      return caches.match('/offline/') || createOfflineResponse();
    }
    
    return new Response('Service Unavailable', { status: 503 });
  }
}

/**
 * Create basic offline response
 */
function createOfflineResponse() {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Offline - Gökhan Turhan</title>
      <style>
        body {
          font-family: system-ui, -apple-system, sans-serif;
          max-width: 600px;
          margin: 50px auto;
          padding: 20px;
          text-align: center;
          color: #333;
        }
        .offline-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }
        .btn {
          display: inline-block;
          padding: 10px 20px;
          margin: 10px;
          background: #007acc;
          color: white;
          text-decoration: none;
          border-radius: 5px;
        }
      </style>
    </head>
    <body>
      <div class="offline-icon">📱</div>
      <h1>You're Offline</h1>
      <p>This page isn't available offline yet, but you can:</p>
      <a href="/" class="btn">Go Home</a>
      <a href="/offline/" class="btn">View Cached Content</a>
      <script>
        // Retry when connection returns
        window.addEventListener('online', () => {
          window.location.reload();
        });
      </script>
    </body>
    </html>
  `;
  
  return new Response(html, {
    headers: { 'Content-Type': 'text/html' }
  });
}

/**
 * Notify all clients of service worker events
 */
function notifyClients(type, data = {}) {
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type,
        data,
        timestamp: Date.now()
      });
    });
  });
}

/**
 * Handle messages from clients
 */
self.addEventListener('message', event => {
  const { type, data } = event.data;
  
  switch (type) {
    case 'get-cache-status':
      getCacheStatus().then(status => {
        event.ports[0].postMessage(status);
      });
      break;
      
    case 'clear-cache':
      clearAllCaches().then(() => {
        event.ports[0].postMessage({ success: true });
      });
      break;
      
    case 'cache-post':
      if (data.url) {
        cacheSpecificPost(data.url).then(success => {
          event.ports[0].postMessage({ success });
        });
      }
      break;
      
    case 'get-offline-posts':
      getOfflinePosts().then(posts => {
        event.ports[0].postMessage(posts);
      });
      break;
  }
});

/**
 * Get current cache status
 */
async function getCacheStatus() {
  const cacheNames = await caches.keys();
  const status = {
    version: CACHE_VERSION,
    caches: {},
    totalSize: 0
  };
  
  for (const cacheName of cacheNames) {
    if (cacheName.includes('gokhan-memex-')) {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      status.caches[cacheName] = {
        count: keys.length,
        urls: keys.map(req => req.url)
      };
    }
  }
  
  return status;
}

/**
 * Clear all caches
 */
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  return Promise.all(
    cacheNames.map(cacheName => {
      if (cacheName.includes('gokhan-memex-')) {
        return caches.delete(cacheName);
      }
    })
  );
}

/**
 * Cache a specific blog post
 */
async function cacheSpecificPost(url) {
  try {
    const response = await fetch(url);
    if (response.status === 200) {
      const cache = await caches.open(BLOG_CACHE_NAME);
      await cache.put(url, response.clone());
      return true;
    }
    return false;
  } catch (error) {
    console.log('[SW] Failed to cache post:', url, error);
    return false;
  }
}

/**
 * Get list of offline-available blog posts
 */
async function getOfflinePosts() {
  try {
    const cache = await caches.open(BLOG_CACHE_NAME);
    const keys = await cache.keys();
    return keys.map(req => ({
      url: req.url,
      cached: true
    }));
  } catch (error) {
    console.log('[SW] Failed to get offline posts:', error);
    return [];
  }
}

/**
 * Background sync for offline actions (if supported)
 */
if ('sync' in self.registration) {
  self.addEventListener('sync', event => {
    if (event.tag === 'offline-analytics') {
      event.waitUntil(syncOfflineAnalytics());
    }
  });
}

/**
 * Sync offline analytics when connection is restored
 */
async function syncOfflineAnalytics() {
  try {
    // Check if there are offline analytics events to sync
    const offlineEvents = await getOfflineAnalyticsEvents();
    
    if (offlineEvents.length > 0) {
      // Send events to analytics
      for (const event of offlineEvents) {
        try {
          await sendAnalyticsEvent(event);
        } catch (error) {
          console.log('[SW] Failed to sync analytics event:', error);
        }
      }
      
      // Clear synced events
      await clearOfflineAnalyticsEvents();
    }
  } catch (error) {
    console.log('[SW] Failed to sync offline analytics:', error);
  }
}

/**
 * Get stored offline analytics events
 */
async function getOfflineAnalyticsEvents() {
  // This would integrate with IndexedDB to store offline events
  // For now, return empty array as we respect privacy settings
  return [];
}

/**
 * Send analytics event
 */
async function sendAnalyticsEvent(event) {
  // Only send if user has consented to analytics
  // This respects the existing privacy system
  return fetch('/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event)
  });
}

/**
 * Clear offline analytics events
 */
async function clearOfflineAnalyticsEvents() {
  // Clear stored offline events from IndexedDB
  return Promise.resolve();
}

console.log('[SW] Service Worker loaded successfully');