import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase/service';
import { sendPushNotification } from '@/lib/web-push';

type AssignmentRow = {
  id: string;
  created_at: string;
  expiry_notified: boolean;
  warning_notified: boolean;
  product: { ppe_name: string; use_life: number } | null;
  contractor: { auth_id: string } | null;
};

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from('admin_ppe_assignments')
    .select(`
      id,
      created_at,
      expiry_notified,
      warning_notified,
      product:product_id (ppe_name, use_life),
      contractor:contractor_id (auth_id)
    `)
    .eq('is_deleted', false) as unknown as { data: AssignmentRow[] | null; error: unknown };

  if (error || !data) {
    console.error('[ppe-expiry cron] fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 });
  }

  const today = startOfDay(new Date());
  const in7Days = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  let expiredCount = 0;
  let warningCount = 0;

  for (const row of data) {
    if (!row.product?.use_life || !row.contractor?.auth_id) continue;

    const expiryDate = startOfDay(addMonths(new Date(row.created_at), row.product.use_life));

    // ── Expired today ──────────────────────────────────────────────────────────
    if (!row.expiry_notified && expiryDate.getTime() <= today.getTime()) {
      await sendPushNotification(
        row.contractor.auth_id,
        'ppe_expired',
        {
          title: 'PPE Expired',
          body: `Your assigned ${row.product.ppe_name} has expired. Please request a replacement.`,
          url: '/contractor/assigned-ppe',
        },
        { assignment_id: row.id }
      );

      await supabase
        .from('admin_ppe_assignments')
        .update({ expiry_notified: true } as never)
        .eq('id', row.id);

      expiredCount++;
    }

    // ── Expiring in exactly 7 days ─────────────────────────────────────────────
    if (!row.warning_notified && expiryDate.getTime() === in7Days.getTime()) {
      await sendPushNotification(
        row.contractor.auth_id,
        'ppe_expiry_warning',
        {
          title: 'PPE Expiring Soon',
          body: `Your assigned ${row.product.ppe_name} will expire in 7 days. Plan for a replacement.`,
          url: '/contractor/assigned-ppe',
        },
        { assignment_id: row.id }
      );

      await supabase
        .from('admin_ppe_assignments')
        .update({ warning_notified: true } as never)
        .eq('id', row.id);

      warningCount++;
    }
  }

  return NextResponse.json({ expired: expiredCount, warnings: warningCount });
}
