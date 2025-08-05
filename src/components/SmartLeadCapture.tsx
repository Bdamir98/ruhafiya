'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Gift, Phone, Mail, MapPin, Clock, Star, User, AlertCircle } from 'lucide-react'
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
    interest: 'general'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [submitAttempted, setSubmitAttempted] = useState(false)

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
          const locationData = await response.json()
          
          setUserInfo({
            ...deviceInfo,
            ip: locationData.ip,
            country: locationData.country_name,
            city: locationData.city
          })
        } catch (error) {
          setUserInfo(deviceInfo)
        }
      } catch (error) {
        console.error('Error detecting user info:', error)
      }
    }

    detectUserInfo()

    // Show popup after 5 seconds or on scroll (reduced for testing)
    const timer = setTimeout(() => setShowPopup(true), 5000)
    
    const handleScroll = () => {
      if (window.scrollY > 300) {
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

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    try {
      const leadData = {
        ...formData,
        userInfo,
        capturedAt: new Date().toISOString(),
        source: 'landing_page_popup'
      }

      // Save to your database or CRM
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData)
      })

      if (response.ok) {
        onCapture?.(leadData)
        setShowPopup(false)
        
        // Show success message
        alert('ধন্যবাদ! আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।')
      }
    } catch (error) {
      console.error('Error submitting lead:', error)
      alert('দুঃখিত, ���কটি সমস্যা হয়েছে। আবার চেষ্টা করুন।')
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
      >
        <motion.div
          className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto"
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
        >
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-blue-500/10"></div>
          
          {/* Close Button */}
          <button
            onClick={() => setShowPopup(false)}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>

          {/* Header */}
          <div className="text-center mb-6 relative z-10">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              🎁 বিশেষ অফার পেতে চান?
            </h2>
            <p className="text-gray-600">
              আপনার তথ্য দিয়ে বিশেষ ছাড় পান
            </p>
          </div>

          {/* User Info Display */}
          {userInfo.city && (
            <motion.div
              className="mb-6 p-4 bg-emerald-50 rounded-2xl border border-emerald-200 relative z-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-2 text-emerald-700 mb-2">
                <MapPin className="w-4 h-4" />
                <span className="text-sm font-medium">আমরা দেখতে পাচ্ছি আপনি {userInfo.city}, {userInfo.country} থে���ে ভিজিট করছেন</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-600">
                <Clock className="w-4 h-4" />
                <span className="text-sm">ভিজিট টাইম: {userInfo.visitTime}</span>
              </div>
            </motion.div>
          )}

          {/* Single Form - All Fields */}
          <div className="space-y-4 mb-6 relative z-10">
            {/* Name Field */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4" />
                আপনার নাম *
              </label>
              <input
                id="name-input"
                type="text"
                placeholder="আপনার নাম লিখুন"
                value={formData.name}
                onChange={(e) => {
                  console.log('Name typing:', e.target.value)
                  setFormData(prev => ({ ...prev, name: e.target.value }))
                }}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-lg transition-all"
                style={{
                  fontSize: '16px',
                  backgroundColor: '#ffffff',
                  color: '#1f2937'
                }}
              />
            </div>

            {/* Phone Field */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4" />
                ফোন নম্বর *
              </label>
              <input
                type="tel"
                placeholder="01XXXXXXXXX"
                value={formData.phone}
                onChange={(e) => {
                  console.log('Phone typing:', e.target.value)
                  setFormData(prev => ({ ...prev, phone: e.target.value }))
                }}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-lg transition-all"
                style={{
                  fontSize: '16px',
                  backgroundColor: '#ffffff',
                  color: '#1f2937'
                }}
              />
            </div>

            {/* Email Field */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4" />
                ইমেইল (ঐচ্ছিক)
              </label>
              <input
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => {
                  console.log('Email typing:', e.target.value)
                  setFormData(prev => ({ ...prev, email: e.target.value }))
                }}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-lg transition-all"
                style={{
                  fontSize: '16px',
                  backgroundColor: '#ffffff',
                  color: '#1f2937'
                }}
              />
            </div>
          </div>

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

          {/* Debug Display */}
          <div className="mb-6 p-3 bg-gray-50 rounded-lg text-sm relative z-10">
            <strong>Form Data:</strong><br />
            Name: "{formData.name}"<br />
            Phone: "{formData.phone}"<br />
            Email: "{formData.email}"
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 relative z-10">
            <button
              onClick={() => setShowPopup(false)}
              className="flex-1 py-3 px-6 border border-gray-300 rounded-2xl text-gray-600 hover:bg-gray-50 transition-colors"
            >
              পরে করব
            </button>
            
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.name || !formData.phone}
              className="flex-1 py-3 px-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl hover:from-emerald-600 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isSubmitting ? 'অপেক্ষা করুন...' : 'অফার পেতে চাই'}
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-500 relative z-10">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span>৪.৯/৫ রেটিং</span>
            </div>
            <div className="flex items-center gap-1">
              <Phone className="w-4 h-4 text-emerald-500" />
              <span>৭০,০০০+ গ্রাহক</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}