# 🔥 Firebase Setup Guide

Complete step-by-step guide to configure Firebase for HOMEase AI.

## Prerequisites

- Google account
- Node.js installed
- Firebase CLI installed: `npm install -g firebase-tools`

## Step 1: Create/Access Firebase Project

### Option A: Create New Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **"Add project"**
3. Project name: `homease-ai-prod`
4. Enable Google Analytics (recommended)
5. Click **"Create project"**

### Option B: Use Existing Project
Based on your `.firebaserc`, you already have: **`homease-ai-prod-98385`**

## Step 2: Get Firebase Web App Configuration

1. In Firebase Console, click the **gear icon** ⚙️ → **Project Settings**
2. Scroll to **"Your apps"** section
3. If no web app exists:
   - Click **"Add app"** button
   - Select **Web** icon (`</>`)
   - App nickname: `homease-ai-frontend`
   - ✅ Check "Also set up Firebase Hosting" (optional)
   - Click **"Register app"**

4. You'll see the Firebase SDK configuration:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "homease-ai-prod.firebaseapp.com",
  projectId: "homease-ai-prod",
  storageBucket: "homease-ai-prod.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

5. **Copy these values** - you'll need them for `.env.local`

## Step 3: Get Service Account Key (Admin SDK)

1. Still in **Project Settings**, go to **"Service Accounts"** tab
2. Click **"Generate new private key"**
3. Confirm by clicking **"Generate key"**
4. A JSON file will download: `homease-ai-prod-firebase-adminsdk-xxxxx.json`
5. **Keep this file secure!** Never commit it to Git

### Extract Values from Service Account JSON

Open the downloaded JSON file and find:
- `client_email` - This is your `FIREBASE_CLIENT_EMAIL`
- `private_key` - This is your `FIREBASE_PRIVATE_KEY`

## Step 4: Create .env.local File

1. Navigate to your frontend directory:
```bash
cd homease-ai-frontend
```

2. Copy the template:
```bash
cp .env.local.template .env.local
```

3. Open `.env.local` and fill in the values:

```bash
# From Firebase Web App Config (Step 2)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=homease-ai-prod.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=homease-ai-prod
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=homease-ai-prod.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef

# From Service Account JSON (Step 3)
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@homease-ai-prod.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"

# Generate this (Step 5)
NEXTAUTH_SECRET=your-generated-secret-here
```

**Important**: 
- Keep the quotes around `FIREBASE_PRIVATE_KEY`
- Keep all the `\n` characters - they're important!
- The private key should be one long line

## Step 5: Generate NextAuth Secret

```bash
openssl rand -base64 32
```

Copy the output and paste it as `NEXTAUTH_SECRET` in `.env.local`

## Step 6: Enable Firebase Services

### Enable Authentication

1. In Firebase Console, go to **Authentication**
2. Click **"Get started"**
3. Go to **"Sign-in method"** tab
4. Enable **"Email/Password"**:
   - Click on it
   - Toggle **"Enable"**
   - Click **"Save"**

### Optional: Enable Google Sign-In

1. In **"Sign-in method"**, enable **"Google"**
2. Set support email
3. You'll need to set up OAuth consent screen in Google Cloud Console
4. Get `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` and add to `.env.local`

### Create Firestore Database

1. Go to **Firestore Database**
2. Click **"Create database"**
3. Select **"Production mode"** (we have security rules ready)
4. Choose location: `us-central1` (or closest to you)
5. Click **"Enable"**

### Create Cloud Storage Bucket

1. Go to **Storage**
2. Click **"Get started"**
3. Use **"Production mode"** (we have security rules ready)
4. Use default location
5. Click **"Done"**

## Step 7: Deploy Security Rules

```bash
# From project root
cd C:\Users\sidki\source\repos\andanother

# Login to Firebase
firebase login

# Select your project
firebase use homease-ai-prod-98385

# Deploy rules
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
firebase deploy --only storage:rules
```

## Step 8: Set Up Pub/Sub Topics

```bash
# Create topics for Cloud Functions
gcloud pubsub topics create lead-created --project=homease-ai-prod-98385
gcloud pubsub topics create ar-assessment-created --project=homease-ai-prod-98385
```

## Step 9: Configure Cloud Functions

```bash
cd functions

# Set Gemini API key (get from https://makersuite.google.com/app/apikey)
firebase functions:config:set gemini.api_key="YOUR_GEMINI_API_KEY_HERE"

# Verify config
firebase functions:config:get
```

## Step 10: Verify Configuration

Run the checker script:

```bash
cd homease-ai-frontend
node scripts/check-firebase-config.js
```

You should see all ✅ green checkmarks!

## Step 11: Test Locally

```bash
# Start the Next.js dev server
cd homease-ai-frontend
npm run dev
```

Open http://localhost:3000 and try:
1. ✅ Navigate to `/auth/signup`
2. ✅ Create an account
3. ✅ Sign in
4. ✅ Check Firebase Console → Authentication → Users (you should see your user)

## Troubleshooting

### "Missing environment variable"
- Check `.env.local` exists in `homease-ai-frontend/`
- Restart your dev server after changing `.env.local`

### "Firebase: Error (auth/...)"
- Verify Authentication is enabled in Firebase Console
- Check your API key is correct

### "Permission denied" in Firestore
- Deploy security rules: `firebase deploy --only firestore:rules`
- Check user has correct role in custom claims

### "Private key invalid"
- Make sure the key is wrapped in quotes
- Keep all `\n` characters
- Don't add extra line breaks

## Security Checklist

- [ ] `.env.local` is in `.gitignore`
- [ ] Service account JSON is NOT committed to Git
- [ ] Using TEST Stripe keys for development
- [ ] Firestore security rules deployed
- [ ] Storage security rules deployed
- [ ] NextAuth secret is strong (32+ characters)

## What's Next?

Once Firebase is configured:

1. **Deploy Cloud Functions**:
   ```bash
   cd functions
   npm run build
   firebase deploy --only functions
   ```

2. **Set up Stripe** - See Stripe Dashboard for API keys

3. **Get Gemini API Key** - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)

4. **Start Building** - Create dashboard pages and features!

## Quick Reference

### Firebase Console Links
- **Main Console**: https://console.firebase.google.com
- **Project Settings**: https://console.firebase.google.com/project/homease-ai-prod/settings/general
- **Authentication**: https://console.firebase.google.com/project/homease-ai-prod/authentication
- **Firestore**: https://console.firebase.google.com/project/homease-ai-prod/firestore
- **Storage**: https://console.firebase.google.com/project/homease-ai-prod/storage

### Key Files
- `homease-ai-frontend/.env.local` - Your secrets (DO NOT COMMIT)
- `homease-ai-frontend/.env.local.template` - Template with instructions
- `firestore.rules` - Database security rules
- `storage.rules` - File storage security rules
- `firebase.json` - Firebase project configuration

---

**Next**: See `QUICKSTART.md` for the complete setup process!

