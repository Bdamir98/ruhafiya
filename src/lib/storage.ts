import { supabase } from './supabase'

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

// Upload file to storage bucket
export async function uploadFile(
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
        error: validation.error
      }
    }

    // Generate unique filename
    const fileName = generateFileName(file.name)
    const filePath = folder ? `${folder}/${fileName}` : fileName

    // Upload file
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      })

    if (error) {
      console.error('Upload error:', error)
      return {
        success: false,
        error: error.message
      }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path)

    return {
      success: true,
      url: urlData.publicUrl,
      path: data.path
    }
  } catch (error) {
    console.error('Upload error:', error)
    return {
      success: false,
      error: 'Failed to upload file'
    }
  }
}

// Delete file from storage
export async function deleteFile(bucket: string, path: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])

    if (error) {
      console.error('Delete error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Delete error:', error)
    return false
  }
}

// Get public URL for a file
export function getPublicUrl(bucket: string, path: string): string {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)
  
  return data.publicUrl
}

// List files in a bucket folder
export async function listFiles(bucket: string, folder?: string) {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(folder || '', {
        limit: 100,
        offset: 0
      })

    if (error) {
      console.error('List files error:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('List files error:', error)
    return []
  }
}

// Create storage buckets (for setup)
export async function createStorageBuckets() {
  const buckets = Object.values(STORAGE_BUCKETS)
  
  for (const bucketName of buckets) {
    try {
      const { error } = await supabase.storage.createBucket(bucketName, {
        public: true,
        allowedMimeTypes: ALLOWED_IMAGE_TYPES,
        fileSizeLimit: MAX_FILE_SIZE
      })
      
      if (error && !error.message.includes('already exists')) {
        console.error(`Error creating bucket ${bucketName}:`, error)
      } else {
        console.log(`Bucket ${bucketName} created or already exists`)
      }
    } catch (error) {
      console.error(`Error creating bucket ${bucketName}:`, error)
    }
  }
}

// Storage policies setup (SQL commands to run in Supabase)
export const STORAGE_POLICIES_SQL = `
-- Enable RLS on storage buckets
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy for public read access to all buckets
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (bucket_id IN ('product-images', 'testimonial-images', 'hero-images', 'general-media'));

-- Policy for authenticated upload to all buckets
CREATE POLICY "Authenticated upload access" ON storage.objects
FOR INSERT WITH CHECK (bucket_id IN ('product-images', 'testimonial-images', 'hero-images', 'general-media'));

-- Policy for authenticated update/delete
CREATE POLICY "Authenticated update access" ON storage.objects
FOR UPDATE USING (bucket_id IN ('product-images', 'testimonial-images', 'hero-images', 'general-media'));

CREATE POLICY "Authenticated delete access" ON storage.objects
FOR DELETE USING (bucket_id IN ('product-images', 'testimonial-images', 'hero-images', 'general-media'));
`