'use strict';

if ('serviceWorker' in navigator) {
  console.log('Service Worker is supported');
  navigator.serviceWorker.register('service-worker.js').then(function() {
    return navigator.serviceWorker.ready;
  }).then(function(reg) {
    console.log('Service Worker is ready :^)', reg);
    reg.pushManager.subscribe({userVisibleOnly: true}).then(function(sub) {
      console.log('endpoint:', sub, sub.endpoint);
    });
  }).catch(function(error) {
    console.log('Service Worker error :^(', error);
  });
}
