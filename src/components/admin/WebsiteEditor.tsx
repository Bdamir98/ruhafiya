'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Save, Edit, Eye, RefreshCw } from 'lucide-react'
import { ImageUploadPresets } from './ImageUpload'
import HeroSliderEditor from './HeroSliderEditor'

interface WebsiteContent {
  id?: string
  section: string
  content: any
  updated_at?: string
}

export default function WebsiteEditor() {
  const [sections, setSections] = useState<WebsiteContent[]>([])
  const [activeSection, setActiveSection] = useState('hero')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingContent, setEditingContent] = useState<any>({})

  const sectionLabels = {
    heroSlider: 'Hero Slider',
    hero: 'Hero Section',
    benefits: 'Benefits Section',
    gallery: 'Product Gallery',
    testimonials: 'Customer Reviews',
    pricing: 'Pricing',
    orderForm: 'Order Form',
    footer: 'Footer'
  }

  // Common input field styles
  const inputStyles = "w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 placeholder-gray-600 text-gray-800 bg-gray-50 hover:bg-white transition-colors"
  const textareaStyles = "w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 placeholder-gray-600 text-gray-800 bg-gray-50 hover:bg-white transition-colors resize-vertical"
  const smallInputStyles = "w-full px-3 py-2 border-2 border-gray-200 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 placeholder-gray-600 text-gray-800 bg-gray-50 hover:bg-white transition-colors text-sm"

  useEffect(() => {
    fetchWebsiteContent()
  }, [])

  const fetchWebsiteContent = async () => {
    try {
      const { data, error } = await supabase
        .from('website_content')
        .select('*')

      if (error) throw error

      setSections(data || [])
      
      // Initialize with default content if no data exists
      if (!data || data.length === 0) {
        await initializeDefaultContent()
      }
    } catch (error) {
      console.error('Error fetching website content:', error)
    } finally {
      setLoading(false)
    }
  }

  const initializeDefaultContent = async () => {
    const defaultSections = [
      {
        section: 'hero',
        content: {
          title: 'Ruhafiya',
          subtitle: 'প্রাকৃতিক ব্যথা নিরাময়ের তেল',
          description: '১৫-২০ দিন নিয়মিত ব্যবহার করলে হাটু ব্যথা, কাধ ব্যথা, বাত ব্যথা, কোমর ব্যথা সহ সকল ব্যথা দূর হবে ইনশাল্লাহ',
          customerCount: '7000+',
          buttonText: 'অর্ডার করুন'
        }
      },
      {
        section: 'benefits',
        content: {
          title: 'Ruhafiya তেলের উপকারিতা',
          subtitle: 'প্রাকৃতিক উপাদানে তৈরি, সকল ধরনের ব্যথার জন্য কার্যকর',
          benefits: [
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
        }
      },
      {
        section: 'gallery',
        content: {
          title: 'Ruhafiya প্রোডাক্ট গ্যালারি',
          subtitle: 'প্রাকৃতিক উপাদানে তৈরি, সম্পূর্ণ নিরাপদ',
          images: ['/api/placeholder/400/500', '/api/placeholder/400/500', '/api/placeholder/400/500', '/api/placeholder/400/500']
        }
      },
      {
        section: 'testimonials',
        content: {
          title: 'আলহামদুলিল্লাহ অনেকেই ব্যাবহার করে উপকৃত হয়েছেন',
          subtitle: 'আমাদের সন্তুষ্ট গ্রাহকদের মতামত',
          testimonials: [
            {
              name: 'রহিমা খাতুন',
              location: 'ঢাকা',
              rating: 5,
              comment: 'আমার কোমর ব্যথার জন্য অনেক ওষুধ খেয়েছি কিন্তু কোন কাজ হয়নি। Ruhafiya তেল ব্যবহারের মাত্র ১০ দিনেই ব্যথা অনেক কমে গেছে।'
            },
            {
              name: 'আব্দুল করিম',
              location: 'চট্টগ্রাম',
              rating: 5,
              comment: 'হাঁটুর ব্যথার কারণে হাঁটতে পারতাম না। এই তেল ব্যবহারের পর এখন স্বাভাবিকভাবে হাঁটতে পারি। আলহামদুলিল্লাহ!'
            }
          ]
        }
      },
      {
        section: 'pricing',
        content: {
          title: 'বিশেষ অফার মূল্য',
          subtitle: 'সীমিত সময়ের জন্য বিশেষ ছাড়',
          originalPrice: 1350,
          offerPrice: 850,
          bundleOriginalPrice: 2700,
          bundleOfferPrice: 1550,
          bundleDiscount: 1150,
          features: [
            "ফ্রি হোম ডেলিভারি",
            "ক্যাশ অন ডেলিভারি",
            "১০০% মানি ব্যাক গ্যারান্টি",
            "২৪/৭ কাস্টমার সাপোর্ট"
          ],
          singlePackageImage: "",
          bundlePackageImage1: "",
          bundlePackageImage2: ""
        }
      },
      {
        section: 'orderForm',
        content: {
          title: 'অর্ডার করুন',
          subtitle: 'নিচের ফর্মটি পূরণ করে আপনার অর্ডার সম্পন্ন করুন',
          singlePrice: 890,
          bundlePrice: 1650
        }
      },
      {
        section: 'footer',
        content: {
          companyName: 'Ruhafiya',
          description: 'প্রাকৃতিক ব্যথা নিরাময়ের তেল - আপনার সুস্বাস্থ্যের জন্য প্রাকৃতিক সমাধান',
          phone: '+880 1XXX-XXXXXX',
          email: 'info@ruhafiya.com',
          address: 'ঢাকা, বাংলাদেশ',
          socialLinks: {
            facebook: '#',
            instagram: '#',
            youtube: '#'
          }
        }
      }
    ]

    try {
      const { error } = await supabase
        .from('website_content')
        .insert(defaultSections)

      if (error) throw error
      
      setSections(defaultSections)
    } catch (error) {
      console.error('Error initializing default content:', error)
    }
  }

  const getCurrentSectionContent = () => {
    const section = sections.find(s => s.section === activeSection)
    return section?.content || {}
  }

  const updateSectionContent = async () => {
    setSaving(true)
    
    try {
      const existingSection = sections.find(s => s.section === activeSection)
      
      if (existingSection) {
        // Update existing section
        const { error } = await supabase
          .from('website_content')
          .update({
            content: editingContent,
            updated_at: new Date().toISOString()
          })
          .eq('section', activeSection)

        if (error) throw error
      } else {
        // Insert new section
        const { error } = await supabase
          .from('website_content')
          .insert([{
            section: activeSection,
            content: editingContent,
            updated_at: new Date().toISOString()
          }])

        if (error) throw error
      }

      // Update local state
      setSections(prev => {
        const updated = prev.filter(s => s.section !== activeSection)
        updated.push({
          section: activeSection,
          content: editingContent,
          updated_at: new Date().toISOString()
        })
        return updated
      })

      alert('Content updated successfully!')
    } catch (error) {
      console.error('Error updating content:', error)
      alert('Error updating content')
    } finally {
      setSaving(false)
    }
  }

  const renderContentEditor = () => {
    const currentContent = getCurrentSectionContent()
    
    switch (activeSection) {
      case 'heroSlider':
        return <HeroSliderEditor />

      case 'hero':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Main Title
              </label>
              <input
                type="text"
                value={editingContent.title || currentContent.title || ''}
                onChange={(e) => setEditingContent({...editingContent, title: e.target.value})}
                className={inputStyles}
                placeholder="Ruhafiya"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Subtitle
              </label>
              <input
                type="text"
                value={editingContent.subtitle || currentContent.subtitle || ''}
                onChange={(e) => setEditingContent({...editingContent, subtitle: e.target.value})}
                className={inputStyles}
                placeholder="প্রাকৃতিক ব্যথা নিরাময়ের তেল"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                rows={4}
                value={editingContent.description || currentContent.description || ''}
                onChange={(e) => setEditingContent({...editingContent, description: e.target.value})}
                className={textareaStyles}
                placeholder="১৫-২০ দিন নিয়মিত ব্যবহার করলে..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Customer Count
              </label>
              <input
                type="text"
                value={editingContent.customerCount || currentContent.customerCount || ''}
                onChange={(e) => setEditingContent({...editingContent, customerCount: e.target.value})}
                className={inputStyles}
                placeholder="7000+"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Button Text
              </label>
              <input
                type="text"
                value={editingContent.buttonText || currentContent.buttonText || ''}
                onChange={(e) => setEditingContent({...editingContent, buttonText: e.target.value})}
                className={inputStyles}
                placeholder="অর্ডার করুন"
              />
            </div>

            {/* Hero Background Image */}
            <div>
              <ImageUploadPresets.HeroImage
                currentImage={editingContent.backgroundImage || currentContent.backgroundImage}
                onImageChange={(imageUrl) => setEditingContent({...editingContent, backgroundImage: imageUrl})}
              />
            </div>
          </div>
        )

      case 'benefits':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Section Title
              </label>
              <input
                type="text"
                value={editingContent.title || currentContent.title || ''}
                onChange={(e) => setEditingContent({...editingContent, title: e.target.value})}
                className={inputStyles}
                placeholder="Ruhafiya তেলের উপকারিতা"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Subtitle
              </label>
              <input
                type="text"
                value={editingContent.subtitle || currentContent.subtitle || ''}
                onChange={(e) => setEditingContent({...editingContent, subtitle: e.target.value})}
                className={inputStyles}
                placeholder="প্রাকৃতিক উপাদানে তৈরি, সকল ধরনের ব্যথার জন্য কার্যকর"
              />
            </div>

            {/* Benefits List */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-4">
                Benefits List
              </label>
              <div className="space-y-4">
                {[0, 1, 2, 3, 4, 5].map((index) => {
                  const benefits = editingContent.benefits || currentContent.benefits || []
                  const benefit = benefits[index] || {}

                  return (
                    <div key={index} className="border-2 border-gray-100 rounded-lg p-4 bg-gray-50">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">
                        Benefit {index + 1}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Icon</label>
                          <select
                            value={benefit.icon || 'heart'}
                            onChange={(e) => {
                              const newBenefits = [...benefits]
                              newBenefits[index] = { ...benefit, icon: e.target.value }
                              setEditingContent({...editingContent, benefits: newBenefits})
                            }}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                          >
                            <option value="heart">Heart (হার্ট)</option>
                            <option value="shield">Shield (ঢাল)</option>
                            <option value="zap">Zap (বিদ্যুৎ)</option>
                            <option value="clock">Clock (ঘড়ি)</option>
                            <option value="check">Check (টিক)</option>
                            <option value="star">Star (তারা)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Title</label>
                          <input
                            type="text"
                            value={benefit.title || ''}
                            onChange={(e) => {
                              const newBenefits = [...benefits]
                              newBenefits[index] = { ...benefit, title: e.target.value }
                              setEditingContent({...editingContent, benefits: newBenefits})
                            }}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                            placeholder="ব্যাকপেইন (কোমর ব্যথা)"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs text-gray-600 mb-1">Description</label>
                          <textarea
                            value={benefit.description || ''}
                            onChange={(e) => {
                              const newBenefits = [...benefits]
                              newBenefits[index] = { ...benefit, description: e.target.value }
                              setEditingContent({...editingContent, benefits: newBenefits})
                            }}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                            rows={2}
                            placeholder="দীর্ঘস্থায়ী কোমর ব্যথা থেকে মুক্তি পান"
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )

      case 'gallery':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Section Title
              </label>
              <input
                type="text"
                value={editingContent.title || currentContent.title || ''}
                onChange={(e) => setEditingContent({...editingContent, title: e.target.value})}
                className={inputStyles}
                placeholder="পণ্যের ছবি"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Subtitle
              </label>
              <input
                type="text"
                value={editingContent.subtitle || currentContent.subtitle || ''}
                onChange={(e) => setEditingContent({...editingContent, subtitle: e.target.value})}
                className={inputStyles}
                placeholder="প্রাকৃতিক উপাদানে তৈরি, BCSIR কর্তৃক পরীক্ষিত"
              />
            </div>
            

            {/* Product Images */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-4">
                Product Images
              </label>
              <div className="space-y-4">
                {[0, 1, 2, 3].map((index) => {
                  const images = editingContent.images || currentContent.images || []
                  return (
                    <div key={index} className="border-2 border-gray-100 rounded-lg p-4 bg-gray-50">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">
                        Product Image {index + 1}
                      </h4>
                      <ImageUploadPresets.ProductImage
                        currentImage={images[index]}
                        onImageChange={(imageUrl) => {
                          const newImages = [...(editingContent.images || currentContent.images || [])]
                          if (imageUrl) {
                            newImages[index] = imageUrl
                          } else {
                            newImages.splice(index, 1)
                          }
                          setEditingContent({...editingContent, images: newImages})
                        }}
                      />
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Product Features */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Product Features (one per line)
              </label>
              <textarea
                rows={6}
                value={(editingContent.features || currentContent.features || []).join('\n')}
                onChange={(e) => setEditingContent({
                  ...editingContent, 
                  features: e.target.value.split('\n').filter(f => f.trim())
                })}
                className={textareaStyles}
                placeholder="১০০% প্রাকৃতিক উপাদান&#10;কোনো পার্শ্বপ্রতিক্রিয়া নেই&#10;BCSIR কর্তৃক পরীক্ষিত&#10;দ্রুত ব্যথা নিরাময়"
              />
            </div>
          </div>
        )

      case 'testimonials':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Section Title
              </label>
              <input
                type="text"
                value={editingContent.title || currentContent.title || ''}
                onChange={(e) => setEditingContent({...editingContent, title: e.target.value})}
                className={inputStyles}
                placeholder="গ্রাহকদের মতামত"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Subtitle
              </label>
              <input
                type="text"
                value={editingContent.subtitle || currentContent.subtitle || ''}
                onChange={(e) => setEditingContent({...editingContent, subtitle: e.target.value})}
                className={inputStyles}
                placeholder="সন্তুষ্ট গ্রাহকদের অভিজ্ঞতা"
              />
            </div>

            {/* Testimonials */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-4">
                Customer Testimonials
              </label>
              <div className="space-y-6">
                {[0, 1, 2, 3].map((index) => {
                  const testimonials = editingContent.testimonials || currentContent.testimonials || []
                  const testimonial = testimonials[index] || {}
                  
                  return (
                    <div key={index} className="border-2 border-gray-100 rounded-lg p-4 bg-gray-50">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">
                        Testimonial {index + 1}
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Customer Name
                          </label>
                          <input
                            type="text"
                            value={testimonial.name || ''}
                            onChange={(e) => {
                              const newTestimonials = [...testimonials]
                              newTestimonials[index] = { ...testimonial, name: e.target.value }
                              setEditingContent({...editingContent, testimonials: newTestimonials})
                            }}
                            className={smallInputStyles}
                            placeholder="মোহাম্মদ আলী"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Location
                          </label>
                          <input
                            type="text"
                            value={testimonial.location || ''}
                            onChange={(e) => {
                              const newTestimonials = [...testimonials]
                              newTestimonials[index] = { ...testimonial, location: e.target.value }
                              setEditingContent({...editingContent, testimonials: newTestimonials})
                            }}
                            className={smallInputStyles}
                            placeholder="ঢাকা"
                          />
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Review Comment
                        </label>
                        <textarea
                          rows={3}
                          value={testimonial.comment || ''}
                          onChange={(e) => {
                            const newTestimonials = [...testimonials]
                            newTestimonials[index] = { ...testimonial, comment: e.target.value }
                            setEditingContent({...editingContent, testimonials: newTestimonials})
                          }}
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 placeholder-gray-600 text-gray-800 bg-gray-50 hover:bg-white transition-colors text-sm resize-vertical"
                          placeholder="আলহামদুলিল্লাহ! ২০ দিন ব্যবহারের পর আমার কোমর ব্যথা সম্পূর্ণ ভালো ��য়ে গেছে।"
                        />
                      </div>
                      
                      <ImageUploadPresets.TestimonialImage
                        currentImage={testimonial.image}
                        onImageChange={(imageUrl) => {
                          const newTestimonials = [...testimonials]
                          newTestimonials[index] = { ...testimonial, image: imageUrl }
                          setEditingContent({...editingContent, testimonials: newTestimonials})
                        }}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )

      case 'pricing':
        return (
          <div className="space-y-6">
            {/* Section Headers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Section Title
                </label>
                <input
                  type="text"
                  value={editingContent.title || currentContent.title || ''}
                  onChange={(e) => setEditingContent({...editingContent, title: e.target.value})}
                  className={inputStyles}
                  placeholder="বিশেষ অফার মূল্য"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={editingContent.subtitle || currentContent.subtitle || ''}
                  onChange={(e) => setEditingContent({...editingContent, subtitle: e.target.value})}
                  className={inputStyles}
                  placeholder="সীমিত সময়ের জন্য বিশেষ ছাড়"
                />
              </div>
            </div>

            {/* Single Package Pricing */}
            <div className="border-2 border-gray-100 rounded-lg p-4 bg-gray-50">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">📦 একক প্যাকেজ (Single Package)</h4>

              {/* Single Package Image */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Product Image
                </label>
                <ImageUploadPresets.ProductImage
                  currentImage={editingContent.singlePackageImage || currentContent.singlePackageImage}
                  onImageChange={(imageUrl) => setEditingContent({...editingContent, singlePackageImage: imageUrl})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Original Price (৳)
                  </label>
                  <input
                    type="number"
                    value={editingContent.originalPrice || currentContent.originalPrice || ''}
                    onChange={(e) => setEditingContent({...editingContent, originalPrice: parseInt(e.target.value)})}
                    className={inputStyles}
                    placeholder="1350"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Offer Price (৳)
                  </label>
                  <input
                    type="number"
                    value={editingContent.offerPrice || currentContent.offerPrice || ''}
                    onChange={(e) => setEditingContent({...editingContent, offerPrice: parseInt(e.target.value)})}
                    className={inputStyles}
                    placeholder="850"
                  />
                </div>
              </div>
            </div>

            {/* Bundle Package Pricing */}
            <div className="border-2 border-gray-100 rounded-lg p-4 bg-gray-50">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">🎁 বান্ডেল প্যাকেজ (Bundle Package)</h4>

              {/* Bundle Package Images */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Bundle Image 1
                  </label>
                  <ImageUploadPresets.ProductImage
                    currentImage={editingContent.bundlePackageImage1 || currentContent.bundlePackageImage1}
                    onImageChange={(imageUrl) => setEditingContent({...editingContent, bundlePackageImage1: imageUrl})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Bundle Image 2
                  </label>
                  <ImageUploadPresets.ProductImage
                    currentImage={editingContent.bundlePackageImage2 || currentContent.bundlePackageImage2}
                    onImageChange={(imageUrl) => setEditingContent({...editingContent, bundlePackageImage2: imageUrl})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Bundle Original Price (৳)
                  </label>
                  <input
                    type="number"
                    value={editingContent.bundleOriginalPrice || currentContent.bundleOriginalPrice || ''}
                    onChange={(e) => setEditingContent({...editingContent, bundleOriginalPrice: parseInt(e.target.value)})}
                    className={inputStyles}
                    placeholder="2700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Bundle Offer Price (৳)
                  </label>
                  <input
                    type="number"
                    value={editingContent.bundleOfferPrice || currentContent.bundleOfferPrice || ''}
                    onChange={(e) => setEditingContent({...editingContent, bundleOfferPrice: parseInt(e.target.value)})}
                    className={inputStyles}
                    placeholder="1550"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Bundle Discount Amount (৳)
                  </label>
                  <input
                    type="number"
                    value={editingContent.bundleDiscount || currentContent.bundleDiscount || ''}
                    onChange={(e) => setEditingContent({...editingContent, bundleDiscount: parseInt(e.target.value)})}
                    className={inputStyles}
                    placeholder="1150"
                  />
                </div>
              </div>
            </div>

            {/* Features List */}
            <div className="border-2 border-gray-100 rounded-lg p-4 bg-gray-50">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Features</h4>
              <div className="space-y-3">
                {[0, 1, 2, 3].map((index) => {
                  const features = editingContent.features || currentContent.features || []
                  return (
                    <div key={index}>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Feature {index + 1}
                      </label>
                      <input
                        type="text"
                        value={features[index] || ''}
                        onChange={(e) => {
                          const newFeatures = [...(editingContent.features || currentContent.features || [])]
                          newFeatures[index] = e.target.value
                          setEditingContent({...editingContent, features: newFeatures})
                        }}
                        className={inputStyles}
                        placeholder={
                          index === 0 ? "ফ্রি হোম ডেলিভারি" :
                          index === 1 ? "ক্যাশ অন ডেলিভারি" :
                          index === 2 ? "১০০% মানি ব্যাক গ্যারান্টি" :
                          "২৪/৭ কাস্টমার সাপোর্ট"
                        }
                      />
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Price Preview */}
            <div className="border-2 border-emerald-200 rounded-lg p-4 bg-emerald-50">
              <h4 className="text-lg font-semibold text-emerald-800 mb-3">💰 Price & Image Preview</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-white rounded-lg p-3 border border-emerald-200">
                  <p className="font-semibold text-gray-700 mb-2">📦 Single Package:</p>

                  {/* Single Package Image Preview */}
                  <div className="w-16 h-16 bg-gray-100 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                    {(editingContent.singlePackageImage || currentContent.singlePackageImage) ? (
                      <img
                        src={editingContent.singlePackageImage || currentContent.singlePackageImage}
                        alt="Single Package"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <span className="text-xs text-gray-400">No Image</span>
                    )}
                  </div>

                  <p className="text-gray-600">Original: <span className="line-through">৳{editingContent.originalPrice || currentContent.originalPrice || 1350}</span></p>
                  <p className="text-lg font-bold text-emerald-600">Offer: ৳{editingContent.offerPrice || currentContent.offerPrice || 850}</p>
                  <p className="text-orange-600 font-semibold">
                    🏷️ {Math.round((((editingContent.originalPrice || currentContent.originalPrice || 1350) - (editingContent.offerPrice || currentContent.offerPrice || 850)) / (editingContent.originalPrice || currentContent.originalPrice || 1350)) * 100)}% ছাড়
                  </p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-emerald-200">
                  <p className="font-semibold text-gray-700 mb-2">🎁 Bundle Package:</p>

                  {/* Bundle Package Images Preview */}
                  <div className="flex gap-2 mb-2">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                      {(editingContent.bundlePackageImage1 || currentContent.bundlePackageImage1) ? (
                        <img
                          src={editingContent.bundlePackageImage1 || currentContent.bundlePackageImage1}
                          alt="Bundle 1"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <span className="text-xs text-gray-400">1</span>
                      )}
                    </div>
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                      {(editingContent.bundlePackageImage2 || currentContent.bundlePackageImage2) ? (
                        <img
                          src={editingContent.bundlePackageImage2 || currentContent.bundlePackageImage2}
                          alt="Bundle 2"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <span className="text-xs text-gray-400">2</span>
                      )}
                    </div>
                  </div>

                  <p className="text-gray-600">Original: <span className="line-through">৳{editingContent.bundleOriginalPrice || currentContent.bundleOriginalPrice || 2700}</span></p>
                  <p className="text-lg font-bold text-emerald-600">Offer: ৳{editingContent.bundleOfferPrice || currentContent.bundleOfferPrice || 1550}</p>
                  <p className="text-orange-600 font-semibold">💰 Save: ৳{editingContent.bundleDiscount || currentContent.bundleDiscount || 1150}</p>
                </div>
              </div>
              <div className="mt-3 p-2 bg-white rounded border border-emerald-200">
                <p className="text-xs text-gray-600">
                  <strong>Note:</strong> Upload product images and set prices. Images should be 400×500 pixels for best results.
                </p>
              </div>
            </div>
          </div>
        )

      case 'testimonials':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Section Title
              </label>
              <input
                type="text"
                value={editingContent.title || currentContent.title || ''}
                onChange={(e) => setEditingContent({...editingContent, title: e.target.value})}
                className={inputStyles}
                placeholder="আলহামদুলিল্লাহ অনেকেই ব্যাবহার করে উপকৃত হয়েছেন"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Subtitle
              </label>
              <input
                type="text"
                value={editingContent.subtitle || currentContent.subtitle || ''}
                onChange={(e) => setEditingContent({...editingContent, subtitle: e.target.value})}
                className={inputStyles}
                placeholder="আমাদের সন্তুষ্ট গ্রাহকদের মতামত"
              />
            </div>

            {/* Testimonials */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-4">
                Customer Testimonials
              </label>
              <div className="space-y-4">
                {[0, 1, 2, 3, 4].map((index) => {
                  const testimonials = editingContent.testimonials || currentContent.testimonials || []
                  const testimonial = testimonials[index] || {}

                  return (
                    <div key={index} className="border-2 border-gray-100 rounded-lg p-4 bg-gray-50">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">
                        Testimonial {index + 1}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Customer Name</label>
                          <input
                            type="text"
                            value={testimonial.name || ''}
                            onChange={(e) => {
                              const newTestimonials = [...testimonials]
                              newTestimonials[index] = { ...testimonial, name: e.target.value }
                              setEditingContent({...editingContent, testimonials: newTestimonials})
                            }}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                            placeholder="রহিমা খাতুন"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Location</label>
                          <input
                            type="text"
                            value={testimonial.location || ''}
                            onChange={(e) => {
                              const newTestimonials = [...testimonials]
                              newTestimonials[index] = { ...testimonial, location: e.target.value }
                              setEditingContent({...editingContent, testimonials: newTestimonials})
                            }}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                            placeholder="ঢাকা"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Rating (1-5)</label>
                          <select
                            value={testimonial.rating || 5}
                            onChange={(e) => {
                              const newTestimonials = [...testimonials]
                              newTestimonials[index] = { ...testimonial, rating: parseInt(e.target.value) }
                              setEditingContent({...editingContent, testimonials: newTestimonials})
                            }}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                          >
                            <option value={5}>5 Stars</option>
                            <option value={4}>4 Stars</option>
                            <option value={3}>3 Stars</option>
                            <option value={2}>2 Stars</option>
                            <option value={1}>1 Star</option>
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs text-gray-600 mb-1">Review Comment</label>
                          <textarea
                            value={testimonial.comment || ''}
                            onChange={(e) => {
                              const newTestimonials = [...testimonials]
                              newTestimonials[index] = { ...testimonial, comment: e.target.value }
                              setEditingContent({...editingContent, testimonials: newTestimonials})
                            }}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                            rows={3}
                            placeholder="আমার কোমর ব্যথার জন্য অনেক ওষুধ খেয়েছি কিন্তু কোন কাজ হয়নি..."
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )

      case 'footer':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Company Name
              </label>
              <input
                type="text"
                value={editingContent.companyName || currentContent.companyName || ''}
                onChange={(e) => setEditingContent({...editingContent, companyName: e.target.value})}
                className={inputStyles}
                placeholder="Ruhafiya"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Company Description
              </label>
              <textarea
                value={editingContent.description || currentContent.description || ''}
                onChange={(e) => setEditingContent({...editingContent, description: e.target.value})}
                className={inputStyles}
                rows={3}
                placeholder="প্রাকৃতিক ব্যথা নিরাময়ের তেল - আপনার সুস্বাস্থ্যের জন্য প্রাকৃতিক সমাধান"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={editingContent.phone || currentContent.phone || ''}
                  onChange={(e) => setEditingContent({...editingContent, phone: e.target.value})}
                  className={inputStyles}
                  placeholder="+880 1XXX-XXXXXX"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={editingContent.email || currentContent.email || ''}
                  onChange={(e) => setEditingContent({...editingContent, email: e.target.value})}
                  className={inputStyles}
                  placeholder="info@ruhafiya.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Address
              </label>
              <input
                type="text"
                value={editingContent.address || currentContent.address || ''}
                onChange={(e) => setEditingContent({...editingContent, address: e.target.value})}
                className={inputStyles}
                placeholder="ঢাকা, বাংলাদেশ"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-4">
                Social Media Links
              </label>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Facebook URL</label>
                  <input
                    type="url"
                    value={editingContent.socialLinks?.facebook || currentContent.socialLinks?.facebook || ''}
                    onChange={(e) => setEditingContent({
                      ...editingContent,
                      socialLinks: {
                        ...editingContent.socialLinks,
                        facebook: e.target.value
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    placeholder="https://facebook.com/ruhafiya"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Instagram URL</label>
                  <input
                    type="url"
                    value={editingContent.socialLinks?.instagram || currentContent.socialLinks?.instagram || ''}
                    onChange={(e) => setEditingContent({
                      ...editingContent,
                      socialLinks: {
                        ...editingContent.socialLinks,
                        instagram: e.target.value
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    placeholder="https://instagram.com/ruhafiya"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">YouTube URL</label>
                  <input
                    type="url"
                    value={editingContent.socialLinks?.youtube || currentContent.socialLinks?.youtube || ''}
                    onChange={(e) => setEditingContent({
                      ...editingContent,
                      socialLinks: {
                        ...editingContent.socialLinks,
                        youtube: e.target.value
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    placeholder="https://youtube.com/ruhafiya"
                  />
                </div>
              </div>
            </div>
          </div>
        )

      case 'orderForm':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Section Title
              </label>
              <input
                type="text"
                value={editingContent.title || currentContent.title || ''}
                onChange={(e) => setEditingContent({...editingContent, title: e.target.value})}
                className={inputStyles}
                placeholder="অর্ডার করুন"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Subtitle
              </label>
              <input
                type="text"
                value={editingContent.subtitle || currentContent.subtitle || ''}
                onChange={(e) => setEditingContent({...editingContent, subtitle: e.target.value})}
                className={inputStyles}
                placeholder="নিচের ফর্মটি পূরণ করে আপনার অর্ডার সম্পন্ন করুন"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Single Package Price (৳)
                </label>
                <input
                  type="number"
                  value={editingContent.singlePrice || currentContent.singlePrice || ''}
                  onChange={(e) => setEditingContent({...editingContent, singlePrice: parseInt(e.target.value)})}
                  className={inputStyles}
                  placeholder="890"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Bundle Package Price (৳)
                </label>
                <input
                  type="number"
                  value={editingContent.bundlePrice || currentContent.bundlePrice || ''}
                  onChange={(e) => setEditingContent({...editingContent, bundlePrice: parseInt(e.target.value)})}
                  className={inputStyles}
                  placeholder="1650"
                />
              </div>
            </div>
          </div>
        )

      default:
        return (
          <div className="text-center py-12">
            <Edit className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">Editor Coming Soon</h3>
            <p className="text-gray-500">Custom editor for this section is being developed.</p>
          </div>
        )
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading content...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Website Content Editor</h2>
          <p className="text-gray-600">Edit content for any section of the website</p>
        </div>
        
        <button
          onClick={fetchWebsiteContent}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Section Selector */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">Select Section</h3>
            <div className="space-y-2">
              {Object.entries(sectionLabels).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => {
                    setActiveSection(key)
                    setEditingContent({})
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    activeSection === key
                      ? 'bg-emerald-100 text-emerald-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Editor */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-800">
                Edit {sectionLabels[activeSection as keyof typeof sectionLabels]}
              </h3>
              
              <div className="flex gap-2">
                <button
                  onClick={() => window.open('/', '_blank')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  Preview
                </button>
                
                <button
                  onClick={updateSectionContent}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>

            {renderContentEditor()}
          </div>
        </div>
      </div>
    </div>
  )
}