var cacheName = 'invoice-creator';
var version = '1.4'; //App is only updated when SW changes --> Increase this number to initiate update
var filesToCache = [
  '/',
  'index.html',
  'css/style.css',
  'css/bootstrap.min.css',
  'css/invoice.css',
  'css/open-iconic-bootstrap.min.css',
  'fonts/open-iconic.woff',
  'js/libs/bootstrap.min.js',
  'js/libs/joi-browser.min.js',
  'js/libs/jquery-3.5.1.slim.min.js',
  'js/libs/lodash.min.js',
  'js/libs/popper.min.js',
  'js/libs/sweetalert.js',
  'js/libs/vue-dev.js',
  'js/libs/vue-router.min.js',
  'js/main.js',
  'components/fileViewer.js',
  'components/header.js',
  'components/invoiceCreator.js'
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

