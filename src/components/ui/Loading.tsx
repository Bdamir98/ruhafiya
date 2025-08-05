'use client'

import { motion } from 'framer-motion'
import { Loader2, Package, Heart } from 'lucide-react'

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton'
  text?: string
  fullScreen?: boolean
  className?: string
}

export default function Loading({ 
  size = 'md', 
  variant = 'spinner', 
  text, 
  fullScreen = false,
  className = ''
}: LoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  }

  const containerClass = fullScreen 
    ? 'fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center'
    : `flex items-center justify-center ${className}`

  const renderSpinner = () => (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className={`${sizeClasses[size]} text-emerald-500`}
    >
      <Loader2 className="w-full h-full" />
    </motion.div>
  )

  const renderDots = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.2
          }}
          className={`bg-emerald-500 rounded-full ${
            size === 'sm' ? 'w-2 h-2' :
            size === 'md' ? 'w-3 h-3' :
            size === 'lg' ? 'w-4 h-4' : 'w-5 h-5'
          }`}
        />
      ))}
    </div>
  )

  const renderPulse = () => (
    <motion.div
      animate={{
        scale: [1, 1.1, 1],
        opacity: [0.7, 1, 0.7]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
      className={`${sizeClasses[size]} text-emerald-500`}
    >
      <Heart className="w-full h-full fill-current" />
    </motion.div>
  )

  const renderSkeleton = () => (
    <div className="animate-pulse space-y-3">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
    </div>
  )

  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return renderDots()
      case 'pulse':
        return renderPulse()
      case 'skeleton':
        return renderSkeleton()
      default:
        return renderSpinner()
    }
  }

  return (
    <div className={containerClass}>
      <div className="flex flex-col items-center space-y-3">
        {renderLoader()}
        {text && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`text-gray-600 font-medium ${textSizeClasses[size]}`}
          >
            {text}
          </motion.p>
        )}
      </div>
    </div>
  )
}

// Specialized loading components
export function PageLoading() {
  return (
    <Loading
      size="lg"
      text="পেজ লোড হচ্ছে..."
      fullScreen
      variant="pulse"
    />
  )
}

export function ButtonLoading({ text = 'অপেক্ষা করুন...' }: { text?: string }) {
  return (
    <div className="flex items-center space-x-2">
      <Loading size="sm" variant="spinner" />
      <span>{text}</span>
    </div>
  )
}

export function FormLoading() {
  return (
    <div className="space-y-4">
      <Loading variant="skeleton" />
    </div>
  )
}

export function DataLoading({ text = 'ডেটা লোড হচ্ছে...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loading size="lg" variant="dots" />
      <p className="mt-4 text-gray-600">{text}</p>
    </div>
  )
}

// Loading overlay for forms
export function LoadingOverlay({ isLoading, children }: { 
  isLoading: boolean
  children: React.ReactNode 
}) {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center rounded-lg">
          <Loading size="md" text="প্রক্রিয়াকরণ হচ্ছে..." />
        </div>
      )}
    </div>
  )
}