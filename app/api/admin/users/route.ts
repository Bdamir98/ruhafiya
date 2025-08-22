import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.trim();
    const page = Math.max(1, Number(searchParams.get('page') || '1'));
    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get('pageSize') || '10')));

    let query = supabaseServer
      .from('admin_users')
      .select('id, email, name, is_active, last_login_at, created_at', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (q) {
      query = query.or(`email.ilike.%${q}%,name.ilike.%${q}%`);
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    const { data, error, count } = await query.range(from, to);

    if (error) throw error;
    return NextResponse.json({ users: data ?? [], total: count ?? 0, page, pageSize });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
