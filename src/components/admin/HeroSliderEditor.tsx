'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Save, Edit, Eye, RefreshCw, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react'
import { ImageUploadPresets } from './ImageUpload'
import { useToast, ToastContainer } from '../ui/Toast'
import ConfirmDialog from '../ui/ConfirmDialog'
import DatabaseSetup from './DatabaseSetup'

interface HeroSlide {
  id?: number
  slide_order: number
  title: string
  subtitle: string
  description: string
  highlight: string
  background_image?: string
  gradient_colors: string
  is_active: boolean
}

const gradientOptions = [
  { name: 'Emerald to Blue', value: 'from-emerald-600 via-teal-500 to-blue-600' },
  { name: 'Purple to Red', value: 'from-purple-600 via-pink-500 to-red-500' },
  { name: 'Orange to Pink', value: 'from-orange-600 via-red-500 to-pink-600' },
  { name: 'Blue to Purple', value: 'from-blue-600 via-indigo-500 to-purple-600' },
  { name: 'Green to Teal', value: 'from-green-600 via-emerald-500 to-teal-600' },
  { name: 'Red to Orange', value: 'from-red-600 via-orange-500 to-yellow-600' }
]

export default function HeroSliderEditor() {
  const [slides, setSlides] = useState<HeroSlide[]>([])
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; slideId?: number; slideName?: string }>({ isOpen: false })
  const [deleting, setDeleting] = useState(false)
  const [tableExists, setTableExists] = useState(true)
  
  const toast = useToast()

  // Common input field styles
  const inputStyles = "w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 placeholder-gray-600 text-gray-800 bg-gray-50 hover:bg-white transition-colors"
  const textareaStyles = "w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 placeholder-gray-600 text-gray-800 bg-gray-50 hover:bg-white transition-colors resize-vertical"

  useEffect(() => {
    fetchSlides()
  }, [])

  const fetchSlides = async () => {
    try {
      const response = await fetch('/api/hero-slides')
      const data = await response.json()
      
      if (data.success) {
        setSlides(data.slides || [])
        setTableExists(true)
      } else {
        console.error('Error fetching slides:', data.error)
        if (data.error?.includes('relation "hero_slides" does not exist') || 
            data.error?.includes('relation "public.hero_slides" does not exist') ||
            data.error?.includes('table "hero_slides" does not exist') ||
            data.error?.code === '42P01') {
          setTableExists(false)
        } else {
          toast.error(
            'Failed to Load Slides',
            data.error || 'Unable to fetch slides from database.'
          )
        }
      }
    } catch (error) {
      console.error('Error fetching slides:', error)
      toast.error(
        'Connection Error',
        'Unable to connect to the database. Please check your connection.'
      )
    } finally {
      setLoading(false)
    }
  }

  const saveSlide = async (slide: HeroSlide) => {
    setSaving(true)
    
    try {
      const method = slide.id ? 'PUT' : 'POST'
      const response = await fetch('/api/hero-slides', {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(slide)
      })

      const data = await response.json()
      
      if (data.success) {
        await fetchSlides() // Refresh the list
        setEditingSlide(null)
        setShowAddForm(false)
        toast.success(
          slide.id ? 'Slide Updated' : 'Slide Created',
          slide.id ? 'Slide has been updated successfully!' : 'New slide has been created successfully!'
        )
      } else {
        toast.error(
          'Save Failed',
          data.error || 'Failed to save slide. Please try again.'
        )
      }
    } catch (error) {
      console.error('Error saving slide:', error)
      toast.error(
        'Save Failed',
        'An unexpected error occurred. Please check if the database table exists and try again.'
      )
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteClick = (slide: HeroSlide) => {
    if (!slide.id) return
    setDeleteConfirm({
      isOpen: true,
      slideId: slide.id,
      slideName: slide.title
    })
  }

  const confirmDelete = async () => {
    if (!deleteConfirm.slideId) return
    
    setDeleting(true)
    
    try {
      const response = await fetch(`/api/hero-slides?id=${deleteConfirm.slideId}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      
      if (data.success) {
        await fetchSlides()
        toast.success('Slide Deleted', 'Slide has been deleted successfully!')
        setDeleteConfirm({ isOpen: false })
      } else {
        toast.error('Delete Failed', data.error || 'Failed to delete slide. Please try again.')
      }
    } catch (error) {
      console.error('Error deleting slide:', error)
      toast.error('Delete Failed', 'An unexpected error occurred. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  const moveSlide = async (slideId: number, direction: 'up' | 'down') => {
    const slideIndex = slides.findIndex(s => s.id === slideId)
    if (slideIndex === -1) return

    const newIndex = direction === 'up' ? slideIndex - 1 : slideIndex + 1
    if (newIndex < 0 || newIndex >= slides.length) return

    const newSlides = [...slides]
    const [movedSlide] = newSlides.splice(slideIndex, 1)
    if (!movedSlide) return
    newSlides.splice(newIndex, 0, movedSlide)

    // Update slide orders
    const updatedSlides = newSlides.map((slide, index) => ({
      ...slide,
      slide_order: index + 1
    }))

    setSlides(updatedSlides)

    // Save the new order
    try {
      for (const slide of updatedSlides) {
        await fetch('/api/hero-slides', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(slide)
        })
      }
    } catch (error) {
      console.error('Error updating slide order:', error)
      fetchSlides() // Revert on error
    }
  }

  const SlideForm = ({ slide, onSave, onCancel }: {
    slide: HeroSlide
    onSave: (slide: HeroSlide) => void
    onCancel: () => void
  }) => {
    const [formData, setFormData] = useState<HeroSlide>(slide)

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
      >
        <h3 className="text-xl font-semibold text-gray-800 mb-6">
          {slide.id ? 'Edit Slide' : 'Add New Slide'}
        </h3>

        <div className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={inputStyles}
              placeholder="Ruhafiya"
            />
          </div>

          {/* Subtitle */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Subtitle
            </label>
            <input
              type="text"
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              className={inputStyles}
              placeholder="প্রাকৃতিক ব্যথা নিরাময়ের তেল"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={textareaStyles}
              placeholder="১৫-২০ দিন নিয়মিত ব্যবহার করলে..."
            />
          </div>

          {/* Highlight */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Highlight Badge
            </label>
            <input
              type="text"
              value={formData.highlight}
              onChange={(e) => setFormData({ ...formData, highlight: e.target.value })}
              className={inputStyles}
              placeholder="BCSIR কর্তৃক পরীক্ষিত"
            />
          </div>

          {/* Gradient Colors */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Background Gradient
            </label>
            <select
              value={formData.gradient_colors}
              onChange={(e) => setFormData({ ...formData, gradient_colors: e.target.value })}
              className={inputStyles}
            >
              {gradientOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.name}
                </option>
              ))}
            </select>
            
            {/* Gradient Preview */}
            <div className={`mt-2 h-16 rounded-lg bg-gradient-to-r ${formData.gradient_colors}`}></div>
          </div>

          {/* Background Image */}
          <div>
            <ImageUploadPresets.HeroImage
              currentImage={formData.background_image || ''}
              onImageChange={(imageUrl) => {
                const updatedData = { ...formData }
                if (imageUrl) {
                  updatedData.background_image = imageUrl
                } else {
                  delete updatedData.background_image
                }
                setFormData(updatedData)
              }}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={() => onSave(formData)}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Slide'}
            </button>
            
            <button
              onClick={onCancel}
              className="flex items-center gap-2 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </motion.div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading slides...</p>
        </div>
      </div>
    )
  }

  // Show setup component if table doesn't exist
  if (!tableExists) {
    return (
      <>
        <DatabaseSetup onSetupComplete={fetchSlides} />
        <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
      </>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Hero Slider Management</h2>
          <p className="text-gray-600">Manage hero slider content and images</p>
        </div>
        
        <div className="flex gap-4">
          <button
            onClick={fetchSlides}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Slide
          </button>
        </div>
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {showAddForm && (
          <SlideForm
            slide={{
              slide_order: slides.length + 1,
              title: '',
              subtitle: '',
              description: '',
              highlight: '',
              gradient_colors: 'from-emerald-600 via-teal-500 to-blue-600',
              is_active: true
            }}
            onSave={saveSlide}
            onCancel={() => setShowAddForm(false)}
          />
        )}
      </AnimatePresence>

      {/* Slides List */}
      <div className="space-y-4">
        {slides.map((slide, index) => (
          <motion.div
            key={slide.id}
            layout
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            {editingSlide?.id === slide.id && editingSlide ? (
              <SlideForm
                slide={editingSlide}
                onSave={saveSlide}
                onCancel={() => setEditingSlide(null)}
              />
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-16 h-10 rounded bg-gradient-to-r ${slide.gradient_colors}`}></div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{slide.title}</h3>
                      <p className="text-sm text-gray-600">{slide.subtitle}</p>
                    </div>
                    {slide.background_image && (
                      <img
                        src={slide.background_image}
                        alt="Slide background"
                        className="w-16 h-10 object-cover rounded border"
                      />
                    )}
                  </div>
                  <p className="text-gray-700 text-sm line-clamp-2">{slide.description}</p>
                  <div className="mt-2">
                    <span className="inline-block px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded">
                      {slide.highlight}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {/* Move buttons */}
                  <button
                    onClick={() => moveSlide(slide.id!, 'up')}
                    disabled={index === 0}
                    className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => moveSlide(slide.id!, 'down')}
                    disabled={index === slides.length - 1}
                    className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>

                  {/* Edit button */}
                  <button
                    onClick={() => setEditingSlide(slide)}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>

                  {/* Delete button */}
                  <button
                    onClick={() => handleDeleteClick(slide)}
                    className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {slides.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Eye className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">No slides found</h3>
          <p className="text-gray-500 mb-4">Create your first hero slide to get started.</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors mx-auto"
          >
            <Plus className="w-4 h-4" />
            Add First Slide
          </button>
        </div>
      )}

      {/* Toast Container */}
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false })}
        onConfirm={confirmDelete}
        title="Delete Slide"
        message={`Are you sure you want to delete the slide "${deleteConfirm.slideName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        loading={deleting}
      />
    </div>
  )
}