import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export function createSupabaseClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// Database Types
export interface Order {
  id: string
  customer_name: string
  customer_phone: string
  customer_address: string
  product_quantity: number
  total_amount: number
  status: 'pending' | 'paid' | 'completed'
  created_at: string
  updated_at: string
}

export interface WebsiteContent {
  id: string
  section: string
  content: any
  updated_at: string
}

export interface AdminUser {
  id: string
  email: string
  password_hash: string
  created_at: string
}