import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createServiceClient } from '@/utils/supabase/service';
import { sendPushNotification } from '@/lib/web-push';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const serviceClient = createServiceClient();
    const { data: adminUser } = await serviceClient
      .from('users')
      .select('user_roles(role)')
      .eq('auth_id', user.id)
      .single();

    const role = (adminUser?.user_roles as { role: string } | null)?.role;
    if (role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const contractorId = req.nextUrl.searchParams.get('contractor_id');
    if (!contractorId) return NextResponse.json({ error: 'contractor_id is required' }, { status: 400 });

    const { data, error } = await serviceClient
      .from('admin_ppe_assignments')
      .select(`
        id,
        quantity,
        created_at,
        product:product_id (id, ppe_name, ppe_category, image)
      `)
      .eq('contractor_id', contractorId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ data });
  } catch (err) {
    console.error('[GET /api/admin/ppe-assignments]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const serviceClient = createServiceClient();
    const { data: adminUser } = await serviceClient
      .from('users')
      .select('id, first_name, last_name, user_roles(role)')
      .eq('auth_id', user.id)
      .single();

    const role = (adminUser?.user_roles as { role: string } | null)?.role;
    if (role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const { contractor_id, product_id, quantity } = body;

    if (!contractor_id || !product_id || !quantity || quantity < 1) {
      return NextResponse.json({ error: 'contractor_id, product_id, and quantity (≥ 1) are required' }, { status: 400 });
    }

    const { data: assignment, error } = await serviceClient
      .from('admin_ppe_assignments')
      .insert({
        contractor_id,
        product_id,
        quantity,
        assigned_by: adminUser!.id,
        is_deleted: false,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Fetch product name and contractor auth_id for notification
    const [{ data: product }, { data: contractor }] = await Promise.all([
      serviceClient.from('product').select('ppe_name').eq('id', product_id).single(),
      serviceClient.from('users').select('auth_id').eq('id', contractor_id).single(),
    ]);

    const productName = product?.ppe_name ?? 'PPE';
    const adminName = `${adminUser!.first_name} ${adminUser!.last_name}`.trim();

    // sendPushNotification requires auth_id (auth.uid()), not public users.id
    if (contractor?.auth_id) {
      await sendPushNotification(
        contractor.auth_id,
        'ppe_assigned',
        {
          title: 'PPE Assigned',
          body: `${adminName} has assigned ${quantity} ${productName} to you.`,
          url: '/contractor/assigned-ppe',
        },
        { assignment_id: assignment.id, product_id, quantity }
      );
    }

    return NextResponse.json({ data: assignment }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/admin/ppe-assignments]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
