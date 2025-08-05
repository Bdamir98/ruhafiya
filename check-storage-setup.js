const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const REQUIRED_BUCKETS = ['product-images', 'testimonial-images', 'hero-images', 'general-media'];

async function checkStorageSetup() {
  console.log('🔍 Checking Supabase Storage setup...\n');

  try {
    // Check if buckets exist
    console.log('📦 Checking storage buckets...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Error fetching buckets:', bucketsError.message);
      return false;
    }

    const existingBuckets = buckets.map(bucket => bucket.name);
    console.log('📋 Existing buckets:', existingBuckets);

    const missingBuckets = REQUIRED_BUCKETS.filter(bucket => !existingBuckets.includes(bucket));
    
    if (missingBuckets.length > 0) {
      console.log('❌ Missing buckets:', missingBuckets);
      console.log('🔧 Creating missing buckets...\n');
      
      for (const bucketName of missingBuckets) {
        try {
          const { error } = await supabase.storage.createBucket(bucketName, {
            public: true,
            allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
            fileSizeLimit: 5242880 // 5MB
          });

          if (error) {
            console.error(`❌ Error creating bucket '${bucketName}':`, error.message);
          } else {
            console.log(`✅ Successfully created bucket '${bucketName}'`);
          }
        } catch (error) {
          console.error(`❌ Error creating bucket '${bucketName}':`, error.message);
        }
      }
    } else {
      console.log('✅ All required buckets exist');
    }

    // Test upload to check RLS policies
    console.log('\n🧪 Testing upload permissions...');
    
    // Create a small test image file (1x1 pixel PNG)
    const testImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
    const testFile = new File([testImageData], 'test.png', { type: 'image/png' });
    
    try {
      const { error: uploadError } = await supabase.storage
        .from('hero-images')
        .upload('test/test-file.png', testFile);

      if (uploadError) {
        console.error('❌ Upload test failed:', uploadError.message);
        
        if (uploadError.message.includes('row-level security policy')) {
          console.log('\n🚨 RLS POLICY ISSUE DETECTED!');
          console.log('📝 You need to run the SQL commands manually in Supabase:');
          console.log('\n1. Go to your Supabase Dashboard');
          console.log('2. Navigate to SQL Editor');
          console.log('3. Run the contents of "fix-storage-policies.sql" file');
          console.log('\nOr copy and paste this SQL:');
          console.log('----------------------------------------');
          console.log(`
-- Enable RLS on storage tables
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Public upload access" ON storage.objects;
DROP POLICY IF EXISTS "Public update access" ON storage.objects;
DROP POLICY IF EXISTS "Public delete access" ON storage.objects;

-- Create new policies for public access
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (bucket_id IN ('product-images', 'testimonial-images', 'hero-images', 'general-media'));

CREATE POLICY "Public upload access" ON storage.objects
FOR INSERT WITH CHECK (bucket_id IN ('product-images', 'testimonial-images', 'hero-images', 'general-media'));

CREATE POLICY "Public update access" ON storage.objects
FOR UPDATE USING (bucket_id IN ('product-images', 'testimonial-images', 'hero-images', 'general-media'));

CREATE POLICY "Public delete access" ON storage.objects
FOR DELETE USING (bucket_id IN ('product-images', 'testimonial-images', 'hero-images', 'general-media'));

-- Bucket-level policy
DROP POLICY IF EXISTS "Public bucket access" ON storage.buckets;
CREATE POLICY "Public bucket access" ON storage.buckets
FOR SELECT USING (id IN ('product-images', 'testimonial-images', 'hero-images', 'general-media'));
          `);
          console.log('----------------------------------------');
        }
        return false;
      } else {
        console.log('✅ Upload test successful');
        
        // Clean up test file
        await supabase.storage
          .from('hero-images')
          .remove(['test/test-file.png']);
        
        console.log('🧹 Test file cleaned up');
      }
    } catch (error) {
      console.error('❌ Upload test error:', error.message);
      return false;
    }

    console.log('\n🎉 Storage setup is working correctly!');
    return true;

  } catch (error) {
    console.error('❌ Setup check failed:', error.message);
    return false;
  }
}

async function main() {
  const isSetupCorrect = await checkStorageSetup();
  
  if (!isSetupCorrect) {
    console.log('\n❌ Storage setup needs attention. Please follow the instructions above.');
    process.exit(1);
  }
  
  console.log('\n✅ Storage setup is complete and working!');
}

main();