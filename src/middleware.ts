import { NextRequest, NextResponse } from 'next/server'
import { RateLimiter } from '@/lib/validation'
import { getAdminFromRequest, generateCSRFToken, verifyCSRFToken, getClientIP } from '@/lib/auth'

// Create rate limiters for different endpoints
const apiRateLimiter = new RateLimiter(10, 60000) // 10 requests per minute
const leadRateLimiter = new RateLimiter(3, 300000) // 3 requests per 5 minutes
const adminRateLimiter = new RateLimiter(50, 60000) // 50 requests per minute for admin
const loginRateLimiter = new RateLimiter(5, 300000) // 5 login attempts per 5 minutes

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const clientIP = getClientIP(request)
  const userAgent = request.headers.get('user-agent') || 'unknown'

  // Admin route protection (before API routes)
  if (pathname.startsWith('/admin') && !pathname.includes('/admin/login')) {
    const admin = getAdminFromRequest(request)

    if (!admin) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  // Apply rate limiting to API routes
  if (pathname.startsWith('/api/')) {
    // Special rate limiting for login attempts
    if (pathname.includes('/auth/login')) {
      if (!loginRateLimiter.isAllowed(clientIP)) {
        return NextResponse.json(
          {
            error: 'অনেক বেশি লগইন চেষ্টা। ৫ মিনিট পর আবার চেষ্টা করুন।',
            retryAfter: 300
          },
          { status: 429 }
        )
      }
    }
    // Special rate limiting for lead capture
    else if (pathname === '/api/leads') {
      if (!leadRateLimiter.isAllowed(clientIP)) {
        return NextResponse.json(
          {
            error: 'অনেক বেশি অনুরোধ। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।',
            retryAfter: 300
          },
          { status: 429 }
        )
      }
    }
    // Admin API rate limiting
    else if (pathname.startsWith('/api/admin/')) {
      if (!adminRateLimiter.isAllowed(clientIP)) {
        return NextResponse.json(
          {
            error: 'অনেক বেশি অনুরোধ। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।',
            retryAfter: 60
          },
          { status: 429 }
        )
      }
    } else {
      // General API rate limiting
      if (!apiRateLimiter.isAllowed(clientIP)) {
        return NextResponse.json(
          {
            error: 'অনেক বেশি অনুরোধ। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।',
            retryAfter: 60
          },
          { status: 429 }
        )
      }
    }

    // Enhanced CSRF protection for state-changing operations
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
      // Skip CSRF for public endpoints and auth
      if (!pathname.includes('/api/leads') &&
          !pathname.includes('/api/orders') &&
          !pathname.includes('/api/auth/login')) {

        const csrfToken = request.headers.get('X-CSRF-Token') ||
                         request.cookies.get('csrf-token')?.value

        if (!csrfToken || !verifyCSRFToken(csrfToken)) {
          return NextResponse.json(
            {
              error: 'CSRF token missing or invalid',
              message: 'অবৈধ অনুরোধ - নিরাপত্তার কারণে ব্লক করা হয়েছে'
            },
            { status: 403 }
          )
        }
      }
    }
  }

  // Create response with enhanced security headers
  const response = NextResponse.next()

  // Enhanced security headers
  const securityHeaders = {
    'X-DNS-Prefetch-Control': 'on',
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    'X-XSS-Protection': '1; mode=block',
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
    'X-Permitted-Cross-Domain-Policies': 'none'
  }

  // Add all security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  // Enhanced CSP header
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://ipapi.co https://www.googletagmanager.com https://www.google-analytics.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com;
    img-src 'self' data: https: blob:;
    connect-src 'self' https://ipapi.co https://*.supabase.co https://www.google-analytics.com;
    frame-ancestors 'none';
    base-uri 'self';
    form-action 'self';
  `.replace(/\s{2,}/g, ' ').trim()

  response.headers.set('Content-Security-Policy', cspHeader)

  // Generate CSRF token for admin pages
  if (request.method === 'GET' && pathname.startsWith('/admin') && !pathname.includes('/api/')) {
    const csrfToken = generateCSRFToken()
    response.cookies.set('csrf-token', csrfToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600 // 1 hour
    })
  }

  // Log security events for admin routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin/')) {
    console.log(`[SECURITY] ${request.method} ${pathname} - IP: ${clientIP} - UA: ${userAgent.substring(0, 100)}`)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}