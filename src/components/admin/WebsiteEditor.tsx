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
          title: 'রুহাফিয়া',
          subtitle: 'প্রাকৃতিক ব্যথা নিরাময়ের তেল',
          description: '১৫-২০ দিন নিয়মিত ব্যবহার করলে হাটু ব্যথা, কাধ ব্যথা, বাত ব্যথা, কোমর ব্যথা সহ সকল ব্যথা দূর হবে ইনশাল্লাহ',
          customerCount: '৭০,০০০+',
          buttonText: 'অর্ডার করুন'
        }
      },
      {
        section: 'benefits',
        content: {
          title: 'রুহাফিয়া তেলের উপকারিতা',
          subtitle: 'প্রাকৃতিক উপাদানে তৈরি, সকল ধরনের ব্যথার জন্য কার্যকর'
        }
      },
      {
        section: 'pricing',
        content: {
          title: 'বিশেষ অফার মূল্য',
          subtitle: 'সীমিত সময়ের জন্য বিশেষ ছাড়',
          singlePrice: 890,
          bundlePrice: 1650
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
                placeholder="রুহাফিয়া"
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
                placeholder="৭০,০০০+"
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
                placeholder="রুহাফিয়া তেলের উপকারিতা"
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