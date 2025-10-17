import { NextResponse } from 'next/server';

export async function GET() {
  const hasFirebaseCredentials = 
    process.env.FIREBASE_PRIVATE_KEY && 
    process.env.FIREBASE_PRIVATE_KEY.includes('BEGIN PRIVATE KEY') &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_CLIENT_EMAIL.length > 0;

  const hasNextAuthSecret = 
    process.env.NEXTAUTH_SECRET && 
    process.env.NEXTAUTH_SECRET.length > 20;

  const hasGeminiKey = 
    process.env.GEMINI_API_KEY && 
    process.env.GEMINI_API_KEY.length > 20;

  const status = {
    app: 'HOMEase AI',
    status: 'running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    configuration: {
      firebaseClient: {
        configured: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      },
      firebaseAdmin: {
        configured: hasFirebaseCredentials,
        message: hasFirebaseCredentials 
          ? '✅ Credentials valid' 
          : '⚠️  Add real service account credentials',
      },
      nextAuth: {
        configured: hasNextAuthSecret,
        message: hasNextAuthSecret 
          ? '✅ Secret configured' 
          : '⚠️  Run: openssl rand -base64 32',
      },
      gemini: {
        configured: hasGeminiKey,
        message: hasGeminiKey 
          ? '✅ API key configured' 
          : '⚠️  Get key from https://makersuite.google.com/app/apikey',
      },
    },
    readyForDevelopment: hasFirebaseCredentials && hasNextAuthSecret,
    readyForProduction: hasFirebaseCredentials && hasNextAuthSecret && hasGeminiKey,
  };

  return NextResponse.json(status, { 
    status: 200,
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}

