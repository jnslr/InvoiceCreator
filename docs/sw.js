var cacheName = 'InvoiceCreator';
var version = '0.1'; //App is only updated when SW changes --> Increase this number to initiate update
var filesToCache = [
  '/InvoiceCreator/',
  '/InvoiceCreator/index.html',
  '/InvoiceCreator/css/style.css',
  '/InvoiceCreator/css/bootstrap.min.css',
  '/InvoiceCreator/css/invoice.css',
  '/InvoiceCreator/css/open-iconic-bootstrap.min.css',
  '/InvoiceCreator/fonts/open-iconic.woff',
  '/InvoiceCreator/js/libs/bootstrap.min.js',
  '/InvoiceCreator/js/libs/joi-browser.min.js',
  '/InvoiceCreator/js/libs/jquery-3.5.1.slim.min.js',
  '/InvoiceCreator/js/libs/lodash.min.js',
  '/InvoiceCreator/js/libs/popper.min.js',
  '/InvoiceCreator/js/libs/sweetalert.js',
  '/InvoiceCreator/js/libs/vue-dev.js',
  '/InvoiceCreator/js/libs/vue-router.min.js',
  '/InvoiceCreator/js/main.js',
  '/InvoiceCreator/components/fileViewer.js',
  '/InvoiceCreator/components/header.js',
  '/InvoiceCreator/components/invoiceCreator.js'
];

/* Start the service worker and cache all of the app's content */
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      return cache.addAll(filesToCache);
    })
  );
});


/* Serve cached content when offline */
self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request)
    .then(function(response) {
      return response || fetch(e.request);
    })
  );
});

self.addEventListener('message', event => {  
  if (event.data.type=='getVersion'){
    event.source.postMessage({
      type: 'version',
      message: version
    });
  }
});

