# 🔌 Port Configuration Fix

## Issue
Your dev server is running on **port 3001** but NextAuth is configured for **port 3000**.

## ✅ Quick Fix

Update your `.env.local` file to match the correct port:

```env
NEXTAUTH_URL=http://localhost:3001
```

## Why This Matters

NextAuth uses `NEXTAUTH_URL` to:
- Generate callback URLs
- Validate redirect URIs  
- Handle OAuth flows
- Manage session cookies

If the ports don't match, authentication **will fail** or behave unexpectedly.

## 🎯 Complete .env.local Setup

Your `.env.local` should have:

```env
# Firebase Client (already correct)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBr-zNQIAcZN6A3QXkYY4BfkUBRWxzEHxw
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=homease-ai-prod-98385.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=homease-ai-prod-98385
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=homease-ai-prod-98385.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=480549932307
NEXT_PUBLIC_FIREBASE_APP_ID=1:480549932307:web:23d668992fb4c968361ee6

# Firebase Admin (use JSON file path)
FIREBASE_SERVICE_ACCOUNT_PATH=C:\Users\sidki\Downloads\homease-ai-prod-98385-firebase-adminsdk-fbsvc-d6520794b0.json

# NextAuth (IMPORTANT - match your dev server port!)
NEXTAUTH_URL=http://localhost:3001  # ← Make sure this matches!
NEXTAUTH_SECRET=[your-secret-here]  # Generate with: openssl rand -base64 32

# Gemini API
GEMINI_API_KEY=[your-key-here]

# Environment
NODE_ENV=development
```

## 🚀 After Updating

1. **Save `.env.local`**
2. **Restart dev server**:
   ```bash
   npm run dev
   ```
3. **Verify the port** in terminal output:
   ```
   - Local:        http://localhost:3001  ← Should match NEXTAUTH_URL
   ```

## 📝 Notes

- Port 3001 is used because 3000 was already in use
- Always ensure `NEXTAUTH_URL` matches your actual dev server port
- In production, this will be your actual domain (e.g., `https://homease-ai.com`)

