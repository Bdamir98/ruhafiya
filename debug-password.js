const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugPassword() {
  try {
    console.log('Debugging password issue...');
    
    // Get the current admin user from database
    const { data: adminUser, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', 'admin@ruhafiya.com')
      .single();

    if (error || !adminUser) {
      console.error('Admin user not found:', error);
      return;
    }

    console.log('Admin user found:');
    console.log('Email:', adminUser.email);
    console.log('Password hash in DB:', adminUser.password_hash);
    console.log('Hash length:', adminUser.password_hash.length);

    // Test password comparison
    const testPassword = 'admin123';
    console.log('\nTesting password:', testPassword);
    
    const isValid = await bcrypt.compare(testPassword, adminUser.password_hash);
    console.log('Password comparison result:', isValid);

    // Generate a new hash for comparison
    const newHash = await bcrypt.hash(testPassword, 12);
    console.log('\nNew hash generated:', newHash);
    
    const isNewHashValid = await bcrypt.compare(testPassword, newHash);
    console.log('New hash comparison result:', isNewHashValid);

    // If the current hash is invalid, update it
    if (!isValid) {
      console.log('\nCurrent hash is invalid. Updating with new hash...');
      
      const { data: updateData, error: updateError } = await supabase
        .from('admin_users')
        .update({ password_hash: newHash })
        .eq('email', 'admin@ruhafiya.com')
        .select();

      if (updateError) {
        console.error('Error updating password hash:', updateError);
      } else {
        console.log('Password hash updated successfully:', updateData);
      }
    }

  } catch (error) {
    console.error('Debug error:', error);
  }
}

debugPassword();