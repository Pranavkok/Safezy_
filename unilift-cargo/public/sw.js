self.addEventListener('push', (event) => {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch {
    // DevTools test push sends plain text — ignore
    return;
  }
  const { title, body, url, icon, badge } = data;

  const options = {
    body,
    icon: icon || '/web-app-manifest-192x192.png',
    badge: badge || '/web-app-manifest-192x192.png',
    data: { url: url || '/contractor/notifications' },
    vibrate: [200, 100, 200],
    requireInteraction: false,
    tag: Date.now().toString(),
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Re-subscribe when Chrome rotates the push subscription endpoint
self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil(
    self.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: 'BDp4CzT5fXRAviWk9HgGjqFfr08d07vTnNNjxQB3oqQ0MnA2fsaE7ZTtkwIMDbWAmavYETuUwAOBTdJZcM37gw8',
    }).then((subscription) =>
      fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription.toJSON()),
      })
    )
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data?.url || '/contractor/notifications';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          client.navigate(url);
          return;
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
