import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    requireAdmin(request)

    // Fetch inventory data
    const { data: inventory, error } = await supabase
      .from('inventory')
      .select('*')
      .order('product_name', { ascending: true })

    if (error) {
      console.error('Error fetching inventory:', error)
      return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 })
    }

    // Update status based on current stock levels
    const updatedInventory = inventory?.map(item => {
      let status = 'active'
      
      if (item.current_stock === 0) {
        status = 'out_of_stock'
      } else if (item.current_stock <= item.minimum_stock) {
        status = 'low_stock'
      }
      
      return { ...item, status }
    })

    // Update status in database if needed
    if (updatedInventory) {
      for (const item of updatedInventory) {
        if (item.status !== item.status) {
          await supabase
            .from('inventory')
            .update({ status: item.status })
            .eq('id', item.id)
        }
      }
    }

    return NextResponse.json({ success: true, data: updatedInventory })
  } catch (error) {
    console.error('Inventory API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    requireAdmin(request)

    const body = await request.json()
    const {
      product_name,
      current_stock,
      minimum_stock,
      maximum_stock,
      unit_cost,
      selling_price,
      supplier_name,
      supplier_contact
    } = body

    // Validate required fields
    if (!product_name || current_stock === undefined || !selling_price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Determine initial status
    let status = 'active'
    if (current_stock === 0) {
      status = 'out_of_stock'
    } else if (current_stock <= (minimum_stock || 10)) {
      status = 'low_stock'
    }

    // Insert new inventory item
    const { data, error } = await supabase
      .from('inventory')
      .insert({
        product_name,
        current_stock: parseInt(current_stock),
        minimum_stock: parseInt(minimum_stock) || 10,
        maximum_stock: parseInt(maximum_stock) || 1000,
        unit_cost: parseFloat(unit_cost) || 0,
        selling_price: parseFloat(selling_price),
        supplier_name: supplier_name || '',
        supplier_contact: supplier_contact || '',
        status,
        last_restocked_date: new Date().toISOString().split('T')[0],
        last_restocked_quantity: parseInt(current_stock)
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating inventory item:', error)
      return NextResponse.json({ error: 'Failed to create inventory item' }, { status: 500 })
    }

    // Create initial stock movement record
    await supabase
      .from('stock_movements')
      .insert({
        product_name,
        movement_type: 'in',
        quantity: parseInt(current_stock),
        previous_stock: 0,
        new_stock: parseInt(current_stock),
        reason: 'initial_stock',
        notes: 'Initial inventory setup'
      })

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Create inventory API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verify admin authentication
    requireAdmin(request)

    const body = await request.json()
    const {
      id,
      product_name,
      minimum_stock,
      maximum_stock,
      unit_cost,
      selling_price,
      supplier_name,
      supplier_contact
    } = body

    // Validate required fields
    if (!id || !product_name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Update inventory item
    const { data, error } = await supabase
      .from('inventory')
      .update({
        product_name,
        minimum_stock: parseInt(minimum_stock) || 10,
        maximum_stock: parseInt(maximum_stock) || 1000,
        unit_cost: parseFloat(unit_cost) || 0,
        selling_price: parseFloat(selling_price),
        supplier_name: supplier_name || '',
        supplier_contact: supplier_contact || '',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating inventory item:', error)
      return NextResponse.json({ error: 'Failed to update inventory item' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Update inventory API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verify admin authentication
    requireAdmin(request)

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Missing inventory item ID' }, { status: 400 })
    }

    // Delete inventory item
    const { error } = await supabase
      .from('inventory')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting inventory item:', error)
      return NextResponse.json({ error: 'Failed to delete inventory item' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete inventory API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
