import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const section = searchParams.get('section')

    let query = supabase.from('website_content').select('*')
    
    if (section) {
      query = query.eq('section', section)
    }

    const { data, error } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 })
    }

    // If requesting a specific section, return just that content
    if (section && data && data.length > 0) {
      return NextResponse.json(data[0].content)
    }

    // Return all sections as an object
    const contentMap: Record<string, any> = {}
    data?.forEach(item => {
      contentMap[item.section] = item.content
    })

    return NextResponse.json(contentMap)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { section, content } = await request.json()

    if (!section || !content) {
      return NextResponse.json({ error: 'Section and content are required' }, { status: 400 })
    }

    // Check if section exists
    const { data: existing } = await supabase
      .from('website_content')
      .select('id')
      .eq('section', section)
      .single()

    if (existing) {
      // Update existing section
      const { error } = await supabase
        .from('website_content')
        .update({
          content,
          updated_at: new Date().toISOString()
        })
        .eq('section', section)

      if (error) throw error
    } else {
      // Insert new section
      const { error } = await supabase
        .from('website_content')
        .insert([{
          section,
          content,
          updated_at: new Date().toISOString()
        }])

      if (error) throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Failed to save content' }, { status: 500 })
  }
}
