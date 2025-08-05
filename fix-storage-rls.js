const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

// Create admin client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixStorageRLS() {
  console.log('🔧 Fixing storage RLS policies...\n');

  try {
    // Method 1: Try to create policies using RPC
    console.log('📝 Attempting to create storage policies...');
    
    const policies = [
      `CREATE POLICY IF NOT EXISTS "Public read" ON storage.objects FOR SELECT USING (true);`,
      `CREATE POLICY IF NOT EXISTS "Public insert" ON storage.objects FOR INSERT WITH CHECK (true);`,
      `CREATE POLICY IF NOT EXISTS "Public update" ON storage.objects FOR UPDATE USING (true);`,
      `CREATE POLICY IF NOT EXISTS "Public delete" ON storage.objects FOR DELETE USING (true);`
    ];

    for (const policy of policies) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: policy });
        if (error) {
          console.log(`⚠️  Policy creation failed: ${error.message}`);
        } else {
          console.log('✅ Policy created successfully');
        }
      } catch (err) {
        console.log(`⚠️  Policy creation error: ${err.message}`);
      }
    }

    // Method 2: Test if we can upload directly
    console.log('\n🧪 Testing direct upload with service role...');
    
    const testBuffer = Buffer.from('test image data');
    const { data, error } = await supabase.storage
      .from('hero-images')
      .upload('test/service-test.txt', testBuffer, {
        contentType: 'text/plain'
      });

    if (error) {
      console.error('❌ Service role upload failed:', error.message);
      
      // Method 3: Try to disable RLS entirely
      console.log('\n🔄 Attempting to disable RLS...');
      try {
        const { error: rlsError } = await supabase.rpc('exec_sql', { 
          sql: 'ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;' 
        });
        
        if (rlsError) {
          console.log('⚠️  Could not disable RLS:', rlsError.message);
          console.log('\n📋 MANUAL SOLUTION REQUIRED:');
          console.log('=' .repeat(50));
          console.log('1. Go to Supabase Dashboard > Storage');
          console.log('2. Click on your bucket (hero-images)');
          console.log('3. Go to "Policies" tab');
          console.log('4. Click "Add Policy"');
          console.log('5. Select "For full customization"');
          console.log('6. Use this policy:');
          console.log('   - Policy name: "Public Access"');
          console.log('   - Allowed operation: ALL');
          console.log('   - Target roles: public');
          console.log('   - USING expression: true');
          console.log('   - WITH CHECK expression: true');
          console.log('=' .repeat(50));
        } else {
          console.log('✅ RLS disabled successfully');
        }
      } catch (err) {
        console.log('⚠️  RLS disable error:', err.message);
      }
    } else {
      console.log('✅ Service role upload successful:', data);
      
      // Clean up
      await supabase.storage.from('hero-images').remove(['test/service-test.txt']);
      console.log('🧹 Test file cleaned up');
    }

  } catch (error) {
    console.error('❌ Fix attempt failed:', error.message);
  }
}

async function createSimpleStoragePolicy() {
  console.log('\n🎯 Creating simple storage policy...');
  
  try {
    // Try the simplest possible policy
    const { error } = await supabase.rpc('exec_sql', { 
      sql: `
        CREATE POLICY IF NOT EXISTS "Allow all operations" 
        ON storage.objects 
        FOR ALL 
        USING (true) 
        WITH CHECK (true);
      ` 
    });

    if (error) {
      console.error('❌ Simple policy creation failed:', error.message);
      return false;
    }

    console.log('✅ Simple policy created successfully');
    return true;
  } catch (error) {
    console.error('❌ Simple policy error:', error.message);
    return false;
  }
}

async function main() {
  await fixStorageRLS();
  await createSimpleStoragePolicy();
  
  console.log('\n📝 If automatic fixes failed, please:');
  console.log('1. Go to Supabase Dashboard > Storage > Policies');
  console.log('2. Create a new policy with these settings:');
  console.log('   - Name: "Public Access"');
  console.log('   - Table: storage.objects');
  console.log('   - Operation: ALL');
  console.log('   - Target roles: public');
  console.log('   - USING: true');
  console.log('   - WITH CHECK: true');
}

main();