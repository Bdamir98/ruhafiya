'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Database, Play, CheckCircle, AlertCircle, Copy } from 'lucide-react'

const SQL_SETUP = `-- Create hero_slides table for managing slider content
CREATE TABLE IF NOT EXISTS hero_slides (
  id SERIAL PRIMARY KEY,
  slide_order INTEGER NOT NULL DEFAULT 1,
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  highlight VARCHAR(255) NOT NULL,
  background_image TEXT,
  gradient_colors VARCHAR(255) DEFAULT 'from-emerald-600 via-teal-500 to-blue-600',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default slides
INSERT INTO hero_slides (slide_order, title, subtitle, description, highlight, gradient_colors) VALUES
(1, 'রুহাফিয়া', 'প্রাকৃতিক ব্যথা নিরাময়ের তেল', '১৫-২০ দিন নিয়মিত ব্যবহার করলে হাটু ব্যথা, কাধ ব্যথা, বাত ব্যথা, কোমর ব্যথা সহ সকল ব্যথা দূর হবে ইনশাল্লাহ', 'BCSIR কর্তৃক পরীক্ষিত', 'from-emerald-600 via-teal-500 to-blue-600'),
(2, 'দ্রুত ব্যথা নিরাময়', 'মাত্র ১৫ দিনে ফলাফল', 'প্রাকৃতিক উপাদানে তৈরি রুহাফিয়া তেল ব্যবহারে দ্রুত ব্যথা থেকে মুক্তি পান। হাজারো গ্রাহকের বিশ্বস্ত পছন্দ।', '১০০% প্রাকৃতিক উপাদান', 'from-purple-600 via-pink-500 to-red-500'),
(3, 'বিশেষ ছাড়ে', 'সীমিত সময়ের অফার', 'এখনই অর্ডার করুন এবং পান বিশেষ ছাড়! ফ্রি হোম ডেলিভারি সহ। আর দেরি না করে আজই নিয়ে নিন আপনার ব্যথার সমাধান।', '৩০% পর্যন্ত ছাড়', 'from-orange-600 via-red-500 to-pink-600');

-- Enable RLS
ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Public read access" ON hero_slides FOR SELECT USING (true);

-- Create policy for public write access (for admin panel)
CREATE POLICY "Public write access" ON hero_slides FOR ALL USING (true);`

interface DatabaseSetupProps {
  onSetupComplete?: () => void
}

export default function DatabaseSetup({ onSetupComplete }: DatabaseSetupProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(SQL_SETUP)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
          <div className="flex items-center gap-3">
            <Database className="w-6 h-6 text-white" />
            <div>
              <h2 className="text-xl font-bold text-white">Database Setup Required</h2>
              <p className="text-blue-100 text-sm">Create the hero_slides table to get started</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-6">
            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">Setup Instructions</h3>
                  <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                    <li>Go to your <strong>Supabase Dashboard</strong></li>
                    <li>Navigate to <strong>SQL Editor</strong> (left sidebar)</li>
                    <li>Copy the SQL code below</li>
                    <li>Paste it in the SQL Editor</li>
                    <li>Click <strong>"Run"</strong> to execute</li>
                    <li>Refresh this page to start managing slides</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* SQL Code */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">SQL Setup Code</h3>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy SQL
                    </>
                  )}
                </button>
              </div>

              <div className="relative">
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm leading-relaxed">
                  <code>{SQL_SETUP}</code>
                </pre>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Quick Links</h3>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  <Database className="w-4 h-4" />
                  Open Supabase Dashboard
                </a>
                
                <button
                  onClick={() => window.location.reload()}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <Play className="w-4 h-4" />
                  Refresh Page After Setup
                </button>
              </div>
            </div>

            {/* Features Preview */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3">What You'll Get After Setup</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>3 pre-configured hero slides</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Different gradient backgrounds</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Bengali content ready</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Image upload capability</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Drag & drop reordering</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Smooth animations</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}