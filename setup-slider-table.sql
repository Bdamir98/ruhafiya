-- Create hero_slides table for managing slider content
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
(1, 'রুহাফিয়া', 'প্রাকৃতিক ব্যথা নিরাময়ের তেল', '১৫-২০ দিন নিয়মিত ব্যবহার করলে হাটু ব্যথা, কাধ ব্যথা, বাত ব্যথা, কোমর ব্যথা সহ সকল ব্যথা দূর হবে ইনশাল্লাহ', 'BCSIR কর্তৃক পরীক্ষ��ত', 'from-emerald-600 via-teal-500 to-blue-600'),
(2, 'দ্রুত ব্যথা নিরাময়', 'মাত্র ১৫ দিনে ফলাফল', 'প্রাকৃতিক উপাদানে তৈরি রুহাফিয়া তেল ব্যবহারে দ্রুত ব্যথা থেকে মুক্তি পান। হাজারো গ্রাহকের বিশ্বস্ত পছন্দ।', '১০০% প্রাকৃতিক উপাদান', 'from-purple-600 via-pink-500 to-red-500'),
(3, 'বিশেষ ছাড়ে', 'সীমিত সময়ের অফার', 'এখনই অর্ডার করুন এবং পান বিশেষ ছাড়! ফ্রি হোম ডেলিভারি সহ। আর দেরি না করে আজই নিয়ে নিন আপনার ব্যথার সমাধান।', '৩০% পর্যন্ত ছাড়', 'from-orange-600 via-red-500 to-pink-600');

-- Enable RLS
ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Public read access" ON hero_slides FOR SELECT USING (true);

-- Create policy for public write access (for admin panel)
CREATE POLICY "Public write access" ON hero_slides FOR ALL USING (true);