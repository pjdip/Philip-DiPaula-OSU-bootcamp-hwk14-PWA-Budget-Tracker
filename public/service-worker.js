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
            .then(self.skipWaiting())
    );
});

