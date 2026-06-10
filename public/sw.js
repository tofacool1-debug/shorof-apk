// Service Worker minimal biar lolos PWA
self.addEventListener('install', (e) => {
  self.skipWaiting()
})

self.addEventListener('activate', (e) => {
  self.clients.claim()
})

self.addEventListener('fetch', (e) => {
  // biarin aja, gak usah cache dulu
})
