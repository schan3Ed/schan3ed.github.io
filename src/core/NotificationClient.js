import firebase from 'firebase';
import DatabaseClient from './DatabaseClient'

var initialized = false;

class NotificationClient {
    initializeNotifications(uid) {
        if (initialized) {
            return;
        }
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
                navigator.serviceWorker.register('/firebase-messaging-sw.js').then(function(registration) {
                // Registration was successful
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
                }, function(err) {
                // registration failed :(
                console.log('ServiceWorker registration failed: ', err);
                });
            });
        }
        let messaging = firebase.messaging();
        messaging.usePublicVapidKey('BGD5u8DF_yrHDjZKzLbDHFA2YnhahqrlxdFn4YVwQFmSonMTfHKvigrZKPxnrZzn_hqFzL4_9HiCaIzdcHCQqSE');
        messaging.requestPermission()
            .then(() => {
                console.log("Have Permission");
                return messaging.getToken();
             })
            .then(token => {
                console.log("FCM Token:", token);
                //you probably want to send your new found FCM token to the
                //application server so that they can send any push
                //notification to you.
                if (token) {
                    DatabaseClient.setPushToken(uid, token); // CHECK: don't await
                }
                else {
                    // TODO: add UI element to ask for enabling push notifications. Clicking on it should call NotificationClient again.
                    console.log('Please allow notifications!');
                }
            })
            .catch(error => {
               if (error.code === "messaging/permission-blocked") {
                    console.log("Please Unblock Notification Request Manually");
                    // TODO: add an element on the website requesting permission to notify
               } else {
                    console.log(error.message);
               }
            });
        messaging.onMessage(payload => {
            console.log("Notification Received", payload);
            //this is the function that gets triggered when you receive a 
            //push notification while you’re on the page. So you can 
            //create a corresponding UI for you to have the push 
            //notification handled.
        });

        // Callback fired if Instance ID token is updated.
        messaging.onTokenRefresh( () => {
            messaging.getToken().then( (refreshedToken) => {
                console.log('Token refreshed.');
                DatabaseClient.setPushToken(uid, refreshedToken);
            }).catch(function(err) {
                console.log('Unable to retrieve refreshed token ', err);
                //showToken('Unable to retrieve refreshed token ', err);
            });
        });

        initialized = true;
    }
}

export default new NotificationClient()