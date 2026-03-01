'use client';

import { useEffect, useState } from 'react';
import { usePushNotification } from '@/hooks/usePushNotification';
import { X, Bell } from 'lucide-react';

export default function PushNotificationSetup() {
  const { requestPermissionAndSubscribe, subscribe } = usePushNotification();
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('Notification' in window)) return;

    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.error('Service worker registration failed:', err);
    });

    const current = Notification.permission;

    if (current === 'default') {
      setShowBanner(true);
    } else if (current === 'granted') {
      // Silently re-subscribe if subscription was lost (e.g. browser cleared it)
      subscribe();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAllow = async () => {
    setShowBanner(false);
    await requestPermissionAndSubscribe();
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-white border border-gray-200 shadow-lg rounded-lg px-4 py-3 text-sm">
      <Bell className="h-4 w-4 text-primary shrink-0" />
      <span className="text-gray-700">Enable notifications to stay updated</span>
      <button
        onClick={handleAllow}
        className="ml-2 bg-primary text-white text-xs font-medium px-3 py-1 rounded-md hover:opacity-90"
      >
        Enable
      </button>
      <button
        onClick={() => setShowBanner(false)}
        className="text-gray-400 hover:text-gray-600"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
