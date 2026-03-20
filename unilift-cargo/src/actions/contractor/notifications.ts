'use server';

import { createClient } from '@/utils/supabase/server';

export type AppNotification = {
  id: string;
  type: string;
  title: string;
  body: string;
  url: string | null;
  is_read: boolean | null;
  created_at: string | null;
};

export const fetchAppNotifications = async (): Promise<{
  success: boolean;
  data: AppNotification[];
  unreadCount: number;
}> => {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return { success: false, data: [], unreadCount: 0 };

  const { data, error } = await supabase
    .from('notifications')
    .select('id, type, title, body, url, is_read, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) return { success: false, data: [], unreadCount: 0 };

  const unreadCount = (data ?? []).filter(n => !n.is_read).length;
  return { success: true, data: data ?? [], unreadCount };
};

export const markNotificationRead = async (notificationId: string) => {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .eq('user_id', user.id);
};

export const markAllNotificationsRead = async () => {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', user.id)
    .eq('is_read', false);
};

export const getAppNotificationUnreadCount = async (): Promise<number> => {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return 0;

  const { data } = await supabase
    .from('notifications')
    .select('id')
    .eq('user_id', user.id)
    .eq('is_read', false);

  return data?.length ?? 0;
};
