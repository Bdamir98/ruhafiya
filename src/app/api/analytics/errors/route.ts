import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Store error data
    const { error } = await supabase
      .from('error_logs')
      .insert({
        message: data.message,
        filename: data.filename,
        line_number: data.lineno,
        column_number: data.colno,
        stack_trace: data.error,
        reason: data.reason,
        url: data.url,
        user_agent: data.userAgent,
        created_at: new Date(data.timestamp).toISOString()
      })

    if (error) {
      console.error('Error storing error log:', error)
      return NextResponse.json({ error: 'Failed to store error' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error logging API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
