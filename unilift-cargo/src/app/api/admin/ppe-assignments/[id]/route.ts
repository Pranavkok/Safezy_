import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createServiceClient } from '@/utils/supabase/service';

async function getAdminRole(authUid: string) {
  const serviceClient = createServiceClient();
  const { data } = await serviceClient
    .from('users')
    .select('user_roles(role)')
    .eq('auth_id', authUid)
    .single();
  return (data?.user_roles as { role: string } | null)?.role ?? null;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const role = await getAdminRole(user.id);
    if (role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const { quantity } = body;
    if (!quantity || quantity < 1) {
      return NextResponse.json({ error: 'quantity (≥ 1) is required' }, { status: 400 });
    }

    const serviceClient = createServiceClient();
    const { data, error } = await serviceClient
      .from('admin_ppe_assignments')
      .update({ quantity, updated_at: new Date().toISOString() })
      .eq('id', params.id)
      .eq('is_deleted', false)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });

    return NextResponse.json({ data });
  } catch (err) {
    console.error('[PATCH /api/admin/ppe-assignments/[id]]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const role = await getAdminRole(user.id);
    if (role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const serviceClient = createServiceClient();
    const { error } = await serviceClient
      .from('admin_ppe_assignments')
      .update({ is_deleted: true, updated_at: new Date().toISOString() })
      .eq('id', params.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[DELETE /api/admin/ppe-assignments/[id]]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
