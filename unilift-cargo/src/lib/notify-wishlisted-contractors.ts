import { createServiceClient } from '@/utils/supabase/service';
import { sendPushNotification } from './web-push';

export async function notifyWishlistedContractors(
  productId: string,
  productName: string,
): Promise<void> {
  const supabase = createServiceClient();

  // Fetch auth_id of every contractor who wishlisted this product
  const { data: entries, error } = await supabase
    .from('wishlist')
    .select('users!inner(auth_id)')
    .eq('product_id', productId);

  if (error) {
    console.error('[notifyWishlistedContractors] failed to fetch wishlist entries:', error);
    return;
  }

  if (!entries || entries.length === 0) return;

  console.log(
    `[notifyWishlistedContractors] product=${productId} | wishlisted_by=${entries.length}`,
  );

  const BATCH_SIZE = 50;
  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    const batch = entries.slice(i, i + BATCH_SIZE);
    await Promise.allSettled(
      batch.map(entry =>
        sendPushNotification(
          entry.users.auth_id,
          'wishlist_back_in_stock',
          {
            title: '🎉 Back in Stock!',
            body: `${productName} is now available. Add it to your cart before it sells out!`,
            url: `/products/${productId}`,
          },
        ),
      ),
    );
  }
}
