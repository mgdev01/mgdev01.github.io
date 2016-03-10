var isPushEnabled = false;

if (typeof window != 'undefined') {
    window.addEventListener('load', function() {
        if (isPushEnabled) {
            //unsubscribe();
        } else {
            subscribe();
        }

        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('service-worker.js').then(initialiseState);
        } else {
            console.warn('Service workers aren\'t supported in this browser.');
        }
    });
}

// Once the service worker is registered set the initial state
function initialiseState(registration) {
    // Are Notifications supported in the service worker?
    if (!('showNotification' in ServiceWorkerRegistration.prototype)) {
        console.warn('Notifications aren\'t supported.');
        return;
    }

    // Check the current Notification permission.
    // If its denied, it's a permanent block until the
    // user changes the permission
    if (Notification.permission === 'denied') {
        console.warn('The user has blocked notifications.');
        return;
    }

    // Check if push messaging is supported
    if (!('PushManager' in window)) {
        console.warn('Push messaging isn\'t supported.');
        return;
    }

    // We need the service worker registration to check for a subscription
    navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {
        // Registration was successful
        console.log('ServiceWorker registration successful with scope: ',    registration.scope);

        // Do we already have a push message subscription?
        serviceWorkerRegistration.pushManager.getSubscription()
            .then(function(subscription) {
                if (!subscription) {
                    // We aren't subscribed to push, so set UI
                    // to allow the user to enable push
                    return;
                }

                var endpoint = subscription.endpoint;
                var registration_id = endpoint.replace('https://android.googleapis.com/gcm/send/', '');

                console.log("subscription.registration_id: ", registration_id);
                console.log("subscription.endpoint: ", endpoint);

                // TODO: Send the subscription subscription.endpoint to your server
                // and save it to send a push message at a later date
                //sendSubscriptionToServer(subscription);

                isPushEnabled = true;
            }).catch(function(error) {
                console.warn('Error during getSubscription()', error);
            });
    });
}

function subscribe() {
    // Disable the button so it can't be changed while
    // we process the permission request
    navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {
        serviceWorkerRegistration.pushManager.subscribe()
          .then(function(subscription) {
                // The subscription was successful
                isPushEnabled = true;

                var endpoint = subscription.endpoint;
                var registration_id = endpoint.replace('https://android.googleapis.com/gcm/send/', '');

                console.log("subscription.registration_id: ", registration_id);
                console.log("subscription.endpoint: ", endpoint);

                // TODO: Send the subscription.endpoint to your server
                // and save it to send a push message at a later date
                //return sendSubscriptionToServer(subscription);
          })
          .catch(function(e) {
                if (Notification.permission === 'denied') {
                    // The user denied the notification permission which
                    // means we failed to subscribe and the user will need
                    // to manually change the notification permission to
                    // subscribe to push messages
                    console.warn('Permission for Notifications was denied');
                } else {
                    // A problem occurred with the subscription; common reasons
                    // include network errors, and lacking gcm_sender_id and/or
                    // gcm_user_visible_only in the manifest.
                    console.error('Unable to subscribe to push.', e);
                }
          });
    });
}
