'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Phone, MessageCircle } from 'lucide-react'

export default function FloatingOrderButton() {
  const [isVisible, setIsVisible] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
        setIsExpanded(false)
      }
    }

    window.addEventListener('scroll', toggleVisibility)
    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [])

  const scrollToOrder = () => {
    const orderSection = document.getElementById('order')
    orderSection?.scrollIntoView({ behavior: 'smooth' })
  }

  const callNow = () => {
    window.open('tel:+8801712345678', '_self')
  }

  const whatsappOrder = () => {
    const message = encodeURIComponent('আমি Ruhafiya ব্যথানাশক তেল অর্ডার করতে চাই।')
    window.open(`https://wa.me/8801712345678?text=${message}`, '_blank')
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed bottom-6 right-6 z-50"
          initial={{ opacity: 0, scale: 0, y: 100 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0, y: 100 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {/* Expanded Menu */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                className="absolute bottom-20 right-0 flex flex-col gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.2 }}
              >
                {/* WhatsApp Button */}
                <motion.button
                  onClick={whatsappOrder}
                  className="group flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-full shadow-lg"
                  whileHover={{ scale: 1.05, x: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm font-medium whitespace-nowrap">WhatsApp অর্ডার</span>
                </motion.button>

                {/* Call Button */}
                <motion.button
                  onClick={callNow}
                  className="group flex items-center gap-3 bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-full shadow-lg"
                  whileHover={{ scale: 1.05, x: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Phone className="w-5 h-5" />
                  <span className="text-sm font-medium whitespace-nowrap">ফোন করুন</span>
                </motion.button>

                {/* Order Form Button */}
                <motion.button
                  onClick={scrollToOrder}
                  className="group flex items-center gap-3 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-3 rounded-full shadow-lg"
                  whileHover={{ scale: 1.05, x: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span className="text-sm font-medium whitespace-nowrap">অর্ডার ফর্ম</span>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Floating Button */}
          <motion.button
            onClick={() => setIsExpanded(!isExpanded)}
            className="group relative bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white p-4 rounded-full shadow-2xl border-2 border-white/20"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            animate={{
              boxShadow: [
                "0 10px 20px -12px rgba(255, 69, 0, 0.4)",
                "0 15px 30px -12px rgba(255, 69, 0, 0.6)",
                "0 10px 20px -12px rgba(255, 69, 0, 0.4)"
              ]
            }}
            transition={{
              boxShadow: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
          >
            <motion.div
              animate={{ 
                rotate: isExpanded ? 45 : 0,
                scale: [1, 1.2, 1]
              }}
              transition={{
                rotate: { duration: 0.3 },
                scale: { duration: 2, repeat: Infinity }
              }}
            >
              <ShoppingCart className="w-6 h-6" />
            </motion.div>

            {/* Pulse Effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 0, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            {/* Notification Badge */}
            <motion.div
              className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center"
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              !
            </motion.div>
          </motion.button>

          {/* Order Text */}
          
        </motion.div>
      )}
    </AnimatePresence>
  )
}
