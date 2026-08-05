// LUNA Echo — Cache Killer SW
// This SW immediately unregisters itself to fix stuck cache
self.addEventListener('install', () => {
  self.skipWaiting();
});
self.addEventListener('activate', () => {
  // Delete all caches
  caches.keys().then(keys => keys.forEach(k => caches.delete(k)));
  // Unregister itself
  self.registration.unregister();
});
