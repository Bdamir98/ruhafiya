import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Store event data
    const { error } = await supabase
      .from('analytics_events')
      .insert({
        event_name: data.event,
        parameters: data.parameters,
        url: data.url,
        created_at: new Date(data.timestamp).toISOString()
      })

    if (error) {
      console.error('Error storing analytics event:', error)
      return NextResponse.json({ error: 'Failed to store event' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Analytics events API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
