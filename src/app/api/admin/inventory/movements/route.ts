import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Fetch stock movements
    const { data: movements, error } = await supabase
      .from('stock_movements')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      console.error('Error fetching stock movements:', error)
      return NextResponse.json({ error: 'Failed to fetch stock movements' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: movements || [] })
  } catch (error) {
    console.error('Stock movements API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
