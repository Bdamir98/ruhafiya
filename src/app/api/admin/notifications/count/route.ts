import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Get unread notification count
    const { count, error } = await supabase
      .from('admin_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false)

    if (error) {
      console.error('Error fetching notification count:', error)
      return NextResponse.json({ error: 'Failed to fetch notification count' }, { status: 500 })
    }

    return NextResponse.json({ success: true, count: count || 0 })
  } catch (error) {
    console.error('Notification count API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
