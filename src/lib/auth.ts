import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { NextRequest } from 'next/server'
import { supabase } from './supabase'

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'fallback-secret'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh-fallback-secret'

// Password policy configuration
const PASSWORD_POLICY = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  maxAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 minutes
}

// Rate limiting storage (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()
const loginAttempts = new Map<string, { count: number; lockUntil: number }>()

export interface AdminUser {
  userId: string
  email: string
  role?: string
  permissions?: string[]
}

export interface TokenPayload extends AdminUser {
  iat: number
  exp: number
}

export async function hashPassword(password: string): Promise<string> {
  // Use higher cost factor for better security
  return bcrypt.hash(password, 14)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (password.length < PASSWORD_POLICY.minLength) {
    errors.push(`Password must be at least ${PASSWORD_POLICY.minLength} characters long`)
  }

  if (PASSWORD_POLICY.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  if (PASSWORD_POLICY.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }

  if (PASSWORD_POLICY.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  if (PASSWORD_POLICY.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export function generateTokens(payload: Omit<TokenPayload, 'iat' | 'exp'>): { accessToken: string; refreshToken: string } {
  const accessToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: '15m',
    issuer: 'ruhafiya-admin',
    audience: 'ruhafiya-app'
  })

  const refreshToken = jwt.sign(
    { userId: payload.userId },
    JWT_REFRESH_SECRET,
    {
      expiresIn: '7d',
      issuer: 'ruhafiya-admin',
      audience: 'ruhafiya-app'
    }
  )

  return { accessToken, refreshToken }
}

export function verifyAdminToken(token: string): AdminUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'ruhafiya-admin',
      audience: 'ruhafiya-app'
    }) as TokenPayload
    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role || 'user',
      permissions: decoded.permissions || []
    }
  } catch (error) {
    // Log only in development to avoid token leakage
    if (process.env.NODE_ENV === 'development') {
      console.error('Token verification failed:', error)
    }
    return null
  }
}

export function verifyRefreshToken(token: string): { userId: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET, {
      issuer: 'ruhafiya-admin',
      audience: 'ruhafiya-app'
    }) as { userId: string }
    return decoded
  } catch (error) {
    // Log only in development to avoid token leakage
    if (process.env.NODE_ENV === 'development') {
      console.error('Refresh token verification failed:', error)
    }
    return null
  }
}

// Rate limiting functions
export function checkRateLimit(identifier: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
  const now = Date.now()
  const key = identifier

  const current = rateLimitStore.get(key)

  if (!current || now > current.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (current.count >= maxRequests) {
    return false
  }

  current.count++
  return true
}

export function checkLoginAttempts(identifier: string): { allowed: boolean; lockUntil?: number } {
  const now = Date.now()
  const attempts = loginAttempts.get(identifier)

  if (!attempts) {
    return { allowed: true }
  }

  if (attempts.lockUntil && now < attempts.lockUntil) {
    return { allowed: false, lockUntil: attempts.lockUntil }
  }

  if (attempts.lockUntil && now >= attempts.lockUntil) {
    loginAttempts.delete(identifier)
    return { allowed: true }
  }

  return { allowed: attempts.count < PASSWORD_POLICY.maxAttempts }
}

export function recordFailedLogin(identifier: string): void {
  const now = Date.now()
  const attempts = loginAttempts.get(identifier) || { count: 0, lockUntil: 0 }

  attempts.count++

  if (attempts.count >= PASSWORD_POLICY.maxAttempts) {
    attempts.lockUntil = now + PASSWORD_POLICY.lockoutDuration
  }

  loginAttempts.set(identifier, attempts)
}

export function clearFailedLogins(identifier: string): void {
  loginAttempts.delete(identifier)
}

export function getAdminFromRequest(request: NextRequest): AdminUser | null {
  const token = request.cookies.get('admin-token')?.value
  if (!token) return null

  return verifyAdminToken(token)
}

export function requireAdmin(request: NextRequest): AdminUser {
  const admin = getAdminFromRequest(request)
  if (!admin) {
    throw new Error('Unauthorized')
  }
  return admin
}

// CSRF Protection
export function generateCSRFToken(): string {
  return jwt.sign({ type: 'csrf', timestamp: Date.now() }, JWT_SECRET, { expiresIn: '1h' })
}

export function verifyCSRFToken(token: string): boolean {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { type: string; timestamp: number }
    return decoded.type === 'csrf' && (Date.now() - decoded.timestamp) < 3600000 // 1 hour
  } catch (error) {
    return false
  }
}

// IP-based security
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')

  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || 'unknown'
  }

  if (realIP) {
    return realIP
  }

  return 'unknown'
}

// Session management
export async function createSession(userId: string, userAgent: string, ip: string) {
  const sessionId = jwt.sign({ userId, userAgent, ip, created: Date.now() }, JWT_SECRET)

  // Store session in database
  await supabase
    .from('admin_sessions')
    .insert({
      session_id: sessionId,
      user_id: userId,
      user_agent: userAgent,
      ip_address: ip,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    })

  return sessionId
}

export async function validateSession(sessionId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('admin_sessions')
      .select('*')
      .eq('session_id', sessionId)
      .eq('is_active', true)
      .single()

    if (error || !data) return false

    // Check if session is expired
    if (new Date(data.expires_at) < new Date()) {
      await supabase
        .from('admin_sessions')
        .update({ is_active: false })
        .eq('session_id', sessionId)
      return false
    }

    return true
  } catch (error) {
    return false
  }
}