import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Fetch all hero slides
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('hero_slides')
      .select('*')
      .eq('is_active', true)
      .order('slide_order', { ascending: true })

    if (error) {
      console.error('Error fetching hero slides:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      slides: data || []
    })
  } catch (error) {
    console.error('Error fetching hero slides:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new hero slide
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      slide_order,
      title,
      subtitle,
      description,
      highlight,
      background_image,
      gradient_colors
    } = body

    const { data, error } = await supabase
      .from('hero_slides')
      .insert([{
        slide_order,
        title,
        subtitle,
        description,
        highlight,
        background_image,
        gradient_colors,
        is_active: true
      }])
      .select()

    if (error) {
      console.error('Error creating hero slide:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      slide: data[0]
    })
  } catch (error) {
    console.error('Error creating hero slide:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update hero slide
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      id,
      slide_order,
      title,
      subtitle,
      description,
      highlight,
      background_image,
      gradient_colors
    } = body

    const { data, error } = await supabase
      .from('hero_slides')
      .update({
        slide_order,
        title,
        subtitle,
        description,
        highlight,
        background_image,
        gradient_colors,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()

    if (error) {
      console.error('Error updating hero slide:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      slide: data[0]
    })
  } catch (error) {
    console.error('Error updating hero slide:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete hero slide
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Slide ID is required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('hero_slides')
      .update({ is_active: false })
      .eq('id', id)

    if (error) {
      console.error('Error deleting hero slide:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Slide deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting hero slide:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}