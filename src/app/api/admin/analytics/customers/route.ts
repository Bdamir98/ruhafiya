import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    requireAdmin(request)

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

    // Fetch customer analytics data
    const { data: customerData, error } = await supabase
      .from('customer_analytics')
      .select('*')
      .gte('last_activity_date', startDate.toISOString().split('T')[0])
      .order('total_spent', { ascending: false })

    if (error) {
      console.error('Error fetching customer analytics:', error)
      return NextResponse.json({ error: 'Failed to fetch customer data' }, { status: 500 })
    }

    // If no data exists, generate it from orders
    if (!customerData || customerData.length === 0) {
      await generateCustomerAnalytics()
      
      // Fetch again after generation
      const { data: newCustomerData, error: newError } = await supabase
        .from('customer_analytics')
        .select('*')
        .gte('last_activity_date', startDate.toISOString().split('T')[0])
        .order('total_spent', { ascending: false })

      if (newError) {
        console.error('Error fetching generated customer analytics:', newError)
        return NextResponse.json({ error: 'Failed to fetch customer data' }, { status: 500 })
      }

      return NextResponse.json({ success: true, data: newCustomerData || [] })
    }

    return NextResponse.json({ success: true, data: customerData })
  } catch (error) {
    console.error('Customer analytics API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function generateCustomerAnalytics() {
  try {
    // Get all orders grouped by customer
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching orders for customer analytics:', error)
      return
    }

    // Group orders by customer phone
    const customerMap = new Map()

    orders?.forEach(order => {
      const phone = order.customer_phone
      
      if (!customerMap.has(phone)) {
        customerMap.set(phone, {
          customer_phone: phone,
          customer_name: order.customer_name,
          customer_email: order.customer_email,
          orders: [],
          total_orders: 0,
          total_spent: 0,
          first_order_date: null,
          last_order_date: null,
          customer_type: 'new'
        })
      }

      const customer = customerMap.get(phone)
      customer.orders.push(order)
      customer.total_orders += 1
      customer.total_spent += parseFloat(order.total_amount) || 0
      
      const orderDate = new Date(order.created_at)
      
      if (!customer.first_order_date || orderDate < customer.first_order_date) {
        customer.first_order_date = orderDate
      }
      
      if (!customer.last_order_date || orderDate > customer.last_order_date) {
        customer.last_order_date = orderDate
      }
      
      // Update customer type
      customer.customer_type = customer.total_orders > 1 ? 'returning' : 'new'
    })

    // Prepare data for database insertion
    const customerAnalytics = Array.from(customerMap.values()).map(customer => ({
      customer_phone: customer.customer_phone,
      customer_name: customer.customer_name,
      customer_email: customer.customer_email,
      first_order_date: customer.first_order_date?.toISOString().split('T')[0],
      last_order_date: customer.last_order_date?.toISOString().split('T')[0],
      total_orders: customer.total_orders,
      total_spent: customer.total_spent,
      average_order_value: customer.total_orders > 0 ? customer.total_spent / customer.total_orders : 0,
      customer_type: customer.customer_type,
      customer_segment: getCustomerSegment(customer),
      last_activity_date: customer.last_order_date?.toISOString().split('T')[0]
    }))

    // Insert customer analytics data
    const { error: insertError } = await supabase
      .from('customer_analytics')
      .upsert(customerAnalytics, { onConflict: 'customer_phone' })

    if (insertError) {
      console.error('Error inserting customer analytics:', insertError)
    }
  } catch (error) {
    console.error('Error generating customer analytics:', error)
  }
}

function getCustomerSegment(customer: any): string {
  const totalSpent = customer.total_spent
  const totalOrders = customer.total_orders
  const daysSinceLastOrder = customer.last_order_date 
    ? Math.floor((Date.now() - customer.last_order_date.getTime()) / (1000 * 60 * 60 * 24))
    : 0

  // High value customers (spent more than 5000 BDT)
  if (totalSpent >= 5000) {
    return 'high_value'
  }
  
  // Frequent customers (more than 3 orders)
  if (totalOrders >= 3) {
    return 'frequent'
  }
  
  // At risk customers (no order in last 60 days)
  if (daysSinceLastOrder > 60) {
    return 'at_risk'
  }
  
  // New customers
  if (totalOrders === 1) {
    return 'new'
  }
  
  return 'regular'
}
