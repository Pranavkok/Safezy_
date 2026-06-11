import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createServiceClient } from '@/utils/supabase/service';
import ExcelJS from 'exceljs';

export async function GET(_req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const serviceClient = createServiceClient();
    const { data: adminUser } = await serviceClient
      .from('users')
      .select('user_roles(role)')
      .eq('auth_id', user.id)
      .single();

    const role = (adminUser?.user_roles as { role: string } | null)?.role;
    if (role !== 'admin' && role !== 'manager')
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { data, error } = await serviceClient
      .from('product')
      .select(
        'product_ID, ppe_name, brand_name, ppe_category, price, gst, hsn_code, color, description, geographical_location, created_at, is_out_of_stock'
      )
      .eq('is_deleted', false)
      .order('ppe_name');

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Safezy Admin';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Products');

    sheet.columns = [
      { header: 'Product ID', key: 'product_ID', width: 20 },
      { header: 'Product Name', key: 'ppe_name', width: 35 },
      { header: 'Brand', key: 'brand_name', width: 25 },
      { header: 'Category', key: 'ppe_category', width: 25 },
      { header: 'Price (₹)', key: 'price', width: 14 },
      { header: 'GST (%)', key: 'gst', width: 12 },
      { header: 'HSN Code', key: 'hsn_code', width: 15 },
      { header: 'Colors', key: 'color', width: 25 },
      { header: 'Geographical Location', key: 'geographical_location', width: 30 },
      { header: 'Out of Stock', key: 'is_out_of_stock', width: 15 },
      { header: 'Description', key: 'description', width: 50 },
      { header: 'Created At', key: 'created_at', width: 22 }
    ];

    // Bold header row
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD9E1F2' }
    };

    for (const p of data ?? []) {
      sheet.addRow({
        product_ID: p.product_ID ?? '',
        ppe_name: p.ppe_name ?? '',
        brand_name: p.brand_name ?? '',
        ppe_category: p.ppe_category ?? '',
        price: p.price ?? '',
        gst: p.gst ?? '',
        hsn_code: p.hsn_code ?? '',
        color: Array.isArray(p.color) ? p.color.join(', ') : (p.color ?? ''),
        geographical_location: Array.isArray(p.geographical_location)
          ? p.geographical_location.join(', ')
          : (p.geographical_location ?? ''),
        is_out_of_stock: p.is_out_of_stock ? 'Yes' : 'No',
        description: p.description ?? '',
        created_at: p.created_at ? new Date(p.created_at).toLocaleDateString('en-IN') : ''
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="products_${new Date().toISOString().slice(0, 10)}.xlsx"`
      }
    });
  } catch (err) {
    console.error('[GET /api/admin/products-export]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
