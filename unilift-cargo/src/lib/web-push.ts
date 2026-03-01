import webpush from 'web-push';
import { createServiceClient } from '@/utils/supabase/service';

webpush.setVapidDetails(
  process.env.VAPID_EMAIL!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  icon?: string;
}

export async function sendPushNotification(
  userId: string,
  type: string,
  payload: PushPayload,
  data: Record<string, unknown> = {},
): Promise<void> {
  const supabase = createServiceClient();

  // 1. Persist in notifications table (for in-app center)
  const { error: insertError } = await supabase.from('notifications').insert({
    user_id: userId,
    type,
    title: payload.title,
    body: payload.body,
    url: payload.url ?? '/contractor/notifications',
    data,
    is_read: false,
  });
  if (insertError) {
    console.error('[sendPushNotification] notifications insert failed:', insertError);
  }

  // 2. Fetch all push subscriptions for this user
  const { data: subscriptions } = await supabase
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth')
    .eq('user_id', userId);

  console.log(`[sendPushNotification] user=${userId} type=${type} subscriptions=${subscriptions?.length ?? 0}`);

  if (!subscriptions || subscriptions.length === 0) return;

  // 3. Send push to each browser session, clean up expired endpoints
  const pushPromises = subscriptions.map(async (sub) => {
    const subscription = {
      endpoint: sub.endpoint,
      keys: { p256dh: sub.p256dh, auth: sub.auth },
    };

    try {
      await webpush.sendNotification(subscription, JSON.stringify(payload));
    } catch (err: unknown) {
      const error = err as { statusCode?: number };
      if (error.statusCode === 410 || error.statusCode === 404) {
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('endpoint', sub.endpoint);
      } else {
        console.error('[sendPushNotification] webpush error:', err);
      }
    }
  });

  await Promise.allSettled(pushPromises);
}
