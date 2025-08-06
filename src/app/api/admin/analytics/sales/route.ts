import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    try {
      requireAdmin(request)
    } catch (error) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || '30d'

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    
    switch (range) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7)
        break
      case '30d':
        startDate.setDate(endDate.getDate() - 30)
        break
      case '90d':
        startDate.setDate(endDate.getDate() - 90)
        break
      default:
        startDate.setDate(endDate.getDate() - 30)
    }

    // Fetch sales analytics data
    const { data: salesData, error } = await supabase
      .from('sales_analytics')
      .select('*')
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])
      .order('date', { ascending: true })

    if (error) {
      console.error('Error fetching sales analytics:', error)
      return NextResponse.json({ error: 'Failed to fetch sales data' }, { status: 500 })
    }

    // If no data exists, generate it from orders
    if (!salesData || salesData.length === 0) {
      await generateSalesAnalytics(startDate, endDate)
      
      // Fetch again after generation
      const { data: newSalesData, error: newError } = await supabase
        .from('sales_analytics')
        .select('*')
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: true })

      if (newError) {
        console.error('Error fetching generated sales analytics:', newError)
        return NextResponse.json({ error: 'Failed to fetch sales data' }, { status: 500 })
      }

      return NextResponse.json({ success: true, data: newSalesData || [] })
    }

    return NextResponse.json({ success: true, data: salesData })
  } catch (error) {
    console.error('Sales analytics API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function generateSalesAnalytics(startDate: Date, endDate: Date) {
  try {
    // Get all orders in the date range
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    if (error) {
      console.error('Error fetching orders for analytics:', error)
      return
    }

    // Group orders by date
    const dailyData = new Map()
    
    // Initialize all dates in range with zero values
    const currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0]
      dailyData.set(dateStr, {
        date: dateStr,
        total_revenue: 0,
        total_orders: 0,
        total_customers: 0,
        new_customers: 0,
        returning_customers: 0,
        average_order_value: 0,
        customer_phones: new Set()
      })
      currentDate.setDate(currentDate.getDate() + 1)
    }

    // Process orders
    const customerFirstOrderDates = new Map()
    
    // First pass: find first order date for each customer
    orders?.forEach(order => {
      const phone = order.customer_phone
      const orderDate = new Date(order.created_at)
      
      if (!customerFirstOrderDates.has(phone) || orderDate < customerFirstOrderDates.get(phone)) {
        customerFirstOrderDates.set(phone, orderDate)
      }
    })

    // Second pass: aggregate daily data
    orders?.forEach(order => {
      const orderDate = new Date(order.created_at)
      const dateStr = orderDate.toISOString().split('T')[0]
      
      if (dailyData.has(dateStr)) {
        const dayData = dailyData.get(dateStr)
        
        dayData.total_revenue += parseFloat(order.total_amount) || 0
        dayData.total_orders += 1
        dayData.customer_phones.add(order.customer_phone)
        
        // Check if this is a new customer (first order on this date)
        const firstOrderDate = customerFirstOrderDates.get(order.customer_phone)
        if (firstOrderDate && firstOrderDate.toISOString().split('T')[0] === dateStr) {
          dayData.new_customers += 1
        } else {
          dayData.returning_customers += 1
        }
      }
    })

    // Calculate final values and insert into database
    const analyticsData = Array.from(dailyData.values()).map(dayData => {
      dayData.total_customers = dayData.customer_phones.size
      dayData.average_order_value = dayData.total_orders > 0 ? dayData.total_revenue / dayData.total_orders : 0
      
      // Remove the Set as it's not needed for database
      delete dayData.customer_phones
      
      return dayData
    })

    // Insert analytics data
    const { error: insertError } = await supabase
      .from('sales_analytics')
      .upsert(analyticsData, { onConflict: 'date' })

    if (insertError) {
      console.error('Error inserting sales analytics:', insertError)
    }
  } catch (error) {
    console.error('Error generating sales analytics:', error)
  }
}
