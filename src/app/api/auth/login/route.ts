import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'
import {
  generateTokens,
  createSession,
  getClientIP,
  checkLoginAttempts,
  recordFailedLogin,
  clearFailedLogins
} from '@/lib/auth'

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request)
  const userAgent = request.headers.get('user-agent') || 'unknown'

  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Check if IP or email is rate limited
    const loginCheck = checkLoginAttempts(email)
    const ipCheck = checkLoginAttempts(clientIP)

    if (!loginCheck.allowed) {
      const lockMinutes = Math.ceil((loginCheck.lockUntil! - Date.now()) / 60000)
      return NextResponse.json(
        {
          error: 'Account temporarily locked',
          message: `অ্যাকাউন্ট সাময়িকভাবে লক। ${lockMinutes} মিনিট পর চেষ্টা করুন।`,
          lockUntil: loginCheck.lockUntil
        },
        { status: 423 }
      )
    }

    if (!ipCheck.allowed) {
      const lockMinutes = Math.ceil((ipCheck.lockUntil! - Date.now()) / 60000)
      return NextResponse.json(
        {
          error: 'IP temporarily blocked',
          message: `আপনার IP সাময়িকভাবে ব্লক। ${lockMinutes} মিনিট পর চেষ্টা করুন।`,
          lockUntil: ipCheck.lockUntil
        },
        { status: 423 }
      )
    }

    // Find admin user
    const { data: adminUser, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .single()

    if (error || !adminUser) {
      recordFailedLogin(email)
      recordFailedLogin(clientIP)

      // Log failed login attempt
      try {
        await supabase.rpc('log_security_event', {
          p_event_type: 'failed_login',
          p_user_id: null,
          p_ip_address: clientIP,
          p_user_agent: userAgent,
          p_details: { email, reason: 'user_not_found' }
        })
      } catch (logError) {
        console.error('Failed to log security event:', logError)
      }

      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Check if account is locked
    if (adminUser.locked_until && new Date(adminUser.locked_until) > new Date()) {
      const lockMinutes = Math.ceil((new Date(adminUser.locked_until).getTime() - Date.now()) / 60000)
      return NextResponse.json(
        {
          error: 'Account locked',
          message: `অ্যাকাউন্ট লক। ${lockMinutes} মিনিট পর চেষ্টা করুন।`
        },
        { status: 423 }
      )
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, adminUser.password_hash)

    if (!isValidPassword) {
      recordFailedLogin(email)
      recordFailedLogin(clientIP)

      // Handle failed login in database
      try {
        await supabase.rpc('handle_failed_login', {
          p_email: email,
          p_ip_address: clientIP
        })
      } catch (dbError) {
        console.error('Failed to handle failed login:', dbError)
      }

      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Clear failed login attempts on successful login
    clearFailedLogins(email)
    clearFailedLogins(clientIP)

    // Reset failed attempts in database
    try {
      await supabase.rpc('reset_failed_login_attempts', {
        p_email: email
      })
    } catch (dbError) {
      console.error('Failed to reset failed login attempts:', dbError)
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens({
      userId: adminUser.id,
      email: adminUser.email,
      role: 'admin',
      permissions: ['read', 'write', 'delete']
    })

    // Create session
    let sessionId = 'fallback-session'
    try {
      sessionId = await createSession(adminUser.id, userAgent, clientIP)
    } catch (sessionError) {
      console.error('Failed to create session:', sessionError)
    }

    // Log successful login
    try {
      await supabase.rpc('log_security_event', {
        p_event_type: 'login',
        p_user_id: adminUser.id,
        p_ip_address: clientIP,
        p_user_agent: userAgent,
        p_details: { session_id: sessionId }
      })
    } catch (logError) {
      console.error('Failed to log security event:', logError)
    }

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: adminUser.id,
        email: adminUser.email,
        role: 'admin'
      }
    })

    // Set secure HTTP-only cookies
    response.cookies.set('admin-token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 // 15 minutes
    })

    response.cookies.set('refresh-token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/api/auth/refresh'
    })

    response.cookies.set('session-id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    })

    return response

  } catch (error) {
    console.error('Login error:', error)

    // Log error
    try {
      await supabase.rpc('log_security_event', {
        p_event_type: 'login_error',
        p_user_id: null,
        p_ip_address: clientIP,
        p_user_agent: userAgent,
        p_details: { error: error instanceof Error ? error.message : 'Unknown error' }
      })
    } catch (logError) {
      console.error('Failed to log security event:', logError)
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}