import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createServiceClient } from '@/utils/supabase/service';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const serviceClient = createServiceClient();

    // Resolve public user id from auth uid
    const { data: publicUser } = await serviceClient
      .from('users')
      .select('id')
      .eq('auth_id', user.id)
      .single();

    if (!publicUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const { data, error } = await serviceClient
      .from('admin_ppe_assignments')
      .select(`
        id,
        quantity,
        created_at,
        product:product_id (id, ppe_name, ppe_category, image),
        admin:assigned_by (first_name, last_name)
      `)
      .eq('contractor_id', publicUser.id)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ data });
  } catch (err) {
    console.error('[GET /api/contractor/assigned-ppe]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
