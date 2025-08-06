import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh-fallback-secret'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    console.log('[AUTH] Login attempt for:', email)

    if (!email || !password) {
      console.log('[AUTH] Missing email or password')
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find admin user
    console.log('[AUTH] Looking up user in database...')
    const { data: adminUser, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .single()

    console.log('[AUTH] Database query result:', {
      found: !!adminUser,
      error: error?.message,
      userActive: adminUser?.is_active
    })

    if (error || !adminUser) {
      console.log('[AUTH] User not found:', error?.message)
      return NextResponse.json(
        { error: 'Invalid credentials', message: 'User not found' },
        { status: 401 }
      )
    }

    // Check if account is active
    if (!adminUser.is_active) {
      console.log('[AUTH] Account is inactive')
      return NextResponse.json(
        { error: 'Account inactive', message: 'Account is deactivated' },
        { status: 401 }
      )
    }

    // Check if account is locked
    if (adminUser.locked_until && new Date(adminUser.locked_until) > new Date()) {
      const lockMinutes = Math.ceil((new Date(adminUser.locked_until).getTime() - Date.now()) / 60000)
      console.log('[AUTH] Account is locked until:', adminUser.locked_until)
      return NextResponse.json(
        {
          error: 'Account locked',
          message: `Account locked for ${lockMinutes} minutes`
        },
        { status: 423 }
      )
    }

    // Verify password
    console.log('[AUTH] Verifying password...')
    const isValidPassword = await bcrypt.compare(password, adminUser.password_hash)
    console.log('[AUTH] Password valid:', isValidPassword)

    if (!isValidPassword) {
      console.log('[AUTH] Invalid password')
      return NextResponse.json(
        { error: 'Invalid credentials', message: 'Invalid password' },
        { status: 401 }
      )
    }

    // Generate JWT token
    console.log('[AUTH] Generating JWT token...')
    const tokenPayload = {
      userId: adminUser.id,
      email: adminUser.email,
      role: adminUser.role || 'admin',
      permissions: ['read', 'write', 'delete']
    }

    const accessToken = jwt.sign(tokenPayload, JWT_SECRET, {
      expiresIn: '15m',
      issuer: 'ruhafiya-admin',
      audience: 'ruhafiya-app'
    })

    const refreshToken = jwt.sign(
      { userId: adminUser.id, type: 'refresh' },
      JWT_REFRESH_SECRET,
      {
        expiresIn: '7d',
        issuer: 'ruhafiya-admin',
        audience: 'ruhafiya-app'
      }
    )

    // Update last login time
    try {
      await supabase
        .from('admin_users')
        .update({
          last_login: new Date().toISOString(),
          failed_login_attempts: 0,
          locked_until: null
        })
        .eq('id', adminUser.id)
    } catch (updateError) {
      console.log('[AUTH] Failed to update last login:', updateError)
    }

    console.log('[AUTH] Login successful for:', email)

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: adminUser.id,
        email: adminUser.email,
        role: adminUser.role || 'admin'
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
      maxAge: 7 * 24 * 60 * 60 // 7 days
    })

    return response

  } catch (error) {
    console.error('[AUTH] Login error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}