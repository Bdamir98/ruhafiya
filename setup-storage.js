const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase configuration');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Storage bucket configurations
const STORAGE_BUCKETS = [
  {
    name: 'product-images',
    public: true,
    allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
    fileSizeLimit: 5242880 // 5MB
  },
  {
    name: 'testimonial-images',
    public: true,
    allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
    fileSizeLimit: 5242880 // 5MB
  },
  {
    name: 'hero-images',
    public: true,
    allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
    fileSizeLimit: 5242880 // 5MB
  },
  {
    name: 'general-media',
    public: true,
    allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
    fileSizeLimit: 5242880 // 5MB
  }
];

async function createStorageBuckets() {
  console.log('🚀 Setting up Supabase Storage buckets...\n');

  for (const bucketConfig of STORAGE_BUCKETS) {
    try {
      console.log(`Creating bucket: ${bucketConfig.name}`);
      
      const { data, error } = await supabase.storage.createBucket(bucketConfig.name, {
        public: bucketConfig.public,
        allowedMimeTypes: bucketConfig.allowedMimeTypes,
        fileSizeLimit: bucketConfig.fileSizeLimit
      });

      if (error) {
        if (error.message.includes('already exists')) {
          console.log(`✅ Bucket '${bucketConfig.name}' already exists`);
        } else {
          console.error(`❌ Error creating bucket '${bucketConfig.name}':`, error.message);
        }
      } else {
        console.log(`✅ Successfully created bucket '${bucketConfig.name}'`);
      }
    } catch (error) {
      console.error(`❌ Error creating bucket '${bucketConfig.name}':`, error.message);
    }
  }
}

async function setupStoragePolicies() {
  console.log('\n🔐 Setting up storage policies...\n');

  const policies = [
    // Public read access policy
    `
    CREATE POLICY IF NOT EXISTS "Public read access" ON storage.objects
    FOR SELECT USING (bucket_id IN ('product-images', 'testimonial-images', 'hero-images', 'general-media'));
    `,
    
    // Public upload policy (you might want to restrict this to authenticated users)
    `
    CREATE POLICY IF NOT EXISTS "Public upload access" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id IN ('product-images', 'testimonial-images', 'hero-images', 'general-media'));
    `,
    
    // Public update policy
    `
    CREATE POLICY IF NOT EXISTS "Public update access" ON storage.objects
    FOR UPDATE USING (bucket_id IN ('product-images', 'testimonial-images', 'hero-images', 'general-media'));
    `,
    
    // Public delete policy
    `
    CREATE POLICY IF NOT EXISTS "Public delete access" ON storage.objects
    FOR DELETE USING (bucket_id IN ('product-images', 'testimonial-images', 'hero-images', 'general-media'));
    `
  ];

  for (const policy of policies) {
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: policy });
      
      if (error) {
        console.error('❌ Error creating policy:', error.message);
      } else {
        console.log('✅ Storage policy created successfully');
      }
    } catch (error) {
      console.error('❌ Error creating policy:', error.message);
    }
  }
}

async function main() {
  try {
    await createStorageBuckets();
    
    console.log('\n📋 Storage setup completed!');
    console.log('\n📝 Next steps:');
    console.log('1. Go to your Supabase dashboard > Storage');
    console.log('2. Verify that the buckets were created successfully');
    console.log('3. Set up RLS policies manually in the SQL editor if needed:');
    console.log('   - Go to SQL Editor in Supabase dashboard');
    console.log('   - Run the following SQL commands:');
    console.log(`
-- Enable RLS on storage buckets
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy for public read access
CREATE POLICY IF NOT EXISTS "Public read access" ON storage.objects
FOR SELECT USING (bucket_id IN ('product-images', 'testimonial-images', 'hero-images', 'general-media'));

-- Policy for public upload access
CREATE POLICY IF NOT EXISTS "Public upload access" ON storage.objects
FOR INSERT WITH CHECK (bucket_id IN ('product-images', 'testimonial-images', 'hero-images', 'general-media'));

-- Policy for public update access
CREATE POLICY IF NOT EXISTS "Public update access" ON storage.objects
FOR UPDATE USING (bucket_id IN ('product-images', 'testimonial-images', 'hero-images', 'general-media'));

-- Policy for public delete access
CREATE POLICY IF NOT EXISTS "Public delete access" ON storage.objects
FOR DELETE USING (bucket_id IN ('product-images', 'testimonial-images', 'hero-images', 'general-media'));
    `);
    
    console.log('\n🎉 You can now upload images through the admin panel!');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

main();