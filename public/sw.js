// Service Worker for Family Calendar + Hockey Management App
// Provides offline functionality and push notifications

const CACHE_NAME = 'family-calendar-v1';
const STATIC_CACHE_NAME = 'family-calendar-static-v1';
const DYNAMIC_CACHE_NAME = 'family-calendar-dynamic-v1';

// Cache static assets
const STATIC_ASSETS = [
  '/',
  '/hockey-stats',
  '/hockey-expenses',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/apple-touch-icon.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE_NAME && 
              cacheName !== DYNAMIC_CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() => {
        // Return offline response for API calls
        return new Response(
          JSON.stringify({ 
            error: 'Offline', 
            message: 'This feature requires internet connection' 
          }),
          {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      })
    );
    return;
  }

  // Handle page requests
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone response to cache it
          const responseClone = response.clone();
          
          caches.open(DYNAMIC_CACHE_NAME)
            .then((cache) => {
              cache.put(request, responseClone);
            });
          
          return response;
        })
        .catch(() => {
          // Serve from cache if offline
          return caches.match(request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              
              // Fallback to offline page
              return caches.match('/');
            });
        })
    );
    return;
  }

  // Handle other requests (CSS, JS, images)
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone response to cache it
            const responseClone = response.clone();

            caches.open(DYNAMIC_CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseClone);
              });

            return response;
          });
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'calendar-sync') {
    event.waitUntil(syncCalendarData());
  }
  
  if (event.tag === 'hockey-sync') {
    event.waitUntil(syncHockeyData());
  }
});

// Push notifications for reminders
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  const data = event.data ? event.data.json() : {};
  
  const options = {
    body: data.body || 'You have a family calendar notification',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    tag: data.tag || 'family-calendar',
    requireInteraction: data.requireInteraction || false,
    actions: [
      {
        action: 'view',
        title: 'View Details',
        icon: '/icon-192x192.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ],
    data: {
      url: data.url || '/',
      timestamp: Date.now()
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(
      data.title || 'Family Calendar',
      options
    )
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  if (event.action === 'dismiss') {
    return;
  }
  
  const url = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        // Check if app is already open
        for (const client of clients) {
          if (client.url.includes(self.location.origin)) {
            client.focus();
            client.navigate(url);
            return;
          }
        }
        
        // Open new window if app not open
        return self.clients.openWindow(url);
      })
  );
});

// Sync calendar data when back online
async function syncCalendarData() {
  try {
    // Get pending calendar changes from IndexedDB/localStorage
    const pendingChanges = getStoredData('pending-calendar-changes');
    
    if (pendingChanges && pendingChanges.length > 0) {
      // Sync each change
      for (const change of pendingChanges) {
        await syncSingleChange(change);
      }
      
      // Clear pending changes
      clearStoredData('pending-calendar-changes');
      console.log('Calendar data synced successfully');
    }
  } catch (error) {
    console.error('Failed to sync calendar data:', error);
  }
}

// Sync hockey data when back online  
async function syncHockeyData() {
  try {
    const pendingHockeyChanges = getStoredData('pending-hockey-changes');
    
    if (pendingHockeyChanges && pendingHockeyChanges.length > 0) {
      for (const change of pendingHockeyChanges) {
        await syncSingleChange(change);
      }
      
      clearStoredData('pending-hockey-changes');
      console.log('Hockey data synced successfully');
    }
  } catch (error) {
    console.error('Failed to sync hockey data:', error);
  }
}

// Helper functions for data storage
function getStoredData(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting stored data:', error);
    return null;
  }
}

function clearStoredData(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error clearing stored data:', error);
  }
}

async function syncSingleChange(change) {
  try {
    const response = await fetch(change.url, {
      method: change.method,
      headers: change.headers,
      body: change.body
    });
    
    if (!response.ok) {
      throw new Error(`Sync failed: ${response.status}`);
    }
    
    console.log('Synced change:', change.id);
  } catch (error) {
    console.error('Failed to sync change:', change.id, error);
    throw error;
  }
}

// Periodic background tasks
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'daily-sync') {
    event.waitUntil(performDailySync());
  }
});

async function performDailySync() {
  try {
    // Perform daily maintenance tasks
    await cleanupOldCache();
    await syncCalendarData();
    await syncHockeyData();
    
    console.log('Daily sync completed');
  } catch (error) {
    console.error('Daily sync failed:', error);
  }
}

async function cleanupOldCache() {
  const cacheNames = await caches.keys();
  const oldCaches = cacheNames.filter(name => 
    name !== STATIC_CACHE_NAME && name !== DYNAMIC_CACHE_NAME
  );
  
  await Promise.all(oldCaches.map(name => caches.delete(name)));
  console.log('Old caches cleaned up');
}

console.log('Service Worker loaded successfully');