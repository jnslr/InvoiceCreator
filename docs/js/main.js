let dbinit = false

const routes = [
  { name: 'home', path: '/',
    redirect: to=> {
      if (dbinit)
        return 'fileViewer'
    }
  },
  { name: 'fileViewer', path: '/fileViewer', component: httpVueLoader('components/fileViewer.vue') },
  { name: 'edit', path: '/edit', component: httpVueLoader('components/invoiceCreator.vue') },
  { name: 'settings', path: '/settings', component: httpVueLoader('components/settings.vue') }
]

const router = new VueRouter({
  routes // short for `routes: routes`
})

const app = new Vue({
  el: '#app',
  components: {
    'my-header': httpVueLoader('components/header.vue'),
  },
  router: router,
  data: {
    version: null,
    db: null
  },
  methods: {
    loadDb: function(){
      return new Promise( (resolve,reject)=>{
        let request = indexedDB.open("InvoiceCreator",2);
        request.onerror = (e) => {
          console.log(e)
          reject("DB could not be loaded")
        }
        request.onupgradeneeded = (e) => {
            console.log('database upgrade');
            let db = e.target.result;
            if (!db.objectStoreNames.contains('Settings')){
              db.createObjectStore("Settings");
            }
            if (!db.objectStoreNames.contains('RecentDirs')){
              db.createObjectStore("RecentDirs");
            }
            resolve(db)
        }
        request.onsuccess = (e)=> {
          console.log('database opened')
          resolve(e.target.result);
        }
      })
    }
  },
  created: async function () {
    this.db = await this.loadDb();
    this.$router.push('fileViewer')
    dbinit = true
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