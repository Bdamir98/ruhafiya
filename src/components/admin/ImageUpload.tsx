'use client'

import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import { STORAGE_BUCKETS } from '@/lib/storage'

interface ImageUploadProps {
  currentImage?: string
  onImageChange: (imageUrl: string | null) => void
  bucket: string
  folder?: string
  className?: string
  label?: string
}

export default function ImageUpload({
  currentImage,
  onImageChange,
  bucket,
  folder,
  className = '',
  label = 'Upload Image'
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    setIsUploading(true)
    setError(null)

    try {
      // Create FormData for API upload
      const formData = new FormData()
      formData.append('file', file)
      formData.append('bucket', bucket)
      if (folder) {
        formData.append('folder', folder)
      }

      // Upload via API route (uses service role key, bypasses RLS)
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()
      
      if (result.success && result.url) {
        onImageChange(result.url)
      } else {
        setError(result.error || 'Upload failed')
      }
    } catch (error) {
      setError('Upload failed')
      console.error('Upload error:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }

  const handleRemoveImage = () => {
    onImageChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      {/* Current Image Display */}
      {currentImage && (
        <div className="relative inline-block">
          <img
            src={currentImage}
            alt="Current image"
            className="w-32 h-32 object-cover rounded-lg border border-gray-200"
          />
          <button
            onClick={handleRemoveImage}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${isUploading ? 'pointer-events-none opacity-50' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
        />

        {isUploading ? (
          <div className="flex flex-col items-center">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
            <p className="text-sm text-gray-600">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg mb-3">
              {currentImage ? (
                <ImageIcon className="w-6 h-6 text-gray-600" />
              ) : (
                <Upload className="w-6 h-6 text-gray-600" />
              )}
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">
              {currentImage ? 'Change Image' : 'Upload Image'}
            </p>
            <p className="text-xs text-gray-500">
              Drag and drop or click to select
            </p>
            <p className="text-xs text-gray-400 mt-1">
              PNG, JPG, WebP up to 5MB
            </p>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
          {error}
        </div>
      )}
    </div>
  )
}

// Preset configurations for different image types
export const ImageUploadPresets = {
  ProductImage: (props: Omit<ImageUploadProps, 'bucket' | 'folder'>) => (
    <ImageUpload
      {...props}
      bucket={STORAGE_BUCKETS.PRODUCT_IMAGES}
      folder="products"
      label="Product Image"
    />
  ),
  
  TestimonialImage: (props: Omit<ImageUploadProps, 'bucket' | 'folder'>) => (
    <ImageUpload
      {...props}
      bucket={STORAGE_BUCKETS.TESTIMONIAL_IMAGES}
      folder="testimonials"
      label="Customer Photo"
    />
  ),
  
  HeroImage: (props: Omit<ImageUploadProps, 'bucket' | 'folder'>) => (
    <ImageUpload
      {...props}
      bucket={STORAGE_BUCKETS.HERO_IMAGES}
      folder="hero"
      label="Hero Image"
    />
  ),
  
  GeneralImage: (props: Omit<ImageUploadProps, 'bucket' | 'folder'>) => (
    <ImageUpload
      {...props}
      bucket={STORAGE_BUCKETS.GENERAL_MEDIA}
      folder="general"
      label="Image"
    />
  )
}