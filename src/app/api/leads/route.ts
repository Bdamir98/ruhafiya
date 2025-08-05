import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const leadData = await request.json()
    
    // Get additional request info
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown'
    
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const referer = request.headers.get('referer') || 'direct'

    // Prepare lead data for database
    const lead = {
      name: leadData.name || '',
      phone: leadData.phone || '',
      email: leadData.email || '',
      interest: leadData.interest || 'general',
      
      // User info
      ip_address: ip,
      user_agent: userAgent,
      referer: referer,
      country: leadData.userInfo?.country || '',
      city: leadData.userInfo?.city || '',
      device: leadData.userInfo?.device || '',
      browser: leadData.userInfo?.browser || '',
      timezone: leadData.userInfo?.timezone || '',
      
      // Metadata
      source: leadData.source || 'landing_page',
      captured_at: new Date().toISOString(),
      status: 'new'
    }

    // Save to database
    const { data, error } = await supabase
      .from('leads')
      .insert([lead])
      .select()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Database error' },
        { status: 500 }
      )
    }

    // Optional: Send notification to admin
    try {
      await sendLeadNotification(lead)
    } catch (notificationError) {
      console.error('Notification error:', notificationError)
      // Don't fail the request if notification fails
    }

    return NextResponse.json({
      success: true,
      message: 'Lead captured successfully',
      leadId: data[0]?.id
    })

  } catch (error) {
    console.error('Lead capture error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Optional: Send notification to admin
async function sendLeadNotification(lead: any) {
  // You can implement email notification, SMS, or webhook here
  console.log('New lead captured:', {
    name: lead.name,
    phone: lead.phone,
    location: `${lead.city}, ${lead.country}`,
    time: lead.captured_at
  })
  
  // Example: Send to a webhook or notification service
  // await fetch('YOUR_WEBHOOK_URL', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({
  //     text: `🎯 New Lead: ${lead.name} (${lead.phone}) from ${lead.city}, ${lead.country}`
  //   })
  // })
}