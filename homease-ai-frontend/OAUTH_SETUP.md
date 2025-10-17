# 🔐 OAuth2 Setup Guide (Google Sign-In)

## Overview
Adding Google OAuth2 allows users to sign in with their Google account instead of email/password.

---

## 📋 Step-by-Step Setup

### 1. Enable Google Sign-In in Firebase

1. **Go to Firebase Console**:
   - Visit: https://console.firebase.google.com/project/homease-ai-prod-98385/authentication/providers

2. **Enable Google Provider**:
   - Click on **"Google"** in the list of providers
   - Toggle **"Enable"**
   - Click **"Save"**

That's it for Firebase! ✅

---

### 2. Create OAuth Credentials in Google Cloud Console

1. **Go to Google Cloud Console**:
   - Visit: https://console.cloud.google.com/apis/credentials?project=homease-ai-prod-98385

2. **Create OAuth Client ID**:
   - Click **"+ CREATE CREDENTIALS"**
   - Select **"OAuth client ID"**

3. **Configure OAuth Consent Screen** (if prompted):
   - Click **"CONFIGURE CONSENT SCREEN"**
   - Select **"External"** → Click **"CREATE"**
   - Fill in required fields:
     - **App name**: HOMEase AI
     - **User support email**: Your email
     - **Developer contact**: Your email
   - Click **"SAVE AND CONTINUE"**
   - Skip "Scopes" → Click **"SAVE AND CONTINUE"**
   - Skip "Test users" → Click **"SAVE AND CONTINUE"**
   - Click **"BACK TO DASHBOARD"**

4. **Create OAuth Client ID**:
   - Application type: **"Web application"**
   - Name: **"HOMEase AI Web Client"**
   
5. **Add Authorized Redirect URIs**:
   - Click **"+ ADD URI"**
   - Add these URIs:
     ```
     http://localhost:3000/api/auth/callback/google
     http://localhost:3000/api/auth/signin
     ```
   - For production (later), add:
     ```
     https://yourdomain.com/api/auth/callback/google
     https://yourdomain.com/api/auth/signin
     ```

6. **Click "CREATE"**

7. **Copy Your Credentials**:
   - You'll see a popup with:
     - **Client ID**: `1234567890-abc123.apps.googleusercontent.com`
     - **Client Secret**: `GOCSPX-abc123def456`
   - **Save these!** You'll need them for `.env.local`

---

### 3. Add Credentials to .env.local

Add these lines to your `.env.local` file:

```env
# Google OAuth2
GOOGLE_CLIENT_ID=1234567890-abc123.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123def456
```

---

### 4. Update Your Auth Configuration

The auth is already configured in `src/auth.ts`! It includes the Google provider:

```typescript
GoogleProvider({
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
})
```

---

### 5. Test It!

1. **Restart your dev server**:
   ```bash
   npm run dev
   ```

2. **Go to sign-in page**:
   - Visit: http://localhost:3000/auth/signin

3. **Click "Sign in with Google"**:
   - You should see the Google sign-in popup
   - Sign in with your Google account
   - You'll be redirected back to the app!

---

## 🎨 Update Sign-In UI (Optional)

Your sign-in pages already have "Sign in with Google" buttons! They're in:
- `/auth/signin/page.tsx`
- `/auth/signup/page.tsx`

The buttons will automatically work once you add the credentials.

---

## 🔧 Advanced Configuration

### Add More OAuth Providers

NextAuth supports many providers. To add more (GitHub, Facebook, etc.):

```bash
# Example: Add GitHub
```

1. **Update `src/auth.ts`**:
```typescript
import GitHubProvider from "next-auth/providers/github";

providers: [
  GoogleProvider({ ... }),
  GitHubProvider({
    clientId: process.env.GITHUB_CLIENT_ID!,
    clientSecret: process.env.GITHUB_CLIENT_SECRET!,
  }),
]
```

2. **Add to `.env.local`**:
```env
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

---

## 📝 Common Issues & Solutions

### Issue: "Redirect URI mismatch"
**Solution**: Make sure you added the exact redirect URI in Google Cloud Console:
```
http://localhost:3000/api/auth/callback/google
```

### Issue: "Access blocked: This app's request is invalid"
**Solution**: 
1. Your OAuth consent screen needs to be configured
2. Make sure your app is in "Testing" mode during development
3. Add your email as a test user if needed

### Issue: "Invalid client: redirect_uri mismatch"
**Solution**: Check that:
- Port 3000 is correct (not 3001)
- Protocol is `http://` for localhost
- Path is `/api/auth/callback/google`

---

## 🎯 Complete Environment Variables Checklist

Your `.env.local` should now have:

```env
# Firebase Client
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBr-zNQIAcZN6A3QXkYY4BfkUBRWxzEHxw
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=homease-ai-prod-98385.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=homease-ai-prod-98385
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=homease-ai-prod-98385.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=480549932307
NEXT_PUBLIC_FIREBASE_APP_ID=1:480549932307:web:23d668992fb4c968361ee6

# Firebase Admin
FIREBASE_SERVICE_ACCOUNT_PATH=C:\Users\sidki\Downloads\homease-ai-prod-98385-firebase-adminsdk-fbsvc-d6520794b0.json

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=[your-secret]

# Google OAuth2 ✨ NEW!
GOOGLE_CLIENT_ID=[your-client-id]
GOOGLE_CLIENT_SECRET=[your-client-secret]

# Gemini API
GEMINI_API_KEY=[your-key]

# Environment
NODE_ENV=development
```

---

## 🚀 Production Deployment

When deploying to production:

1. **Update Google Cloud Console**:
   - Add production redirect URIs:
     ```
     https://yourdomain.com/api/auth/callback/google
     ```

2. **Update `.env.production`**:
   ```env
   NEXTAUTH_URL=https://yourdomain.com
   ```

3. **Publish OAuth Consent Screen**:
   - In Google Cloud Console, change from "Testing" to "Production"
   - This allows any Google user to sign in

---

## 📚 Resources

- **Google Cloud Console**: https://console.cloud.google.com/apis/credentials
- **Firebase Console**: https://console.firebase.google.com/project/homease-ai-prod-98385/authentication/providers
- **NextAuth Docs**: https://authjs.dev/getting-started/providers/google
- **OAuth2 Guide**: https://developers.google.com/identity/protocols/oauth2

---

## ✅ Summary

1. Enable Google in Firebase Console
2. Create OAuth credentials in Google Cloud Console
3. Add Client ID & Secret to `.env.local`
4. Restart dev server
5. Test "Sign in with Google" button

That's it! Your users can now sign in with Google! 🎉

