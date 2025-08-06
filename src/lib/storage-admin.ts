import { createClient } from '@supabase/supabase-js'

// Admin client with service role key (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Storage bucket names
export const STORAGE_BUCKETS = {
  PRODUCT_IMAGES: 'product-images',
  TESTIMONIAL_IMAGES: 'testimonial-images',
  HERO_IMAGES: 'hero-images',
  GENERAL_MEDIA: 'general-media'
} as const

// File upload types
export interface FileUploadResult {
  success: boolean
  url?: string
  error?: string
  path?: string
}

// Allowed file types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

// Validate file before upload
export function validateFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Only JPEG, PNG, WebP, and GIF images are allowed'
    }
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: 'File size must be less than 5MB'
    }
  }

  return { valid: true }
}

// Generate unique filename
function generateFileName(originalName: string): string {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  const extension = originalName.split('.').pop()
  return `${timestamp}_${randomString}.${extension}`
}

// Upload file using admin client (bypasses RLS)
export async function uploadFileAdmin(
  file: File,
  bucket: string,
  folder?: string
): Promise<FileUploadResult> {
  try {
    // Validate file
    const validation = validateFile(file)
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error || 'File validation failed'
      }
    }

    // Generate unique filename
    const fileName = generateFileName(file.name)
    const filePath = folder ? `${folder}/${fileName}` : fileName

    // Upload file using admin client (bypasses RLS)
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      })

    if (error) {
      console.error('Admin upload error:', error)
      return {
        success: false,
        error: error.message
      }
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(data.path)

    return {
      success: true,
      url: urlData.publicUrl,
      path: data.path
    }
  } catch (error) {
    console.error('Admin upload error:', error)
    return {
      success: false,
      error: 'Failed to upload file'
    }
  }
}

// Delete file using admin client
export async function deleteFileAdmin(bucket: string, path: string): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin.storage
      .from(bucket)
      .remove([path])

    if (error) {
      console.error('Admin delete error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Admin delete error:', error)
    return false
  }
}

// Get public URL for a file
export function getPublicUrl(bucket: string, path: string): string {
  const { data } = supabaseAdmin.storage
    .from(bucket)
    .getPublicUrl(path)
  
  return data.publicUrl
}