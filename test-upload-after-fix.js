const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Use the same client configuration as your frontend
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testUpload() {
  console.log('🧪 Testing upload with anon key (same as frontend)...\n');

  try {
    // Create a simple PNG buffer (1x1 pixel)
    const pngBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00, 0x00, 0x00,
      0x0D, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9C, 0x63, 0xF8, 0x0F, 0x00, 0x01,
      0x01, 0x01, 0x00, 0x18, 0xDD, 0x8D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);

    console.log('📤 Attempting upload to hero-images bucket...');
    
    const fileName = `test-${Date.now()}.png`;
    const { data, error } = await supabase.storage
      .from('hero-images')
      .upload(`test/${fileName}`, pngBuffer, {
        contentType: 'image/png',
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('❌ Upload failed:', error);
      console.log('\n🚨 RLS POLICY STILL BLOCKING!');
      console.log('📝 Please follow the instructions in STORAGE_FIX_INSTRUCTIONS.md');
      console.log('\n💡 Quick fix: Run this SQL in Supabase SQL Editor:');
      console.log('ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;');
      console.log('ALTER TABLE storage.buckets DISABLE ROW LEVEL SECURITY;');
      return false;
    }

    console.log('✅ Upload successful!', data);
    
    // Test getting public URL
    const { data: urlData } = supabase.storage
      .from('hero-images')
      .getPublicUrl(data.path);
    
    console.log('🔗 Public URL:', urlData.publicUrl);
    
    // Clean up test file
    console.log('🧹 Cleaning up test file...');
    await supabase.storage
      .from('hero-images')
      .remove([data.path]);
    
    console.log('🎉 Storage is working correctly!');
    console.log('✅ You can now upload images in the admin panel!');
    return true;

  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

async function checkBuckets() {
  console.log('📦 Checking bucket configuration...');
  
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('❌ Cannot list buckets:', error);
      return;
    }
    
    console.log('📋 Available buckets:');
    buckets.forEach(bucket => {
      console.log(`  - ${bucket.name} (public: ${bucket.public})`);
    });
    
  } catch (error) {
    console.error('❌ Bucket check failed:', error);
  }
}

async function main() {
  await checkBuckets();
  console.log('\n' + '='.repeat(50));
  const success = await testUpload();
  
  if (!success) {
    console.log('\n📋 NEXT STEPS:');
    console.log('1. Go to Supabase Dashboard → SQL Editor');
    console.log('2. Run: ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;');
    console.log('3. Run this test again: node test-upload-after-fix.js');
    console.log('4. Try uploading in admin panel');
  }
}

main();