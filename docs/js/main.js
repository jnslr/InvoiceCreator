const routes = [
  { name: 'home', path: '/', component: FileViewer },
  { name: 'edit', path: '/edit', component: InvoiceCreator}
]

const router = new VueRouter({
  routes // short for `routes: routes`
})

const app = new Vue({
  el: '#app',
  router: router,
  data: {
    version: null
  }
})

window.onload = () => {
    'use strict';

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/InvoiceCreator/sw.js', {scope: '/InvoiceCreator/'})

      navigator.serviceWorker.addEventListener("message", (evt) => {
        if(evt.data.type=='version'){
          app.$data.version = evt.data.message; //Store version in app
        }
      });

      navigator.serviceWorker.ready.then( registration => { 
        registration.active.postMessage({type: 'getVersion'}); //Ask for version as soon as ready
      })
    }
}