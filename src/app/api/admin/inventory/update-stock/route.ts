import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const adminUser = requireAdmin(request)

    const body = await request.json()
    const { product_name, quantity, reason, notes } = body

    // Validate required fields
    if (!product_name || quantity === undefined || !reason) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get current inventory item
    const { data: inventoryItem, error: fetchError } = await supabase
      .from('inventory')
      .select('*')
      .eq('product_name', product_name)
      .single()

    if (fetchError || !inventoryItem) {
      console.error('Error fetching inventory item:', fetchError)
      return NextResponse.json({ error: 'Inventory item not found' }, { status: 404 })
    }

    const previousStock = inventoryItem.current_stock
    const quantityChange = parseInt(quantity)
    const newStock = Math.max(0, previousStock + quantityChange) // Ensure stock doesn't go negative

    // Determine movement type
    let movementType: 'in' | 'out' | 'adjustment' = 'adjustment'
    if (reason === 'restock' || reason === 'return') {
      movementType = 'in'
    } else if (reason === 'sale' || reason === 'damage') {
      movementType = 'out'
    }

    // Determine new status
    let status = 'active'
    if (newStock === 0) {
      status = 'out_of_stock'
    } else if (newStock <= inventoryItem.minimum_stock) {
      status = 'low_stock'
    }

    // Update inventory
    const { error: updateError } = await supabase
      .from('inventory')
      .update({
        current_stock: newStock,
        status,
        last_restocked_date: reason === 'restock' ? new Date().toISOString().split('T')[0] : inventoryItem.last_restocked_date,
        last_restocked_quantity: reason === 'restock' ? quantityChange : inventoryItem.last_restocked_quantity,
        updated_at: new Date().toISOString()
      })
      .eq('product_name', product_name)

    if (updateError) {
      console.error('Error updating inventory:', updateError)
      return NextResponse.json({ error: 'Failed to update inventory' }, { status: 500 })
    }

    // Record stock movement
    const { error: movementError } = await supabase
      .from('stock_movements')
      .insert({
        product_name,
        movement_type: movementType,
        quantity: Math.abs(quantityChange),
        previous_stock: previousStock,
        new_stock: newStock,
        reason,
        notes: notes || '',
        created_by: adminUser?.id
      })

    if (movementError) {
      console.error('Error recording stock movement:', movementError)
      // Don't fail the request if movement recording fails
    }

    // Check if we need to create low stock notification
    if (status === 'low_stock' || status === 'out_of_stock') {
      await createLowStockNotification(product_name, newStock, inventoryItem.minimum_stock, status)
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        product_name,
        previous_stock: previousStock,
        new_stock: newStock,
        status
      }
    })
  } catch (error) {
    console.error('Update stock API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function createLowStockNotification(productName: string, currentStock: number, minimumStock: number, status: string) {
  try {
    const priority = status === 'out_of_stock' ? 'urgent' : 'high'
    const title = status === 'out_of_stock' ? 'Out of Stock Alert' : 'Low Stock Alert'
    const message = status === 'out_of_stock' 
      ? `Product "${productName}" is out of stock!`
      : `Product "${productName}" is running low. Current stock: ${currentStock}, Minimum: ${minimumStock}`

    // Check if notification already exists for today
    const today = new Date().toISOString().split('T')[0]
    const { data: existingNotification } = await supabase
      .from('admin_notifications')
      .select('id')
      .eq('type', 'low_stock')
      .eq('metadata->product_name', productName)
      .gte('created_at', today + 'T00:00:00')
      .single()

    if (!existingNotification) {
      await supabase
        .from('admin_notifications')
        .insert({
          type: 'low_stock',
          title,
          message,
          priority,
          action_url: '/admin/dashboard/inventory',
          metadata: {
            product_name: productName,
            current_stock: currentStock,
            minimum_stock: minimumStock,
            status
          }
        })
    }
  } catch (error) {
    console.error('Error creating low stock notification:', error)
  }
}
