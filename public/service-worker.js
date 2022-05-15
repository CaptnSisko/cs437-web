importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js');

workbox.routing.registerRoute(
    ({request}) => request.destination === 'image',
    new workbox.strategies.NetworkFirst()
);

workbox.routing.registerRoute(
    ({url}) => url.pathname.startsWith('/api'),
    new workbox.strategies.NetworkFirst()
);

self.addEventListener("push", e => {
    const data = e.data.json();
    self.registration.showNotification(
        data.title, // title of the notification
        {
            body: data.body, //the body of the push notification
        }
    );
});
