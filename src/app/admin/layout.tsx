'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkAuth = async () => {
      // Skip auth check for login page
      if (pathname === '/admin/login') {
        setIsAuthenticated(true)
        return
      }

      try {
        const response = await fetch('/api/auth/verify', {
          method: 'GET',
          credentials: 'include',
        })

        if (response.ok) {
          setIsAuthenticated(true)
        } else {
          setIsAuthenticated(false)
          router.push('/admin/login')
        }
      } catch (error) {
        setIsAuthenticated(false)
        router.push('/admin/login')
      }
    }

    checkAuth()
  }, [pathname, router])

  // Show loading while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl">লোড হচ্ছে...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}