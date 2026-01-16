#!/usr/bin/env node

/**
 * Demo Account Setup Script
 * Creates demo user via Supabase Admin API (recommended method)
 * 
 * Usage: node scripts/setup-demo-account.js
 * 
 * Environment variables required:
 * - SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY (not anon key!)
 * 
 * NOTE: Demo account constants are defined in lib/demo/config.ts
 * Changes to demo credentials should be made there.
 */

const https = require('https');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Demo account details - keep in sync with lib/demo/config.ts
const DEMO_ACCOUNT_EMAIL = 'demo@nuclearflow.com';
const DEMO_ACCOUNT_PASSWORD = 'DemoNuclear2026!';
const DEMO_ACCOUNT_ID = '00000000-0000-0000-0000-000000000001';

const DEMO_USER = {
  email: DEMO_ACCOUNT_EMAIL,
  password: DEMO_ACCOUNT_PASSWORD,
  email_confirm: true,
  user_metadata: {
    full_name: 'Demo User',
    role: 'Hospital Administrator'
  }
};

function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function createDemoUser() {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error('❌ Missing required environment variables:');
    console.error('   - SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL)');
    console.error('   - SUPABASE_SERVICE_ROLE_KEY');
    console.error('\nPlease set these in your .env file or environment.');
    process.exit(1);
  }

  console.log('🚀 Setting up demo account...\n');

  const url = new URL(`${SUPABASE_URL}/auth/v1/admin/users`);
  
  const options = {
    hostname: url.hostname,
    port: 443,
    path: url.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'apikey': SERVICE_ROLE_KEY
    }
  };

  try {
    console.log('📧 Creating demo user:', DEMO_USER.email);
    const { status, data } = await makeRequest(options, DEMO_USER);

    if (status === 200 || status === 201) {
      console.log('✅ Demo user created successfully!');
      console.log('   User ID:', data.user?.id || data.id);
      console.log('\n📝 Next steps:');
      console.log('   1. Run the profile creation SQL:');
      console.log('      psql -h your-host -U postgres -d postgres -f migrations/002_demo_account_setup.sql');
      console.log('   2. Or manually create profile in Supabase dashboard');
      console.log('\n🔑 Demo credentials:');
      console.log('   Email:', DEMO_USER.email);
      console.log('   Password:', DEMO_USER.password);
      return true;
    } else if (status === 422 && data.msg?.includes('already exists')) {
      console.log('ℹ️  Demo user already exists');
      console.log('   Email:', DEMO_USER.email);
      console.log('\n🔑 Demo credentials:');
      console.log('   Email:', DEMO_USER.email);
      console.log('   Password:', DEMO_USER.password);
      return true;
    } else {
      console.error('❌ Failed to create demo user');
      console.error('   Status:', status);
      console.error('   Response:', JSON.stringify(data, null, 2));
      return false;
    }
  } catch (error) {
    console.error('❌ Error creating demo user:', error.message);
    return false;
  }
}

async function verifyDemoProfile() {
  console.log('\n🔍 Checking demo profile...');
  
  const url = new URL(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${DEMO_ACCOUNT_ID}`);
  
  const options = {
    hostname: url.hostname,
    port: 443,
    path: `${url.pathname}${url.search}`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'apikey': SERVICE_ROLE_KEY,
      'Accept': 'application/json'
    }
  };

  try {
    const { status, data } = await makeRequest(options);

    if (status === 200 && data.length > 0) {
      console.log('✅ Demo profile exists');
      console.log('   Name:', data[0].name);
      console.log('   Role:', data[0].role);
      console.log('   Is Demo:', data[0].is_demo_account);
      return true;
    } else {
      console.log('⚠️  Demo profile not found');
      console.log('   Please run the migration SQL to create the profile');
      return false;
    }
  } catch (error) {
    console.error('❌ Error checking profile:', error.message);
    return false;
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════');
  console.log('   Demo Account Setup for Nuclear Flow');
  console.log('═══════════════════════════════════════════════\n');

  const userCreated = await createDemoUser();
  
  if (userCreated) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    await verifyDemoProfile();
  }

  console.log('\n═══════════════════════════════════════════════');
  console.log('Setup complete! 🎉');
  console.log('═══════════════════════════════════════════════\n');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
