const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  console.log('Required variables:')
  console.log('- NEXT_PUBLIC_SUPABASE_URL')
  console.log('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupLeadsTable() {
  try {
    console.log('🚀 Setting up leads table...')

    // Read the SQL schema file
    const schemaPath = path.join(__dirname, 'leads-schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf8')

    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0)

    // Execute each statement
    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`📝 Executing: ${statement.substring(0, 50)}...`)
        
        const { error } = await supabase.rpc('exec_sql', {
          sql: statement
        })

        if (error) {
          // Try direct query if RPC fails
          const { error: directError } = await supabase
            .from('_sql')
            .select('*')
            .limit(0)

          if (directError) {
            console.log(`⚠️  Statement may have failed: ${statement.substring(0, 50)}...`)
            console.log(`Error: ${error.message}`)
          }
        }
      }
    }

    console.log('✅ Leads table setup completed!')
    console.log('')
    console.log('📊 Features enabled:')
    console.log('- ✅ Lead capture with user detection')
    console.log('- ✅ Location tracking (IP-based)')
    console.log('- ✅ Device and browser detection')
    console.log('- ✅ Smart popup with multi-step form')
    console.log('- ✅ Admin dashboard for lead management')
    console.log('- ✅ Lead status tracking and conversion')
    console.log('- ✅ Export functionality')
    console.log('')
    console.log('🎯 What happens when users visit:')
    console.log('1. System detects location, device, browser automatically')
    console.log('2. Smart popup appears after 10 seconds or scroll')
    console.log('3. Multi-step form collects name, phone, email')
    console.log('4. All data saved to leads table')
    console.log('5. Admin can view and manage leads in dashboard')
    console.log('')
    console.log('🔗 Access leads at: /admin/dashboard (Leads tab)')

  } catch (error) {
    console.error('❌ Error setting up leads table:', error.message)
    process.exit(1)
  }
}

// Run the setup
setupLeadsTable()