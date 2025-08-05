'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Award, Leaf, Shield, ShoppingBag } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ProductGalleryProps {
  content?: {
    title?: string
    subtitle?: string
    images?: string[]
    features?: string[]
  }
}

export default function ProductGallery({ content }: ProductGalleryProps) {
  const [currentImage, setCurrentImage] = useState(0)

  const defaultContent = {
    title: "রুহাফিয়া প্রোডাক্ট গ্যালারি",
    subtitle: "প্রাকৃতিক উপাদানে তৈরি, সম্পূর্ণ নিরাপদ",
    images: [
      "/api/placeholder/400/500",
      "/api/placeholder/400/500", 
      "/api/placeholder/400/500",
      "/api/placeholder/400/500"
    ],
    features: [
      "১০০% প্রাকৃতিক উপাদান",
      "BCSIR কর্তৃক পরীক্ষিত",
      "পার্শ্বপ্রতিক্রিয়া মুক্ত",
      "হোমমেড প্রোডাক্ট"
    ]
  }

  const galleryContent = { ...defaultContent, ...content }

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % galleryContent.images.length)
  }

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + galleryContent.images.length) % galleryContent.images.length)
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  }

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.8,
      rotateY: direction > 0 ? 45 : -45
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
      rotateY: direction < 0 ? 45 : -45
    })
  }

  const featureVariants = {
    hidden: { opacity: 0, x: -50, scale: 0.9 },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94] as const
      }
    }
  }

  const floatingAnimation = {
    y: [-15, 15, -15],
    rotate: [-3, 3, -3],
    transition: {
      duration: 5,
      repeat: Infinity,
      ease: "easeInOut" as const
    }
  }

  return (
    <motion.section 
      className="py-20 bg-gradient-to-br from-gray-50 to-emerald-50 relative overflow-hidden"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={containerVariants}
    >
      {/* Floating Background Elements */}
      <motion.div 
        className="absolute top-10 right-10 w-40 h-40 bg-emerald-200/20 rounded-full blur-xl"
        animate={floatingAnimation}
      />
      <motion.div 
        className="absolute bottom-10 left-10 w-60 h-60 bg-blue-200/20 rounded-full blur-2xl"
        animate={{
          y: floatingAnimation.y,
          rotate: floatingAnimation.rotate,
          transition: {
            ...floatingAnimation.transition,
            delay: 2
          }
        }}
      />

      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2 
            className="text-4xl md:text-5xl font-bold text-gray-800 mb-6 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {galleryContent.title}
          </motion.h2>
          <motion.p 
            className="text-xl text-gray-600 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {galleryContent.subtitle}
          </motion.p>
        </motion.div>

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Image Gallery */}
            <motion.div 
              className="relative"
              initial={{ opacity: 0, x: -100 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {/* Main Image */}
              <motion.div 
                className="relative bg-white rounded-3xl p-8 shadow-2xl"
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: "0 30px 60px -12px rgba(0, 0, 0, 0.25)"
                }}
                transition={{ duration: 0.3 }}
              >
                <div className="aspect-square bg-gradient-to-br from-emerald-100 to-blue-100 rounded-2xl flex items-center justify-center overflow-hidden relative">
                  <AnimatePresence mode="wait" custom={1}>
                    {galleryContent.images && galleryContent.images.length > 0 && galleryContent.images[currentImage] ? (
                      <motion.img
                        key={currentImage}
                        src={galleryContent.images[currentImage]}
                        alt={`Product image ${currentImage + 1}`}
                        className="w-full h-full object-cover rounded-2xl"
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        custom={1}
                        transition={{
                          x: { type: "spring", stiffness: 300, damping: 30 },
                          opacity: { duration: 0.4 },
                          scale: { duration: 0.4 },
                          rotateY: { duration: 0.6 }
                        }}
                      />
                    ) : (
                      <motion.div 
                        className="w-full h-full bg-emerald-200 rounded-2xl flex items-center justify-center"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6 }}
                      >
                        <div className="text-center text-emerald-700">
                          <motion.div 
                            className="w-32 h-32 bg-emerald-300 rounded-full mx-auto mb-4 flex items-center justify-center"
                            animate={{
                              scale: [1, 1.1, 1],
                              rotate: [0, 5, -5, 0]
                            }}
                            transition={{
                              duration: 4,
                              repeat: Infinity,
                              ease: "easeInOut" as const
                            }}
                          >
                            <Leaf className="w-16 h-16 text-emerald-600" />
                          </motion.div>
                          <p className="font-semibold">রুহাফিয়া তেল</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Navigation Buttons */}
                <motion.button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-all duration-300"
                  whileHover={{ scale: 1.1, x: -5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <ChevronLeft className="w-6 h-6 text-gray-700" />
                </motion.button>
                
                <motion.button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-all duration-300"
                  whileHover={{ scale: 1.1, x: 5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <ChevronRight className="w-6 h-6 text-gray-700" />
                </motion.button>

                {/* Image Indicators */}
                <div className="flex justify-center mt-6 gap-2">
                  {galleryContent.images.map((_, index) => (
                    <motion.button
                      key={index}
                      onClick={() => setCurrentImage(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === currentImage 
                          ? 'bg-emerald-500' 
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                      whileHover={{ scale: 1.3 }}
                      whileTap={{ scale: 0.9 }}
                      animate={{
                        scale: index === currentImage ? 1.25 : 1
                      }}
                    />
                  ))}
                </div>
              </motion.div>

              
              
            </motion.div>

            {/* Product Features */}
            <motion.div 
              className="space-y-8"
              initial={{ opacity: 0, x: 100 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <motion.h3 
                  className="text-3xl font-bold text-gray-800 mb-6"
                  whileHover={{ x: 10 }}
                  transition={{ duration: 0.3 }}
                >
                  কেন রুহাফিয়া তেল বেছে নেবেন?
                </motion.h3>
                <motion.p 
                  className="text-lg text-gray-600 leading-relaxed"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  রুহাফিয়া তেল সম্পূর্ণ প্রাকৃতিক উপাদানে তৈরি একটি হোমমেড প্রোডাক্ট। 
                  এটি BCSIR কর্তৃক পরীক্ষিত এবং সম্পূর্ণ নিরাপদ।
                </motion.p>
              </motion.div>

              {/* Features List */}
              <motion.div 
                className="space-y-4"
                variants={containerVariants}
              >
                {galleryContent.features.map((feature, index) => (
                  <motion.div
                    key={index}
                    variants={featureVariants}
                    className="flex items-center gap-4 bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
                    whileHover={{ 
                      y: -5,
                      scale: 1.02,
                      boxShadow: "0 20px 40px -12px rgba(0, 0, 0, 0.15)",
                      borderColor: "rgb(16, 185, 129)"
                    }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div 
                      className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center"
                      whileHover={{ 
                        scale: 1.1,
                        rotate: 5
                      }}
                      animate={{
                        boxShadow: [
                          "0 0 0 0 rgba(16, 185, 129, 0.4)",
                          "0 0 0 10px rgba(16, 185, 129, 0)",
                          "0 0 0 0 rgba(16, 185, 129, 0)"
                        ]
                      }}
                      transition={{
                        boxShadow: {
                          duration: 2,
                          repeat: Infinity,
                          delay: index * 0.5
                        }
                      }}
                    >
                      {index === 0 && <Leaf className="w-6 h-6 text-white" />}
                      {index === 1 && <Award className="w-6 h-6 text-white" />}
                      {index === 2 && <Shield className="w-6 h-6 text-white" />}
                      {index === 3 && <Leaf className="w-6 h-6 text-white" />}
                    </motion.div>
                    <motion.span 
                      className="text-lg font-semibold text-gray-800"
                      whileHover={{ x: 5 }}
                    >
                      {feature}
                    </motion.span>
                  </motion.div>
                ))}
              </motion.div>

              {/* Trust Badge */}
              <motion.div
                className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl p-6 text-center relative overflow-hidden"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.8 }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 20px 40px -12px rgba(16, 185, 129, 0.4)"
                }}
                animate={{
                  boxShadow: [
                    "0 10px 20px -12px rgba(16, 185, 129, 0.3)",
                    "0 15px 30px -12px rgba(16, 185, 129, 0.4)",
                    "0 10px 20px -12px rgba(16, 185, 129, 0.3)"
                  ],
                  transition: {
                    boxShadow: {
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut" as const
                    }
                  }
                }}
              >
                {/* Animated Background */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-500 opacity-50"
                  animate={{
                    x: ["-100%", "100%"]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut" as const
                  }}
                />
                
                <div className="relative z-10">
                  <motion.h4 
                    className="text-xl font-bold mb-2"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    লিমিটেড স্টক!
                  </motion.h4>
                  <motion.p 
                    className="text-emerald-100"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                  >
                    তাই দেরি না করে এখনই অর্ডার করুন
                  </motion.p>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Order Button in Product Gallery */}
          <motion.div
            className="text-center mt-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8 }}
          >
            <motion.button
              onClick={() => {
                const orderSection = document.getElementById('order')
                orderSection?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold text-xl px-12 py-6 rounded-2xl shadow-2xl border-2 border-white/20"
              whileHover={{
                scale: 1.05,
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <span>অর্ডার করুন</span>
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                
              </motion.div>

              {/* Button Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300 -z-10"></div>
            </motion.button>
          </motion.div>
        </div>
      </div>
    </motion.section>
  )
}