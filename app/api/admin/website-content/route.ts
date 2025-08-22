import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseServer } from '@/lib/supabase-server';

const PutSchema = z.object({
  content: z.record(z.any()), // arbitrary JSON
});

export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from('website_content')
      .select('id, content, updated_at')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return NextResponse.json({ content: data?.content ?? {}, id: data?.id ?? null, updated_at: data?.updated_at ?? null });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch website content' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { content } = PutSchema.parse(body);

    const { data, error } = await supabaseServer
      .from('website_content')
      .insert({ content })
      .select('id, content, updated_at')
      .single();

    if (error) throw error;
    return NextResponse.json({ content: data.content, id: data.id, updated_at: data.updated_at });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update website content' }, { status: 500 });
  }
}
