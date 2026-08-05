// LUNA Echo Service Worker v3 — 自动更新 + 离线缓存  
const VERSION = '5';
const CACHE_NAME = 'luna-echo-v' + VERSION;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(['/']);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    }).then(() => {
      // 通知所有打开的页面：新版本已就绪
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({ type: 'UPDATE_READY', version: VERSION });
        });
      });
      return self.clients.claim();
    })
  );
});

// 网络优先，失败回退缓存
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  // 跳过 chrome-extension 和 analytics
  const url = new URL(event.request.url);
  if (url.protocol === 'chrome-extension:' || url.pathname.includes('analytics')) return;
  
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

// 监听来自页面的跳过等待请求
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
