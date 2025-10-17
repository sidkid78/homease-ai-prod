#!/usr/bin/env node

/**
 * Firebase Configuration Checker
 * Run: node scripts/check-firebase-config.js
 */

console.log('🔥 Firebase Configuration Checker\n');

const requiredEnvVars = {
  'Client-side (Public)': [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID',
  ],
  'Server-side (Private)': [
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_PRIVATE_KEY',
  ],
  'NextAuth': [
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
  ],
  'Stripe': [
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
  ],
  'AI Services': [
    'GEMINI_API_KEY',
  ],
};

let allGood = true;

Object.entries(requiredEnvVars).forEach(([category, vars]) => {
  console.log(`\n📦 ${category}:`);
  vars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      const preview = varName.includes('PRIVATE_KEY') 
        ? '***PRIVATE_KEY***'
        : value.substring(0, 20) + '...';
      console.log(`  ✅ ${varName}: ${preview}`);
    } else {
      console.log(`  ❌ ${varName}: MISSING`);
      allGood = false;
    }
  });
});

console.log('\n' + '='.repeat(50));

if (allGood) {
  console.log('✅ All environment variables are set!');
  console.log('\nNext steps:');
  console.log('  1. npm run dev');
  console.log('  2. Open http://localhost:3000');
  console.log('  3. Try signing up as a user');
} else {
  console.log('❌ Some environment variables are missing!');
  console.log('\nTo fix:');
  console.log('  1. Copy env.example.txt to .env.local');
  console.log('  2. Fill in the values from Firebase Console');
  console.log('  3. Get service account key from Project Settings > Service Accounts');
  console.log('  4. Generate NEXTAUTH_SECRET: openssl rand -base64 32');
  console.log('\nSee QUICKSTART.md for detailed instructions.');
}

console.log('='.repeat(50) + '\n');

process.exit(allGood ? 0 : 1);

