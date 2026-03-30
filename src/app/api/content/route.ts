import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const supabase = createSupabaseAdmin();
    const { searchParams } = new URL(request.url);

    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const visibility = searchParams.get('visibility');

    let query = supabase
      .from('content')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);
    if (type) query = query.eq('type', type);
    if (visibility) query = query.eq('visibility', visibility);

    const { data, error } = await query;

    if (error) {
      console.error('Content list error:', error);
      return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('Content route error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
