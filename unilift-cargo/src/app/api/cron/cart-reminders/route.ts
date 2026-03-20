import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase/service';
import { sendPushNotification } from '@/lib/web-push';

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const supabase = createServiceClient();
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const { data: eligible } = await supabase
    .from('cart_reminder_tracking')
    .select('user_id, reminders_sent')
    .lt('last_cart_activity', twentyFourHoursAgo.toISOString())
    .lt('reminders_sent', 3)
    .not('last_cart_activity', 'is', null);

  if (!eligible || eligible.length === 0) {
    return NextResponse.json({ processed: 0 });
  }

  let processed = 0;

  for (const row of eligible) {
    // Confirm they still have items in cart
    const { data: cartItems } = await supabase
      .from('cart_items')
      .select('id, quantity, product:product_id(ppe_name)')
      .eq('user_id', row.user_id);

    if (!cartItems || cartItems.length === 0) {
      await supabase
        .from('cart_reminder_tracking')
        .update({ last_cart_activity: null, reminders_sent: 0 })
        .eq('user_id', row.user_id);
      continue;
    }

    // Look up auth_id (required by sendPushNotification)
    const { data: userRow } = await supabase
      .from('users')
      .select('auth_id')
      .eq('id', row.user_id)
      .single();

    if (!userRow?.auth_id) continue;

    const itemCount = cartItems.length;
    const firstItem =
      (cartItems[0].product as { ppe_name: string } | null)?.ppe_name ?? 'item';
    const reminderNumber = row.reminders_sent + 1;

    const messages = [
      {
        title: 'Items waiting in your cart',
        body:
          itemCount === 1
            ? `${firstItem} is waiting for you. Complete your order to get it delivered.`
            : `${firstItem} and ${itemCount - 1} more item${itemCount > 2 ? 's' : ''} are in your cart.`
      },
      {
        title: "Don't forget your cart",
        body: `You have ${itemCount} safety item${itemCount > 1 ? 's' : ''} waiting. Your team may need this equipment soon.`
      },
      {
        title: 'Last reminder — cart items pending',
        body: `This is your final reminder. ${itemCount} item${itemCount > 1 ? 's' : ''} in your cart. Place your order to stay compliant.`
      }
    ];

    const msg = messages[Math.min(reminderNumber - 1, 2)];

    await sendPushNotification(
      userRow.auth_id,
      'cart_reminder',
      { ...msg, url: '/products/cart' },
      { item_count: itemCount, reminder_number: reminderNumber }
    );

    await supabase
      .from('cart_reminder_tracking')
      .update({
        reminders_sent: reminderNumber,
        last_reminder_at: now.toISOString()
      })
      .eq('user_id', row.user_id);

    processed++;
  }

  return NextResponse.json({ processed });
}
