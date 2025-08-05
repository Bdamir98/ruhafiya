const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

async function getFetch() {
  const { default: fetch } = await import('node-fetch');
  return fetch;
}

async function testAPIUpload() {
  console.log('🧪 Testing API upload route...\n');

  try {
    const fetch = await getFetch();
    // Create a simple test image buffer (1x1 PNG)
    const pngBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00, 0x00, 0x00,
      0x0D, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9C, 0x63, 0xF8, 0x0F, 0x00, 0x01,
      0x01, 0x01, 0x00, 0x18, 0xDD, 0x8D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);

    // Create form data
    const formData = new FormData();
    formData.append('file', pngBuffer, {
      filename: 'test-image.png',
      contentType: 'image/png'
    });
    formData.append('bucket', 'hero-images');
    formData.append('folder', 'test');

    console.log('📤 Sending request to /api/upload...');

    // Make request to API
    const response = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();

    if (response.ok && result.success) {
      console.log('✅ API upload successful!');
      console.log('🔗 Image URL:', result.url);
      console.log('📁 File path:', result.path);
      console.log('\n🎉 Your admin panel image uploads should now work!');
      return true;
    } else {
      console.error('❌ API upload failed:', result);
      console.log('\n📋 Troubleshooting:');
      console.log('1. Make sure your Next.js dev server is running (npm run dev)');
      console.log('2. Check that SUPABASE_SERVICE_ROLE_KEY is set in .env.local');
      console.log('3. Verify the API route was created correctly');
      return false;
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n📋 Possible issues:');
    console.log('1. Next.js dev server not running');
    console.log('2. Missing dependencies (run: npm install form-data node-fetch)');
    console.log('3. Network connectivity issues');
    return false;
  }
}

// Check if dev server is running first
async function checkDevServer() {
  try {
    const fetch = await getFetch();
    const response = await fetch('http://localhost:3000/api/upload', {
      method: 'GET'
    });
    return true;
  } catch (error) {
    console.log('❌ Next.js dev server not running');
    console.log('📝 Please run: npm run dev');
    console.log('   Then try this test again');
    return false;
  }
}

async function main() {
  console.log('🔍 Checking if Next.js dev server is running...');
  
  const serverRunning = await checkDevServer();
  if (!serverRunning) {
    return;
  }
  
  console.log('✅ Dev server is running\n');
  await testAPIUpload();
}

main();