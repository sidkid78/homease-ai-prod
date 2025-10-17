// Quick test script to check environment variables
require('dotenv').config({ path: '.env.local' });

console.log('\n🔍 Environment Variables Check:\n');

const checks = {
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID': {
    value: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    expected: 'homease-ai-prod-98385',
  },
  'FIREBASE_CLIENT_EMAIL': {
    value: process.env.FIREBASE_CLIENT_EMAIL,
    shouldContain: '@',
    shouldNotContain: 'your-service-account',
  },
  'FIREBASE_PRIVATE_KEY': {
    value: process.env.FIREBASE_PRIVATE_KEY,
    shouldContain: 'BEGIN PRIVATE KEY',
    shouldNotContain: 'YOUR_PRIVATE_KEY_HERE',
  },
  'NEXTAUTH_SECRET': {
    value: process.env.NEXTAUTH_SECRET,
    shouldNotContain: 'temporary-secret',
  },
};

let allGood = true;

for (const [key, check] of Object.entries(checks)) {
  const value = check.value;
  
  if (!value) {
    console.log(`❌ ${key}: NOT SET`);
    allGood = false;
    continue;
  }

  if (check.expected && value !== check.expected) {
    console.log(`❌ ${key}: Wrong value (expected "${check.expected}")`);
    allGood = false;
    continue;
  }

  if (check.shouldContain && !value.includes(check.shouldContain)) {
    console.log(`❌ ${key}: Missing "${check.shouldContain}"`);
    allGood = false;
    continue;
  }

  if (check.shouldNotContain && value.includes(check.shouldNotContain)) {
    console.log(`⚠️  ${key}: Still contains placeholder "${check.shouldNotContain}"`);
    allGood = false;
    continue;
  }

  // Mask sensitive values
  let display = value;
  if (key.includes('PRIVATE_KEY')) {
    display = value.substring(0, 30) + '...[REDACTED]';
  } else if (key.includes('SECRET')) {
    display = '***[REDACTED]***';
  } else if (key.includes('EMAIL')) {
    display = value.replace(/^[^@]+/, '***');
  }

  console.log(`✅ ${key}: ${display}`);
}

console.log('\n');

if (allGood) {
  console.log('🎉 All required environment variables look good!\n');
  console.log('Next steps:');
  console.log('1. Restart dev server: npm run dev');
  console.log('2. Visit: http://localhost:3001');
  console.log('3. Try signing up: http://localhost:3001/auth/signup\n');
} else {
  console.log('⚠️  Some environment variables need attention.\n');
  console.log('Please check your .env.local file and make sure:');
  console.log('1. Private key is wrapped in double quotes');
  console.log('2. Private key includes \\n characters (not actual newlines)');
  console.log('3. All placeholders are replaced with real values\n');
}

