'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import Hero from '@/components/Hero'
import Benefits from '@/components/Benefits'
import ProductGallery from '@/components/ProductGallery'
import Testimonials from '@/components/Testimonials'
import Pricing from '@/components/Pricing'
import OrderForm from '@/components/OrderForm'
import Footer from '@/components/Footer'
import StructuredData, { FAQStructuredData } from '@/components/StructuredData'
import SmartLeadCapture from '@/components/SmartLeadCapture'
import FloatingOrderButton from '@/components/FloatingOrderButton'

export default function Home() {
  const [websiteContent, setWebsiteContent] = useState<any>({})

  useEffect(() => {
    fetchWebsiteContent()
  }, [])

  const handleLeadCapture = (leadData: any) => {
    console.log('Lead captured:', leadData)
    // You can add additional tracking or analytics here
  }

  const fetchWebsiteContent = async () => {
    try {
      const { data, error } = await supabase
        .from('website_content')
        .select('*')
      
      if (error) throw error
      
      const contentMap = data?.reduce((acc: any, item: any) => {
        acc[item.section] = item.content
        return acc
      }, {})
      
      setWebsiteContent(contentMap)
    } catch (error) {
      console.error('Error fetching website content:', error)
    }
  }

  // Page animation variants
  const pageVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  }

  const sectionVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0
    }
  }

  return (
    <>
      {/* Structured Data */}
      <StructuredData type="website" />
      <StructuredData type="organization" />
      <StructuredData type="product" />
      <FAQStructuredData />

      <motion.main
        className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 relative overflow-hidden"
        variants={pageVariants}
        initial="initial"
        animate="animate"
      >
      {/* Floating Background Elements */}
      <motion.div 
        className="fixed top-20 left-20 w-64 h-64 bg-emerald-200/10 rounded-full blur-3xl pointer-events-none"
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
          scale: [1, 1.2, 1]
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div 
        className="fixed bottom-20 right-20 w-96 h-96 bg-blue-200/10 rounded-full blur-3xl pointer-events-none"
        animate={{
          x: [0, -80, 0],
          y: [0, 60, 0],
          scale: [1, 0.8, 1]
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 5
        }}
      />
      <motion.div 
        className="fixed top-1/2 left-1/2 w-48 h-48 bg-teal-200/10 rounded-full blur-2xl pointer-events-none"
        animate={{
          x: [-100, 100, -100],
          y: [-80, 80, -80],
          rotate: [0, 360, 0]
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 10
        }}
      />

      <motion.div variants={sectionVariants}>
        <Hero content={websiteContent.hero} />
      </motion.div>
      
      <motion.div variants={sectionVariants}>
        <Benefits content={websiteContent.benefits} />
      </motion.div>
      
      <motion.div variants={sectionVariants}>
        <ProductGallery content={websiteContent.gallery} />
      </motion.div>
      
      <motion.div variants={sectionVariants}>
        <Testimonials content={websiteContent.testimonials} />
      </motion.div>
      
      <motion.div variants={sectionVariants}>
        <Pricing content={websiteContent.pricing} />
      </motion.div>
      
      <motion.div variants={sectionVariants}>
        <OrderForm content={websiteContent.orderForm} />
      </motion.div>
      
      <motion.div variants={sectionVariants}>
        <Footer content={websiteContent.footer} />
      </motion.div>

      {/* Smart Lead Capture Popup - Hidden */}
      {/* <SmartLeadCapture onCapture={handleLeadCapture} /> */}

      {/* Floating Order Button */}
      <FloatingOrderButton />
    </motion.main>
    </>
  )
}