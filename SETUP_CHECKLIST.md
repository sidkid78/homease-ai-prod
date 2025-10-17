# 🎯 Setup Checklist for HOMEase AI

## ✅ Completed

- [x] Firebase project created (`homease-ai-prod-98385`)
- [x] Firestore rules deployed
- [x] Firestore indexes deployed
- [x] Storage rules deployed
- [x] Storage bucket created
- [x] Firebase web app registered
- [x] Latest Gemini SDK installed (`@google/genai@0.3.1`)
- [x] Native image generation configured (no Fal.ai needed)
- [x] Project documentation complete

## ⏳ Next Steps (Required)

### 1. Enable Firebase Authentication (2 min)
**Link**: https://console.firebase.google.com/project/homease-ai-prod-98385/authentication/providers

1. Click **"Get started"**
2. Enable **"Email/Password"**
3. Toggle **"Enable"** and **"Save"**

### 2. Get Service Account Key (3 min)
**Link**: https://console.firebase.google.com/project/homease-ai-prod-98385/settings/serviceaccounts/adminsdk

1. Click **"Generate new private key"**
2. Download the JSON file
3. Open it and extract:
   - `client_email` → Copy to `.env.local`
   - `private_key` → Copy to `.env.local` (keep all `\n` characters!)

### 3. Generate NextAuth Secret (30 sec)
```bash
openssl rand -base64 32
```
Copy the output to `.env.local` as `NEXTAUTH_SECRET`

### 4. Get Gemini API Key (2 min)
**Link**: https://makersuite.google.com/app/apikey

1. Click **"Create API key"**
2. Select your Google Cloud project
3. Copy the key to `.env.local` as `GEMINI_API_KEY`

### 5. Get Stripe API Keys (Optional - for payments) (5 min)
**Link**: https://dashboard.stripe.com/test/apikeys

1. Copy **"Publishable key"** → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
2. Copy **"Secret key"** → `STRIPE_SECRET_KEY`
3. For webhook secret, you'll set this up later when deploying

### 6. Create .env.local File
```bash
cd homease-ai-frontend

# Copy the template with Firebase values already filled in
cp .env.local.example .env.local

# Open .env.local and fill in the remaining values:
# - FIREBASE_CLIENT_EMAIL
# - FIREBASE_PRIVATE_KEY
# - NEXTAUTH_SECRET
# - GEMINI_API_KEY
# - (Optional) Stripe keys
```

### 7. Verify Configuration
```bash
node scripts/check-firebase-config.js
```

You should see all ✅ checkmarks!

## 🚀 Ready to Start Development

Once all the above is complete:

```bash
cd homease-ai-frontend
npm run dev
```

Open http://localhost:3000 and test:
1. Navigate to `/auth/signup`
2. Create a test account
3. Sign in
4. Check Firebase Console → Authentication to see your user

## 📦 Optional: Deploy Cloud Functions

Once you have `GEMINI_API_KEY`:

```bash
cd functions

# Set Gemini API key for functions
firebase functions:config:set gemini.api_key="YOUR_GEMINI_API_KEY"

# Build and deploy
npm run build
firebase deploy --only functions
```

## 🔐 Security Reminders

- [ ] `.env.local` is in `.gitignore` (already done ✅)
- [ ] Service account JSON file is NOT committed
- [ ] Using TEST Stripe keys for development
- [ ] All environment variables are set
- [ ] NextAuth secret is strong (32+ characters)

## 📚 Documentation Reference

- **Main Setup**: `FIREBASE_SETUP.md`
- **Quick Start**: `QUICKSTART.md`
- **Project Info**: `PROJECT_INFO.md`
- **What's Next**: `IMPLEMENTATION_STATUS.md`

---

## 🎯 Current Status

**Firebase Backend**: ✅ 100% Complete  
**Environment Config**: ⏳ 60% Complete (Firebase values filled)  
**Ready for Development**: ⏳ Waiting on API keys

**Estimated Time to Complete**: 10-15 minutes

