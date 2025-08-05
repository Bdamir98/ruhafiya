'use client'

import { Heart, Shield, Zap, Clock, CheckCircle, Star, ArrowRight } from 'lucide-react'
import { motion, Variants } from 'framer-motion'

interface BenefitsProps {
  content?: {
    title?: string
    subtitle?: string
    benefits?: Array<{
      icon: string
      title: string
      description: string
    }>
  }
}

export default function Benefits({ content }: BenefitsProps) {
  const defaultBenefits = [
    {
      icon: 'heart',
      title: 'ব্যাকপেইন (কোমর ব্যথা)',
      description: 'দীর্ঘস্থায়ী কোমর ব্যথা থেকে মুক্তি পান'
    },
    {
      icon: 'shield',
      title: 'জয়েন্টের ব্যথা',
      description: 'শরীরের যেকোনো জয়েন্টের ব্যথা দূর করে'
    },
    {
      icon: 'zap',
      title: 'কাঁধ ও ঘাড়ের ব্যথা',
      description: 'কাঁধ ও ঘাড়ের শক্ত ব্যথা নিরাময় করে'
    },
    {
      icon: 'clock',
      title: 'হাঁটু ব্যথা',
      description: 'হাঁটু ব্যথা এবং ফোলাভাব কমায়'
    },
    {
      icon: 'check',
      title: 'আর্থ্রাইটিস বা বাতের ব্যথা',
      description: 'বাতের ব্যথা এবং প্রদাহ কমায়'
    },
    {
      icon: 'star',
      title: 'হাড় ক্ষয় জনিত ব্যথা',
      description: 'হাড়ের ক্ষয় থেকে হওয়া ব্যথা নিরাময় করে'
    }
  ]

  const defaultContent = {
    title: "রুহাফিয়া তেলের উপকারিতা",
    subtitle: "প্রাকৃতিক উপাদানে তৈরি, সকল ধরনের ব্যথার জন্য কার্যকর",
    benefits: defaultBenefits
  }

  const benefitsContent = { ...defaultContent, ...content }

  const getIcon = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      heart: Heart,
      shield: Shield,
      zap: Zap,
      clock: Clock,
      check: CheckCircle,
      star: Star
    }
    return iconMap[iconName] || Heart
  }

  // Animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const headerVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  }

  const cardVariants: Variants = {
    hidden: { 
      opacity: 0, 
      y: 60,
      scale: 0.9
    },
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

  const iconVariants: Variants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15,
        delay: 0.2
      }
    }
  }

  const floatingAnimation = {
    y: [-10, 10, -10],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut" as const
    }
  }

  return (
    <motion.section 
      className="py-20 bg-gradient-to-br from-white via-emerald-50 to-blue-50 relative overflow-hidden"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={containerVariants}
    >
      {/* Floating Background Elements */}
      <motion.div 
        className="absolute top-20 left-10 w-32 h-32 bg-emerald-200/20 rounded-full blur-xl"
        animate={floatingAnimation}
      />
      <motion.div 
        className="absolute bottom-20 right-10 w-48 h-48 bg-blue-200/20 rounded-full blur-2xl"
        animate={{
          ...floatingAnimation,
          transition: { ...floatingAnimation.transition, delay: 1 }
        }}
      />

      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-16"
          variants={headerVariants}
        >
          <motion.h2 
            className="text-4xl md:text-5xl font-bold text-gray-800 mb-6 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {benefitsContent.title}
          </motion.h2>
          <motion.p 
            className="text-xl text-gray-600 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {benefitsContent.subtitle}
          </motion.p>
        </motion.div>

        {/* Benefits Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
          variants={containerVariants}
        >
          {benefitsContent.benefits.map((benefit, index) => {
            const IconComponent = getIcon(benefit.icon)
            
            return (
              <motion.div
                key={index}
                variants={cardVariants}
                className="group relative bg-white rounded-3xl p-8 shadow-lg border border-emerald-100 overflow-hidden"
                whileHover={{ 
                  y: -10,
                  scale: 1.02,
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                  transition: { duration: 0.3 }
                }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Background Gradient */}
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-blue-500/5 rounded-3xl"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                />
                
                {/* Animated Background Particles */}
                <motion.div
                  className="absolute top-4 right-4 w-2 h-2 bg-emerald-300 rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.3, 0.8, 0.3]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: index * 0.2
                  }}
                />
                
                {/* Icon */}
                <div className="relative mb-6">
                  <motion.div 
                    className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center"
                    variants={iconVariants}
                    whileHover={{ 
                      scale: 1.1,
                      rotate: 5,
                      transition: { duration: 0.3 }
                    }}
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3 + index * 0.1, type: "spring" as const }}
                    >
                      <IconComponent className="w-8 h-8 text-white" />
                    </motion.div>
                  </motion.div>
                  
                  {/* Icon Glow */}
                  <motion.div 
                    className="absolute inset-0 w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl blur-xl opacity-30"
                    whileHover={{ opacity: 0.6, scale: 1.2 }}
                    transition={{ duration: 0.3 }}
                  />
                </div>

                {/* Content */}
                <motion.div 
                  className="relative"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <motion.h3 
                    className="text-xl font-bold text-gray-800 mb-4 group-hover:text-emerald-700 transition-colors duration-300"
                    whileHover={{ x: 5 }}
                  >
                    {benefit.title}
                  </motion.h3>
                  <motion.p 
                    className="text-gray-600 leading-relaxed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    {benefit.description}
                  </motion.p>
                </motion.div>

                {/* Hover Effect Border */}
                <motion.div 
                  className="absolute inset-0 rounded-3xl border-2 border-emerald-300"
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                />

                {/* Ripple Effect */}
                <motion.div
                  className="absolute inset-0 rounded-3xl"
                  whileHover={{
                    background: "radial-gradient(circle at center, rgba(16, 185, 129, 0.1) 0%, transparent 70%)"
                  }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            )
          })}
        </motion.div>

        {/* Order Button */}
        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
         >
          <motion.button
            onClick={() => document.getElementById('order-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold text-xl px-12 py-4 rounded-2xl shadow-2xl border-2 border-white/20 mb-8"
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
            }}
            whileTap={{ scale: 0.95 }}
           >
            অর্ডার করুন
          </motion.button>

          <motion.div 
            className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-4 rounded-2xl shadow-lg"
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 20px 40px -12px rgba(16, 185, 129, 0.4)"
            }}
            whileTap={{ scale: 0.95 }}
            animate={{
              boxShadow: [
                "0 10px 20px -12px rgba(16, 185, 129, 0.2)",
                "0 15px 30px -12px rgba(16, 185, 129, 0.3)",
                "0 10px 20px -12px rgba(16, 185, 129, 0.2)"
              ]
            }}
            transition={{
              boxShadow: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <CheckCircle className="w-6 h-6" />
            </motion.div>
            <span className="font-semibold text-lg">১০০% প্রাকৃতিক ও নিরাপদ</span>
          </motion.div>
        </motion.div>
        
      </div>
    </motion.section>
  )
}