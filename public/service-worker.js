console.log("hello from your service worker ;)");

// Defining caches and files
const PRECACHE = "precache-v1";
const RUNTIME = "runtime";
const TRANSACTIONS = "transactions";

const FILES_TO_CACHE = [
    '/',
    'index.html',
    'index.js',
    'indexedDB.js',
    'styles.css',
    'manifest.webmanifest',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png'
];

// Install Event Handler
self.addEventListener('install', event => {

    // Static, Precache Files
    event.waitUntil(
        caches
            .open(PRECACHE)
            .then(cache => {
                console.log("pre-cache successful!");
                return cache.addAll(FILES_TO_CACHE);
            })
            .catch(err => console.error("pre-cache failed: ", err))
    );
    
    // Transaction Pre-cache Data
/*     event.waitUntil(
        caches
            .open(TRANSACTIONS)
            .then(cache => {
                cache.add("/api/transaction");
                console.log("transaction pre-cache successful!");
            })
            .catch(err => console.error("transaction cache failed: ", err))
    ); */

    // tells the browser to activate the service-worker
    // immediately after installation
    self.skipWaiting();
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

// Fetch Event Handler
self.addEventListener('fetch', event => {

    // browser defaults for non-GET requests
    if (event.request.method != 'GET') return;

    // transaction fetches
    if (event.request.url.includes("/api/")) {
        event.respondWith(
            caches
                .open(TRANSACTIONS)
                .then(cache => {
                    return fetch(event.request)
                        .then(response => {

                            // if network connectivity exists
                            // clone and store response in the cache
                            if (response.status === 200) {
                                cache.put(event.request.url, response.clone())
                            }
                            return response;
                        })
                        .catch(err => {
                            // if network request failed, check the cache
                            return cache
                                .match(event.request)
/*                                 .then(cachedResponse => {
                                    if (cachedResponse) {
                                        return cachedResponse;
                                    }
                                }) */
                        });
                })
                .catch(err => console.error(err))
        );
        return;
    }

/*     else if (event.request.url.startsWith(self.location.origin)) {
        event.respondWith(
            caches
                .match(event.requestion)
                .then(cachedResponse => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    return caches.open(RUNTIME).then(cache => {
                        return fetch(event.request).then(response => {
                            return cache.put(event.request, response.clone()).then(() => {
                                return response;
                            });
                        });
                    });
                })
        );
        return;
    } */

    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});