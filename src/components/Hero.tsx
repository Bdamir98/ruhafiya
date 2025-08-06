'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import { ArrowDown, Star, Users, Award, ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react'

interface HeroSlide {
  id: number
  slide_order: number
  title: string
  subtitle: string
  description: string
  highlight: string
  background_image?: string
  gradient_colors: string
  is_active: boolean
}

interface HeroProps {
  content?: {
    customerCount?: string
    buttonText?: string
  }
}

export default function Hero({ content }: HeroProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [slides, setSlides] = useState<HeroSlide[]>([])
  const [loading, setLoading] = useState(true)

  const defaultContent = {
    customerCount: "7000+",
    buttonText: "অর্ডার করুন"
  }

  const heroContent = { ...defaultContent, ...content }

  // Fetch slides from database
  useEffect(() => {
    fetchSlides()
  }, [])

  const fetchSlides = async () => {
    try {
      const response = await fetch('/api/hero-slides')
      const data = await response.json()
      
      if (data.success && data.slides.length > 0) {
        setSlides(data.slides)
      } else {
        // Fallback to default slides if no data
        setSlides([
          {
            id: 1,
            slide_order: 1,
            title: "Ruhafiya",
            subtitle: "প্রাকৃতিক ব্যথা নিরাময়ের তেল",
            description: "১৫-২০ দিন নিয়মিত ব্যবহার করলে হাটু ব্যথা, কাধ ব্যথা, বাত ব্যথা, কোমর ব্যথা সহ সকল ব্যথা দূর হবে ইনশাল্লাহ",
            highlight: "BCSIR কর্তৃক পরীক্ষিত",
            gradient_colors: "from-emerald-600 via-teal-500 to-blue-600",
            is_active: true
          },
          {
            id: 2,
            slide_order: 2,
            title: "দ্রুত ব্যথা নিরাময়",
            subtitle: "মাত্র ১৫ দিনে ফলাফল",
            description: "প্রাকৃতিক উপাদানে তৈরি Ruhafiya তেল ব্যবহারে দ্রুত ব্যথা থেকে মুক্তি পান। হাজারো গ্রাহকের বিশ্বস্ত পছন্দ।",
            highlight: "১০০% প্রাকৃতিক উপাদান",
            gradient_colors: "from-purple-600 via-pink-500 to-red-500",
            is_active: true
          },
          {
            id: 3,
            slide_order: 3,
            title: "বিশেষ ছাড়ে",
            subtitle: "সীমিত সময়ের অফার",
            description: "এখনই অর্ডার করুন এবং পান বিশেষ ছাড়! ফ্রি হোম ডেলিভারি সহ। আর দেরি না করে আজই নিয়ে নিন আপনার ব্যথার সমাধান।",
            highlight: "৩০% পর্যন্ত ছাড়",
            gradient_colors: "from-orange-600 via-red-500 to-pink-600",
            is_active: true
          }
        ])
      }
    } catch (error) {
      console.error('Error fetching slides:', error)
      // Use fallback slides on error
      setSlides([
        {
          id: 1,
          slide_order: 1,
          title: "Ruhafiya",
          subtitle: "প্রাকৃতিক ব্যথা নিরাময়ের তেল",
          description: "১৫-২০ দিন নিয়মিত ব্যবহার করলে হাটু ব্যথা, কাধ ব্যথা, বাত ব্যথা, কোমর ব্যথা সহ সকল ব্যথা দূর হবে ইনশাল্লাহ",
          highlight: "BCSIR কর্তৃক পরীক্ষিত",
          gradient_colors: "from-emerald-600 via-teal-500 to-blue-600",
          is_active: true
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const currentSlideData = slides[currentSlide]

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || slides.length === 0) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 8000) // Change slide every 8 seconds

    return () => clearInterval(interval)
  }, [isAutoPlaying, slides.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  const scrollToOrder = () => {
    document.getElementById('order-section')?.scrollIntoView({ behavior: 'smooth' })
  }

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying)
  }

  // Animation variants with smoother transitions
  const slideVariants: Variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95,
      filter: "blur(4px)"
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
      filter: "blur(0px)"
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95,
      filter: "blur(4px)"
    })
  }

  const contentVariants: Variants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.98,
      filter: "blur(2px)"
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        duration: 1.2,
        ease: [0.25, 0.46, 0.45, 0.94],
        staggerChildren: 0.15
      }
    }
  }

  const itemVariants: Variants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.98
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: { 
        duration: 0.8, 
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  }

  // Animation for floating elements
  const floatingAnimation = {
    y: [-20, 20, -20],
    rotate: [0, 5, -5, 0],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut" as const
    }
  }

  if (loading) {
    return (
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-500 to-blue-600">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl">Loading...</p>
        </div>
      </section>
    )
  }

  if (!currentSlideData) {
    return null
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <motion.div 
        key={currentSlide}
        className={`absolute inset-0 bg-gradient-to-br ${currentSlideData.gradient_colors}`}
        initial={{ opacity: 0, scale: 1.05, filter: "blur(8px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={{ 
          duration: 1.8, 
          ease: [0.25, 0.46, 0.45, 0.94],
          opacity: { duration: 1.2 },
          scale: { duration: 1.8 },
          filter: { duration: 1.0 }
        }}
      />
      
      {/* Background Image Overlay */}
      {currentSlideData.background_image && (
        <motion.div
          key={`bg-${currentSlide}`}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${currentSlideData.background_image})` }}
          initial={{ opacity: 0, scale: 1.05, filter: "blur(8px)" }}
          animate={{ opacity: 0.4, scale: 1, filter: "blur(0px)" }}
          transition={{ 
            duration: 2.0, 
            ease: [0.25, 0.46, 0.45, 0.94],
            opacity: { duration: 1.5 },
            scale: { duration: 2.0 },
            filter: { duration: 1.2 }
          }}
        />
      )}
      
      <div className="absolute inset-0 bg-black/30"></div>
      
      {/* Floating Animation Elements */}
      <motion.div 
        className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl"
        animate={floatingAnimation}
      />
      <motion.div 
        className="absolute bottom-20 right-10 w-48 h-48 bg-white/20 rounded-full blur-2xl"
        animate={{
          ...floatingAnimation,
          transition: { ...floatingAnimation.transition, delay: 1 }
        }}
      />
      <motion.div 
        className="absolute top-1/2 left-1/4 w-24 h-24 bg-white/15 rounded-full blur-lg"
        animate={{
          ...floatingAnimation,
          transition: { ...floatingAnimation.transition, delay: 2 }
        }}
      />

      {/* Slider Navigation - Hidden */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-4 hidden">
        {/* Auto-play toggle */}
        <motion.button
          onClick={toggleAutoPlay}
          className="p-3 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 text-white hover:bg-white/30 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {isAutoPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </motion.button>

        {/* Previous/Next buttons */}
        <motion.button
          onClick={prevSlide}
          className="p-3 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 text-white hover:bg-white/30 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ChevronLeft className="w-5 h-5" />
        </motion.button>
        
        <motion.button
          onClick={nextSlide}
          className="p-3 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 text-white hover:bg-white/30 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Main Content Slider */}
      <div className="relative z-10 container mx-auto px-4 text-center text-white">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { 
                type: "spring", 
                stiffness: 200, 
                damping: 25,
                mass: 0.8
              },
              opacity: { 
                duration: 1.0,
                ease: [0.25, 0.46, 0.45, 0.94]
              },
              scale: { 
                duration: 1.0,
                ease: [0.25, 0.46, 0.45, 0.94]
              },
              filter: {
                duration: 0.8,
                ease: [0.25, 0.46, 0.45, 0.94]
              }
            }}
            className="max-w-4xl mx-auto"
          >
            <motion.div
              variants={contentVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Badge - Hidden */}
              {/* <motion.div
                variants={itemVariants}
                className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-6 py-2 mb-8 border border-white/30"
              >
                <Award className="w-5 h-5 text-yellow-300" />
                <span className="text-sm font-medium">{currentSlideData.highlight}</span>
              </motion.div> */}

              {/* Main Title */}
              <motion.h1
                variants={itemVariants}
                className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-white via-emerald-100 to-blue-100 bg-clip-text text-transparent bengali-text"
                style={{ lineHeight: '1.2', paddingTop: '0.5rem', paddingBottom: '0.5rem' }}
              >
                {currentSlideData.title}
              </motion.h1>

              {/* Subtitle */}
              <motion.h2
                variants={itemVariants}
                className="text-2xl md:text-3xl font-semibold mb-8 text-emerald-100 bengali-text"
                style={{ lineHeight: '1.4', paddingTop: '0.25rem', paddingBottom: '0.25rem' }}
              >
                {currentSlideData.subtitle}
              </motion.h2>

              {/* Description */}
              <motion.p
                variants={itemVariants}
                className="text-lg md:text-xl mb-12 max-w-3xl mx-auto text-white/90 bengali-text"
                style={{ lineHeight: '1.8', paddingTop: '0.25rem', paddingBottom: '0.25rem' }}
              >
                {currentSlideData.description}
              </motion.p>

              {/* Stats */}
              <motion.div 
                variants={itemVariants}
                className="flex flex-wrap justify-center gap-8 mb-12"
              >
                <motion.div 
                  className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/20"
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Users className="w-8 h-8 text-emerald-300" />
                  <div className="text-left">
                    <div className="text-2xl font-bold price-text">{heroContent.customerCount}</div>
                    <div className="text-sm text-white/80 bengali-text" style={{ lineHeight: '1.6' }}>সন্তুষ্ট গ্রাহক</div>
                  </div>
                </motion.div>

                <motion.div
                  className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/20"
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Star className="w-8 h-8 text-yellow-300" />
                  <div className="text-left">
                    <div className="text-2xl font-bold price-text">৪.৯/৫</div>
                    <div className="text-sm text-white/80 bengali-text" style={{ lineHeight: '1.6' }}>গ্রাহক রেটিং</div>
                  </div>
                </motion.div>
              </motion.div>

              {/* CTA Button */}
              <motion.button
                variants={itemVariants}
                onClick={scrollToOrder}
                className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold text-xl rounded-2xl shadow-2xl border-2 border-white/20 bengali-text"
                style={{ padding: '1.5rem 3rem', lineHeight: '1.4' }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <span className="bengali-text" style={{ lineHeight: '1.4' }}>{heroContent.buttonText}</span>
                <motion.div
                  animate={{ y: [0, 5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <ArrowDown className="w-6 h-6" />
                </motion.div>
                
                {/* Button Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300 -z-10"></div>
              </motion.button>

              {/* Trust Indicators */}
              <motion.div 
                variants={itemVariants}
                className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-white/70"
              >
                {["১০০% প্রাকৃতিক", "পার্শ্বপ্রতিক্রিয়া মুক্ত", "ফ্রি হোম ডেলিভারি"].map((text, index) => (
                  <motion.div
                    key={text}
                    className="flex items-center gap-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 + index * 0.2 }}
                  >
                    <motion.div
                      className="w-2 h-2 bg-green-400 rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                    />
                    <span className="bengali-text" style={{ lineHeight: '1.6' }}>{text}</span>
                  </motion.div>
                ))}
              </motion.div>


            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex items-center gap-3">
          {slides.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-white scale-125' 
                  : 'bg-white/40 hover:bg-white/60'
              }`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <ArrowDown className="w-8 h-8 text-white/60" />
      </motion.div>
    </section>
  )
}