const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testStorageUpload() {
  console.log('🧪 Testing storage upload...\n');

  try {
    // Create a simple buffer that represents a 1x1 PNG image
    const pngBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00, 0x00, 0x00,
      0x0D, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9C, 0x63, 0xF8, 0x0F, 0x00, 0x01,
      0x01, 0x01, 0x00, 0x18, 0xDD, 0x8D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);

    console.log('📤 Attempting to upload test image...');
    
    const { data, error } = await supabase.storage
      .from('hero-images')
      .upload('test/test-image.png', pngBuffer, {
        contentType: 'image/png'
      });

    if (error) {
      console.error('❌ Upload failed:', error.message);
      
      if (error.message.includes('row-level security policy') || error.message.includes('Unauthorized')) {
        console.log('\n🚨 RLS POLICY ISSUE DETECTED!');
        console.log('\n📝 SOLUTION: Run this SQL in your Supabase SQL Editor:');
        console.log('=' .repeat(60));
        console.log(`
-- Disable RLS temporarily to test
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
ALTER TABLE storage.buckets DISABLE ROW LEVEL SECURITY;

-- Or create proper policies:
-- Enable RLS
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Public upload access" ON storage.objects;
DROP POLICY IF EXISTS "Public update access" ON storage.objects;
DROP POLICY IF EXISTS "Public delete access" ON storage.objects;
DROP POLICY IF EXISTS "Public bucket access" ON storage.buckets;

-- Create new policies
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (bucket_id IN ('product-images', 'testimonial-images', 'hero-images', 'general-media'));

CREATE POLICY "Public upload access" ON storage.objects
FOR INSERT WITH CHECK (bucket_id IN ('product-images', 'testimonial-images', 'hero-images', 'general-media'));

CREATE POLICY "Public update access" ON storage.objects
FOR UPDATE USING (bucket_id IN ('product-images', 'testimonial-images', 'hero-images', 'general-media'));

CREATE POLICY "Public delete access" ON storage.objects
FOR DELETE USING (bucket_id IN ('product-images', 'testimonial-images', 'hero-images', 'general-media'));

CREATE POLICY "Public bucket access" ON storage.buckets
FOR SELECT USING (id IN ('product-images', 'testimonial-images', 'hero-images', 'general-media'));
        `);
        console.log('=' .repeat(60));
        console.log('\n📍 Steps:');
        console.log('1. Go to https://supabase.com/dashboard');
        console.log('2. Select your project');
        console.log('3. Go to SQL Editor');
        console.log('4. Paste and run the SQL above');
        console.log('5. Try uploading again');
      }
      return false;
    }

    console.log('✅ Upload successful!', data);
    
    // Clean up
    console.log('🧹 Cleaning up test file...');
    await supabase.storage
      .from('hero-images')
      .remove(['test/test-image.png']);
    
    console.log('✅ Test completed successfully!');
    return true;

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
}

testStorageUpload();