import { z } from 'zod'

// Input sanitization utility
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .slice(0, 1000) // Limit length
}

// Phone number validation for Bangladesh
export const bangladeshPhoneRegex = /^(\+88)?01[3-9]\d{8}$/

// Validation schemas
export const leadCaptureSchema = z.object({
  name: z.string()
    .min(2, 'নাম কমপক্ষে ২ অক্ষরের হতে হবে')
    .max(50, 'নাম সর্বোচ্চ ৫০ অক্ষরের হতে পারে')
    .regex(/^[a-zA-Z\u0980-\u09FF\s]+$/, 'নামে শুধুমাত্র অক্ষর এবং স্পেস থাকতে পারে'),
  
  phone: z.string()
    .regex(bangladeshPhoneRegex, 'সঠিক বাংলাদেশি ফোন নম্বর দিন (যেমন: 01712345678)'),
  
  email: z.string()
    .email('সঠিক ইমেইল ঠিকানা দিন')
    .optional()
    .or(z.literal('')),
  
  interest: z.enum(['general', 'product', 'consultation', 'bulk_order'])
})

export const orderFormSchema = z.object({
  customer_name: z.string()
    .min(2, 'নাম কমপক্ষে ২ অক্ষরের হতে হবে')
    .max(100, 'নাম সর্বোচ্চ ১০০ অক্ষরের হতে পারে'),
  
  customer_phone: z.string()
    .regex(bangladeshPhoneRegex, 'সঠিক বাংলাদেশি ফোন নম্বর দিন'),
  
  customer_email: z.string()
    .email('সঠিক ইমেইল ঠিকানা দিন')
    .optional()
    .or(z.literal('')),
  
  customer_address: z.string()
    .min(10, 'ঠিকানা কমপক্ষে ১০ অক্ষরের হতে হবে')
    .max(500, 'ঠিকানা সর্বোচ্চ ৫০০ অক্ষরের হতে পারে'),
  
  product_quantity: z.number()
    .min(1, 'কমপক্ষে ১টি পণ্য অর্ডার করতে হবে')
    .max(100, 'একবারে সর্বোচ্চ ১০০টি পণ্য অর্ডার করা যাবে'),
  
  special_instructions: z.string()
    .max(1000, 'বিশেষ নির্দেশনা সর্বোচ্চ ১০০০ অক্ষরের হতে পারে')
    .optional()
})

export const adminLoginSchema = z.object({
  email: z.string()
    .email('সঠিক ইমেইল ঠিকানা দিন')
    .min(1, 'ইমেইল প্রয়োজন'),
  
  password: z.string()
    .min(6, 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে')
    .min(1, 'পাসওয়ার্ড প্রয়োজন')
})

// Rate limiting utility
export class RateLimiter {
  private requests: Map<string, number[]> = new Map()
  
  constructor(
    private maxRequests: number = 10,
    private windowMs: number = 60000 // 1 minute
  ) {}
  
  isAllowed(identifier: string): boolean {
    const now = Date.now()
    const requests = this.requests.get(identifier) || []
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < this.windowMs)
    
    if (validRequests.length >= this.maxRequests) {
      return false
    }
    
    validRequests.push(now)
    this.requests.set(identifier, validRequests)
    return true
  }
  
  getRemainingRequests(identifier: string): number {
    const now = Date.now()
    const requests = this.requests.get(identifier) || []
    const validRequests = requests.filter(time => now - time < this.windowMs)
    return Math.max(0, this.maxRequests - validRequests.length)
  }
}

// CSRF token generation and validation
export const generateCSRFToken = (): string => {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export const validateCSRFToken = (token: string, sessionToken: string): boolean => {
  return token === sessionToken && token.length === 64
}

// Input validation helper
export const validateAndSanitize = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } => {
  try {
    // Sanitize string inputs
    const sanitizedData = typeof data === 'object' && data !== null
      ? Object.fromEntries(
          Object.entries(data).map(([key, value]) => [
            key,
            typeof value === 'string' ? sanitizeInput(value) : value
          ])
        )
      : data

    const result = schema.parse(sanitizedData)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => err.message)
      }
    }
    return {
      success: false,
      errors: ['Validation failed']
    }
  }
}

// File upload validation
export const validateFileUpload = (file: File): { valid: boolean; error?: string } => {
  const maxSize = 5 * 1024 * 1024 // 5MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  
  if (file.size > maxSize) {
    return { valid: false, error: 'ফাইলের আকার ৫MB এর বেশি হতে পারবে না' }
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'শুধুমাত্র JPG, PNG, WebP এবং GIF ফাইল আপলোড করা যাবে' }
  }
  
  return { valid: true }
}

export type ValidationResult<T> = ReturnType<typeof validateAndSanitize<T>>