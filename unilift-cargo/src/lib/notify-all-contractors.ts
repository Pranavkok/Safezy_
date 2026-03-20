import { createServiceClient } from '@/utils/supabase/service';
import { sendPushNotification } from './web-push';
import type { PushPayload } from './web-push';

export async function notifyAllContractors(
  type: string,
  payload: PushPayload,
  data: Record<string, unknown> = {},
) {
  const supabase = createServiceClient();

  const { data: roleData, error: roleError } = await supabase
    .from('user_roles')
    .select('id')
    .eq('role', 'contractor')
    .single();

  if (roleError || !roleData) {
    console.error('[notify-all-contractors] failed to fetch contractor role:', roleError);
    return;
  }

  const { data: contractors, error: contractorsError } = await supabase
    .from('users')
    .select('auth_id')
    .eq('role_id', roleData.id)
    .eq('is_deleted', false)
    .eq('is_active', true);

  console.log('[notify-all-contractors] type:', type, '| role_id:', roleData.id, '| contractors:', contractors?.length ?? 0, '| error:', contractorsError?.message ?? 'none');

  if (!contractors || contractors.length === 0) return;

  const BATCH_SIZE = 50;
  for (let i = 0; i < contractors.length; i += BATCH_SIZE) {
    const batch = contractors.slice(i, i + BATCH_SIZE);
    await Promise.allSettled(
      batch.map((c) => sendPushNotification(c.auth_id, type, payload, data)),
    );
  }
}
