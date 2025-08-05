const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupAdmin() {
  try {
    console.log('Setting up admin user...');
    
    // First, check if admin user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', 'admin@ruhafiya.com')
      .single();

    if (existingUser) {
      console.log('Admin user already exists:', existingUser);
      return;
    }

    // Generate password hash
    const password = 'admin123';
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    console.log('Generated password hash:', passwordHash);

    // Insert admin user
    const { data, error } = await supabase
      .from('admin_users')
      .insert([
        {
          email: 'admin@ruhafiya.com',
          password_hash: passwordHash
        }
      ])
      .select();

    if (error) {
      console.error('Error inserting admin user:', error);
    } else {
      console.log('Admin user created successfully:', data);
    }

  } catch (error) {
    console.error('Setup error:', error);
  }
}

setupAdmin();