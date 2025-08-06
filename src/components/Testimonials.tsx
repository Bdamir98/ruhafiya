'use client'

import { useState, useEffect } from 'react'
import { Star, Quote, ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import Image from 'next/image'

interface TestimonialsProps {
  content?: {
    title?: string
    subtitle?: string
    testimonials?: Array<{
      name: string
      location: string
      rating: number
      comment: string
      image?: string
    }>
  }
}

export default function Testimonials({ content }: TestimonialsProps) {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  const defaultTestimonials = [
    {
      name: "মোহাম্মদ রহিম",
      location: "ঢাকা",
      rating: 5,
      comment: "আলহামদুলিল্লাহ! ২০ দিন ব্যবহারের পর আমার কোমর ব্যথা সম্পূর্ণ ভালো হয়ে গেছে। অসাধারণ একটি প্রোডাক্ট।",
      image: "/api/placeholder/80/80"
    },
    {
      name: "ফাতেমা খাতুন",
      location: "চট্টগ্রাম",
      rating: 5,
      comment: "হাঁটু ব্যথার জন্য অনেক ওষুধ খেয়েছি কিন্তু কোনো কাজ হয়নি। Ruhafiya তেল ব্যবহারে মাত্র ১৫ দিনে ব্যথা চলে গেছে।",
      image: "/api/placeholder/80/80"
    },
    {
      name: "আব্দুল করিম",
      location: "সিলেট",
      rating: 5,
      comment: "বাত ব্যথার জন্য অনেক কষ্ট পেয়েছি। এই তেল ব্যবহারের পর এখন সম্পূর্ণ সুস্থ। সবাইকে রেকমেন্ড করি।",
      image: "/api/placeholder/80/80"
    },
    {
      name: "সালমা বেগম",
      location: "রাজশাহী",
      rating: 5,
      comment: "কাঁধের ব্যথার জন্য রাতে ঘুম হতো না। Ruhafiya তেল ব্যবহারের পর এখন আরামে ঘুমাতে পারি। ধন্যবাদ!",
      image: "/api/placeholder/80/80"
    }
  ]

  const defaultContent = {
    title: "আলহামদুলিল্লাহ অনেকেই ব্যাবহার করে উপকৃত হয়েছেন",
    subtitle: "আমাদের সন্তুষ্ট গ্রাহকদের মতামত",
    testimonials: defaultTestimonials
  }

  const testimonialsContent = { ...defaultContent, ...content }

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => 
        (prev + 1) % testimonialsContent.testimonials.length
      )
    }, 5000)

    return () => clearInterval(interval)
  }, [testimonialsContent.testimonials.length])

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => 
      (prev + 1) % testimonialsContent.testimonials.length
    )
  }

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => 
      (prev - 1 + testimonialsContent.testimonials.length) % testimonialsContent.testimonials.length
    )
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: i * 0.1, type: "spring" as const, stiffness: 200 }}
      >
        <Star
          className={`w-5 h-5 ${
            i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
          }`}
        />
      </motion.div>
    ))
  }

  // Animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  }

  const slideVariants: Variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.8,
      rotateY: direction > 0 ? 30 : -30
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
      rotateY: 0
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.8,
      rotateY: direction < 0 ? 30 : -30
    })
  }

  const floatingAnimation = {
    y: [-20, 20, -20],
    rotate: [-5, 5, -5],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut" as const
    }
  }

  const statsVariants: Variants = {
    hidden: { opacity: 0, y: 50, scale: 0.8 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  }

  return (
    <motion.section 
      className="py-20 bg-gradient-to-br from-emerald-600 via-teal-500 to-blue-600 relative overflow-hidden"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={containerVariants}
    >
      {/* Background Elements */}
      <div className="absolute inset-0 bg-black/20"></div>
      <motion.div 
        className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl"
        animate={floatingAnimation}
      />
      <motion.div 
        className="absolute bottom-10 right-10 w-48 h-48 bg-emerald-300/20 rounded-full blur-2xl"
        animate={{
          y: floatingAnimation.y,
          rotate: floatingAnimation.rotate,
          transition: {
            ...floatingAnimation.transition,
            delay: 2
          }
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2 
            className="text-4xl md:text-5xl font-bold text-white mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {testimonialsContent.title}
          </motion.h2>
          <motion.p 
            className="text-xl text-emerald-100 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {testimonialsContent.subtitle}
          </motion.p>
        </motion.div>

        {/* Main Testimonial */}
        <motion.div 
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <motion.div 
            className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 md:p-12 border border-white/20"
            whileHover={{ 
              scale: 1.02,
              boxShadow: "0 30px 60px -12px rgba(0, 0, 0, 0.3)"
            }}
            transition={{ duration: 0.3 }}
          >
            {/* Quote Icon */}
            <motion.div 
              className="absolute -top-6 left-8"
              initial={{ opacity: 0, scale: 0, rotate: -180 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ 
                duration: 0.8, 
                delay: 0.5,
                type: "spring" as const,
                stiffness: 200
              }}
              animate={{
                rotate: [0, 5, -5, 0],
                scale: [1, 1.1, 1],
                transition: {
                  rotate: { duration: 4, repeat: Infinity, ease: "easeInOut" as const },
                  scale: { duration: 2, repeat: Infinity, ease: "easeInOut" as const }
                }
              }}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                <Quote className="w-6 h-6 text-white" />
              </div>
            </motion.div>

            {/* Testimonial Content */}
            <AnimatePresence mode="wait">
              <motion.div 
                key={currentTestimonial}
                className="text-center"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                custom={1}
                transition={{
                  x: { type: "spring" as const, stiffness: 300, damping: 30 },
                  opacity: { duration: 0.4 },
                  scale: { duration: 0.4 },
                  rotateY: { duration: 0.6 }
                }}
              >
                {/* Stars */}
                <motion.div 
                  className="flex justify-center gap-1 mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {renderStars(testimonialsContent.testimonials[currentTestimonial]?.rating || 5)}
                </motion.div>

                {/* Comment */}
                <motion.blockquote 
                  className="text-xl md:text-2xl text-white leading-relaxed mb-8 font-medium"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  "                  &ldquo;{testimonialsContent.testimonials[currentTestimonial]?.comment || 'Great product!'}&rdquo;"
                </motion.blockquote>

                {/* Customer Info */}
                <motion.div 
                  className="flex items-center justify-center gap-4"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  <motion.div 
                    className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center overflow-hidden"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    animate={{
                      boxShadow: [
                        "0 0 0 0 rgba(16, 185, 129, 0.4)",
                        "0 0 0 15px rgba(16, 185, 129, 0)",
                        "0 0 0 0 rgba(16, 185, 129, 0)"
                      ]
                    }}
                    transition={{
                      boxShadow: {
                        duration: 2,
                        repeat: Infinity,
                        delay: 1
                      }
                    }}
                  >
                    {testimonialsContent.testimonials[currentTestimonial]?.image ? (
                      <Image
                        src={testimonialsContent.testimonials[currentTestimonial].image}
                        alt={testimonialsContent.testimonials[currentTestimonial]?.name || 'Customer'}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-bold text-xl">
                        {testimonialsContent.testimonials[currentTestimonial]?.name?.charAt(0) || 'C'}
                      </span>
                    )}
                  </motion.div>
                  <motion.div 
                    className="text-left"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    <h4 className="text-lg font-bold text-white">
                      {testimonialsContent.testimonials[currentTestimonial]?.name || 'Customer'}
                    </h4>
                    <p className="text-emerald-200">
                      {testimonialsContent.testimonials[currentTestimonial]?.location || 'Bangladesh'}
                    </p>
                  </motion.div>
                </motion.div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <motion.button
              onClick={prevTestimonial}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-3 transition-all duration-300"
              whileHover={{ scale: 1.1, x: -5 }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 }}
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </motion.button>
            
            <motion.button
              onClick={nextTestimonial}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-3 transition-all duration-300"
              whileHover={{ scale: 1.1, x: 5 }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 }}
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </motion.button>
          </motion.div>

          {/* Testimonial Indicators */}
          <motion.div 
            className="flex justify-center mt-8 gap-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            {testimonialsContent.testimonials.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentTestimonial 
                    ? 'bg-white' 
                    : 'bg-white/40 hover:bg-white/60'
                }`}
                whileHover={{ scale: 1.3 }}
                whileTap={{ scale: 0.9 }}
                animate={{
                  scale: index === currentTestimonial ? 1.25 : 1,
                  boxShadow: index === currentTestimonial 
                    ? "0 0 0 3px rgba(255, 255, 255, 0.3)" 
                    : "0 0 0 0px rgba(255, 255, 255, 0)"
                }}
              />
            ))}
          </motion.div>
        </motion.div>

        {/* Order Button */}
        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <motion.button
            onClick={() => document.getElementById('order-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold text-xl px-12 py-4 rounded-2xl shadow-2xl border-2 border-white/20 mb-12"
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
            }}
            whileTap={{ scale: 0.95 }}
          >
            অর্ডার করুন
          </motion.button>
        </motion.div>

        {/* Bottom Stats */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8 max-w-4xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {[
            { number: "৭,০০০+", label: "সন্তুষ্ট গ্রাহক" },
            { number: "৯৮%", label: "সফলতার হার" },
            { number: "৪.৯/৫", label: "গড় রেটিং" }
          ].map((stat, index) => (
            <motion.div 
              key={index}
              className="text-center"
              variants={statsVariants}
              whileHover={{ 
                scale: 1.05,
                y: -5
              }}
              transition={{ duration: 0.3 }}
            >
              <motion.div 
                className="text-4xl font-bold text-white mb-2"
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ 
                  delay: 0.5 + index * 0.2,
                  type: "spring" as const,
                  stiffness: 200
                }}
                animate={{
                  textShadow: [
                    "0 0 0px rgba(255, 255, 255, 0.5)",
                    "0 0 20px rgba(255, 255, 255, 0.8)",
                    "0 0 0px rgba(255, 255, 255, 0.5)"
                  ],
                  transition: {
                    textShadow: {
                      duration: 3,
                      repeat: Infinity,
                      delay: index * 0.5
                    }
                  }
                }}
              >
                {stat.number}
              </motion.div>
              <motion.div 
                className="text-emerald-200"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.7 + index * 0.2 }}
              >
                {stat.label}
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        
      </div>
    </motion.section>
  )
}