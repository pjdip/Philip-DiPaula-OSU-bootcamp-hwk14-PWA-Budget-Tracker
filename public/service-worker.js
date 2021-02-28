console.log("hello from your service worker ;)");

// Defining caches and files
const PRECACHE = "precache-v1";
const RUNTIME = "runtime";
const TRANSACTIONS = "transactions";

const FILES_TO_CACHE = [
    '/',
    'index.html',
    'index.js',
    'styles.css',
    'manifest.webmanifest',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png'
];

// Install Event Handler
self.addEventListener('install', event => {
    event.waitUntil(
        caches

            // Static, Precache Files
            .open(PRECACHE)
            .then(cache => {
                cache.addAll(FILES_TO_CACHE);
                console.log("pre-cache successful!");
            })
            .catch(err => console.error("pre-cache failed: ", err))

            // Transaction Data
            .open(TRANSACTIONS)
            .then(cache => {
                cache.add("/api/transaction");
                console.log("transactions cache successful!");
            })
            .catch(err => console.error("transaction cache failed: ", err))

            // tells the browser to activate the service-worker
            // immediately after installation
            .then(self.skipWaiting())
    );
});

// Activate Event Handler
self.addEventListener('activate', event => {
    const currentCaches = [PRECACHE, TRANSACTIONS, RUNTIME];
    event.waitUntil(
        caches
            .keys()

            // compare current cache list to list of caches
            // remove any old caches as needed
            .then(keyList => {
                return Promise.all(
                    keyList.map(key => {
                        if (currentCaches.indexOf(key) === -1) {
                            console.log("removing old cache data ", key);
                            return caches.delete(key);
                        }
                    })
                );
            })

/*             .then(cacheNames => {
                return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
            })
            .then(cachesToDelete => {
                return Promise.all(
                    cachesToDelete.map(cacheToDelete => {
                        console.log("removing old cache data ", cacheToDelete);
                        return caches.delete(cacheToDelete);
                    })
                );
            }) */

            .then(() => self.clients.claim())
    );
});