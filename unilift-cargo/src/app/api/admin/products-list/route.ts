import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createServiceClient } from '@/utils/supabase/service';

export async function GET(_req: NextRequest) {
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

    const { data, error } = await serviceClient
      .from('product')
      .select('id, ppe_name, ppe_category')
      .eq('is_deleted', false)
      .order('ppe_name');

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ data });
  } catch (err) {
    console.error('[GET /api/admin/products-list]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
