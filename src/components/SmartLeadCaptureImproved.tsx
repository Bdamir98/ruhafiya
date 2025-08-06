'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Gift, Phone, Mail, MapPin, Clock, Star, User, AlertCircle, CheckCircle } from 'lucide-react'
import { leadCaptureSchema, validateAndSanitize } from '@/lib/validation'
import { ButtonLoading } from '@/components/ui/Loading'

interface UserInfo {
  ip?: string
  country?: string
  city?: string
  timezone?: string
  device?: string
  browser?: string
  referrer?: string
  visitTime?: string
}

interface SmartLeadCaptureProps {
  onCapture?: (data: any) => void
}

export default function SmartLeadCapture({ onCapture }: SmartLeadCaptureProps) {
  const [showPopup, setShowPopup] = useState(false)
  const [userInfo, setUserInfo] = useState<UserInfo>({})
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    interest: 'general' as const
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // Focus first input when popup opens
  useEffect(() => {
    if (showPopup) {
      const timer = setTimeout(() => {
        const input = document.getElementById('name-input') as HTMLInputElement
        if (input) {
          input.focus()
        }
      }, 300)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [showPopup])

  // Detect user information
  useEffect(() => {
    const detectUserInfo = async () => {
      try {
        // Get basic device/browser info
        const deviceInfo = {
          device: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'Mobile' : 'Desktop',
          browser: navigator.userAgent.includes('Chrome') ? 'Chrome' : 
                   navigator.userAgent.includes('Firefox') ? 'Firefox' : 
                   navigator.userAgent.includes('Safari') ? 'Safari' : 'Other',
          referrer: document.referrer || 'Direct',
          visitTime: new Date().toLocaleString('bn-BD'),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }

        // Try to get IP and location (using a free service)
        try {
          const response = await fetch('https://ipapi.co/json/')
          if (response.ok) {
            const locationData = await response.json()
            setUserInfo({
              ...deviceInfo,
              ip: locationData.ip,
              country: locationData.country_name,
              city: locationData.city
            })
          } else {
            setUserInfo(deviceInfo)
          }
        } catch (error) {
          setUserInfo(deviceInfo)
        }
      } catch (error) {
        console.error('Error detecting user info:', error)
      }
    }

    detectUserInfo()

    // Show popup after 30 seconds or on scroll
    const timer = setTimeout(() => setShowPopup(true), 30000)
    
    const handleScroll = () => {
      if (window.scrollY > 500) {
        setShowPopup(true)
        window.removeEventListener('scroll', handleScroll)
      }
    }

    window.addEventListener('scroll', handleScroll)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // Real-time validation
  const validateField = (name: string, value: string) => {
    const tempData = { ...formData, [name]: value }
    const validation = validateAndSanitize(leadCaptureSchema, tempData)
    
    if (!validation.success) {
      const fieldError = validation.errors.find(error => 
        error.toLowerCase().includes(name === 'name' ? 'নাম' : name === 'phone' ? 'ফ���ন' : 'ইমেইল')
      )
      if (fieldError) {
        setFieldErrors(prev => ({ ...prev, [name]: fieldError }))
      }
    } else {
      setFieldErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear errors when user starts typing
    if (submitAttempted) {
      validateField(name, value)
    }
  }

  const handleSubmit = async () => {
    setSubmitAttempted(true)
    setErrors([])
    
    // Validate form data
    const validation = validateAndSanitize(leadCaptureSchema, formData)
    
    if (!validation.success) {
      setErrors(validation.errors)
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const leadData = {
        ...validation.data,
        userInfo,
        capturedAt: new Date().toISOString(),
        source: 'landing_page_popup'
      }

      // Save to your database or CRM
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest' // Simple CSRF protection
        },
        body: JSON.stringify(leadData)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'সার্ভার ত্রুটি')
      }

      onCapture?.(leadData)
      setShowPopup(false)
      
      // Show success message
      alert('ধন্যবাদ! আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।')
    } catch (error) {
      console.error('Error submitting lead:', error)
      const errorMessage = error instanceof Error ? error.message : 'দুঃখিত, একটি সমস্যা হয়েছে। আবার চেষ্টা করুন।'
      setErrors([errorMessage])
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!showPopup) {
    return null
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => e.target === e.currentTarget && setShowPopup(false)}
      >
        <motion.div
          className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto"
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          role="dialog"
          aria-labelledby="popup-title"
          aria-describedby="popup-description"
        >
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-blue-500/10"></div>
          
          {/* Close Button */}
          <button
            onClick={() => setShowPopup(false)}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
            aria-label="পপআপ বন্ধ করুন"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>

          {/* Header */}
          <div className="text-center mb-6 relative z-10">
            <h2 id="popup-title" className="text-3xl font-bold text-gray-800 mb-2">
              🎁 বিশেষ অফার পেতে চান?
            </h2>
            <p id="popup-description" className="text-gray-600">
              আপনার তথ্য দিয়ে বিশেষ ছাড় পান
            </p>
          </div>

          {/* Error Messages */}
          {errors.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl relative z-10"
            >
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">সমস্যা হয়েছে:</span>
              </div>
              <ul className="mt-2 text-sm text-red-600 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* User Info Display */}
          {userInfo.city && (
            <motion.div
              className="mb-6 p-4 bg-emerald-50 rounded-2xl border border-emerald-200 relative z-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-2 text-emerald-700 mb-2">
                <MapPin className="w-4 h-4" />
                <span className="text-sm font-medium">আমরা দেখতে পাচ্ছি আপনি {userInfo.city}, {userInfo.country} থেকে ভিজিট করছেন</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-600">
                <Clock className="w-4 h-4" />
                <span className="text-sm">ভিজিট টাইম: {userInfo.visitTime}</span>
              </div>
            </motion.div>
          )}

          {/* Form Fields */}
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4 mb-6 relative z-10">
            {/* Name Field */}
            <div>
              <label htmlFor="name-input" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4" />
                আপনার নাম *
              </label>
              <input
                id="name-input"
                type="text"
                placeholder="আপনার নাম লিখুন"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-lg transition-all ${
                  fieldErrors.name ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-emerald-500'
                }`}
                style={{
                  fontSize: '16px',
                  backgroundColor: '#ffffff',
                  color: '#1f2937'
                }}
                required
                aria-describedby={fieldErrors.name ? 'name-error' : undefined}
              />
              {fieldErrors.name && (
                <p id="name-error" className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {fieldErrors.name}
                </p>
              )}
            </div>

            {/* Phone Field */}
            <div>
              <label htmlFor="phone-input" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4" />
                ফোন নম্বর *
              </label>
              <input
                id="phone-input"
                type="tel"
                placeholder="01XXXXXXXXX"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-lg transition-all ${
                  fieldErrors.phone ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-emerald-500'
                }`}
                style={{
                  fontSize: '16px',
                  backgroundColor: '#ffffff',
                  color: '#1f2937'
                }}
                required
                aria-describedby={fieldErrors.phone ? 'phone-error' : undefined}
              />
              {fieldErrors.phone && (
                <p id="phone-error" className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {fieldErrors.phone}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email-input" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4" />
                ইমেইল (ঐচ্ছিক)
              </label>
              <input
                id="email-input"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-lg transition-all ${
                  fieldErrors.email ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-emerald-500'
                }`}
                style={{
                  fontSize: '16px',
                  backgroundColor: '#ffffff',
                  color: '#1f2937'
                }}
                aria-describedby={fieldErrors.email ? 'email-error' : undefined}
              />
              {fieldErrors.email && (
                <p id="email-error" className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {fieldErrors.email}
                </p>
              )}
            </div>
          </form>

          {/* Special Offers */}
          <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl border border-orange-200 relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="w-5 h-5 text-orange-600" />
              <span className="font-bold text-orange-800">বিশেষ অফার!</span>
            </div>
            <ul className="text-sm text-orange-700 space-y-1">
              <li>• ৩০% পর্যন্ত ছাড়</li>
              <li>• ফ্রি হোম ডেলিভারি</li>
              <li>• ফ্রি কনসালটেশন</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 relative z-10">
            <button
              type="button"
              onClick={() => setShowPopup(false)}
              className="flex-1 py-3 px-6 border border-gray-300 rounded-2xl text-gray-600 hover:bg-gray-50 transition-colors"
            >
              পরে করব
            </button>
            
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.name.trim() || !formData.phone.trim()}
              className="flex-1 py-3 px-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl hover:from-emerald-600 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isSubmitting ? <ButtonLoading text="অপেক্ষা করুন..." /> : 'অফার পেতে চাই'}
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-500 relative z-10">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span>৪.৯/৫ রেটিং</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>৭০,০০০+ গ্রাহক</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}