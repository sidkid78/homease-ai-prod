# 🔑 Adding Firebase Service Account

You have **two options** for configuring Firebase Admin SDK:

## ✅ Option 1: Use JSON File Path (RECOMMENDED - Easiest!)

This is simpler because you don't need to copy/paste the private key.

### Steps:

1. **Download the service account JSON** from Firebase Console:
   - Visit: https://console.firebase.google.com/project/homease-ai-prod-98385/settings/serviceaccounts/adminsdk
   - Click "Generate new private key"
   - Save the JSON file (e.g., to `C:\Users\sidki\Downloads\`)

2. **Add the path to `.env.local`**:
   ```env
   FIREBASE_SERVICE_ACCOUNT_PATH=C:\Users\sidki\Downloads\homease-ai-prod-98385-firebase-adminsdk-fbsvc-d6520794b0.json
   ```

3. **Restart your dev server**:
   ```bash
   npm run dev
   ```

That's it! ✨

---

## Option 2: Use Individual Environment Variables

If you prefer not to use the JSON file path, you can extract the values:

1. **Open the JSON file**
2. **Copy these values to `.env.local`**:
   ```env
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@homease-ai-prod-98385.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"
   ```

**Important**: Keep the `\n` characters in the private key!

---

## 🧪 Verify It's Working

After adding the credentials, run:

```bash
node test-env.js
```

You should see:
```
✅ FIREBASE_SERVICE_ACCOUNT_PATH: C:\Users\sidki\Downloads\...
```

OR if using individual vars:
```
✅ FIREBASE_CLIENT_EMAIL: ***@homease-ai-prod-98385.iam.gserviceaccount.com
✅ FIREBASE_PRIVATE_KEY: -----BEGIN PRIVATE KEY-----\nM...[REDACTED]
```

---

## 🎯 Current Setup

Based on your system:
- **Service Account JSON**: `C:\Users\sidki\Downloads\homease-ai-prod-98385-firebase-adminsdk-fbsvc-d6520794b0.json`
- **Add to `.env.local`**: Just add the `FIREBASE_SERVICE_ACCOUNT_PATH` line!

The code will automatically prioritize the JSON file path if it's present.

