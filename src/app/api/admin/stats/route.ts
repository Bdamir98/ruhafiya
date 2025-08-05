import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    requireAdmin(request)

    // Fetch order statistics
    const { data: orders, error } = await supabase
      .from('orders')
      .select('status, total_amount')

    if (error) throw error

    // Calculate stats
    const totalOrders = orders?.length || 0
    const pendingOrders = orders?.filter(order => order.status === 'pending').length || 0
    const completedOrders = orders?.filter(order => order.status === 'completed').length || 0
    const totalRevenue = orders?.reduce((sum, order) => sum + order.total_amount, 0) || 0

    const stats = {
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue
    }

    return NextResponse.json(stats, { status: 200 })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { error: 'Unauthorized or server error' },
      { status: 401 }
    )
  }
}