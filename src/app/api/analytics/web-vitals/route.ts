import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Store web vitals data
    const { error } = await supabase
      .from('web_vitals')
      .insert({
        metric_name: data.name,
        metric_value: data.value,
        metric_id: data.id,
        url: data.url,
        user_agent: data.userAgent,
        created_at: new Date(data.timestamp).toISOString()
      })

    if (error) {
      console.error('Error storing web vitals:', error)
      return NextResponse.json({ error: 'Failed to store metrics' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Web vitals API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
