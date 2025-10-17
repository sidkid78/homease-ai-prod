// This file should ONLY be imported on the server side
// It will throw errors if imported in client-side code

import { initializeApp, cert, getApps, getApp, ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { FirebaseApp } from 'firebase/app';
import { AppOptions } from 'firebase-admin/app';

// Ensure this only runs on the server
if (typeof window !== 'undefined') {
  throw new Error('firebase-admin should only be used on the server side');
}

// Prepare the Firebase Admin configuration
// Option 1: Use service account JSON file path
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

// Option 2: Use individual environment variables
const firebaseAdminConfig: ServiceAccount = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
  // Ensure the private key string has actual newline characters
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '',
};

function getFirebaseAdminApp(): FirebaseApp {
  // Check if credentials are properly configured
  const hasValidCredentials = 
    firebaseAdminConfig.privateKey && 
    firebaseAdminConfig.privateKey.includes('BEGIN PRIVATE KEY') && 
    firebaseAdminConfig.clientEmail && 
    firebaseAdminConfig.clientEmail.includes('@') &&
    !firebaseAdminConfig.clientEmail.includes('your-service-account') &&
    firebaseAdminConfig.projectId;

  if (!hasValidCredentials) {
    console.warn('⚠️  Firebase Admin SDK credentials not configured or invalid.');
    console.warn('⚠️  Authentication features will not work until you add real credentials.');
    console.warn('⚠️  See SETUP_CHECKLIST.md for instructions.');
  }

  if (getApps().length === 0) {
    // Initialize if no app exists
    try {
      // Option 1: Use service account JSON file if path is provided
      if (serviceAccountPath) {
        console.log('✅ Using Firebase service account from file:', serviceAccountPath);
        return initializeApp({
          credential: cert(serviceAccountPath),
        } as AppOptions) as FirebaseApp;
      }
      
      // Option 2: Use environment variables
      console.log('--- Firebase Admin Config Debug ---');
      console.log('Project ID:', firebaseAdminConfig.projectId);
      console.log('Client Email:', firebaseAdminConfig.clientEmail);
      console.log('Private Key (first 100 chars):', firebaseAdminConfig.privateKey?.substring(0, 100));
      console.log('Private Key includes actual newline (after replace):', firebaseAdminConfig.privateKey?.includes('\n'));
      console.log('Private Key length:', firebaseAdminConfig.privateKey?.length);
      console.log('--- End Firebase Admin Config Debug ---');
      
      console.log('✅ Using Firebase service account from environment variables');
      return initializeApp({
        credential: cert(firebaseAdminConfig),
        projectId: firebaseAdminConfig.projectId,
      } as AppOptions) as FirebaseApp;
    } catch (error) {
      console.error('❌ Failed to initialize Firebase Admin SDK:', error);
      console.warn('⚠️  Falling back to dummy app. Authentication will not work.');
      
      // Fallback to dummy app for development
      return initializeApp({
        projectId: firebaseAdminConfig.projectId || 'demo-project',
      } as AppOptions) as FirebaseApp;
    }
  }
  return getApp() as FirebaseApp;
}

export const adminApp = getFirebaseAdminApp();
export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);
