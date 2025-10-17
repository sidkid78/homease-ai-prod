# HOMEase AI Platform

A comprehensive lead generation platform connecting homeowners with vetted contractors for aging-in-place home modifications.

## 🏗️ Architecture Overview

The platform is built entirely on Google Cloud Platform (GCP) with a serverless, event-driven architecture:

- **Frontend**: Next.js 15 (App Router) deployed on Google Cloud Run
- **Authentication**: Firebase Authentication + NextAuth.js v5 with role-based access control
- **Database**: Google Firestore (NoSQL) with real-time capabilities
- **Storage**: Google Cloud Storage (Firebase Storage SDK)
- **Backend Processing**: Google Cloud Functions (2nd Gen)
- **Event Bus**: Google Cloud Pub/Sub
- **AI/ML**: Google Gemini API (Assessment Analysis) + Fal.ai (Visualizations)
- **Payments**: Stripe Connect + Stripe Checkout

## 📁 Project Structure

```
andanother/
├── homease-ai-frontend/        # Next.js 15 application
│   ├── src/
│   │   ├── app/                # Next.js App Router pages
│   │   │   ├── api/            # API routes
│   │   │   ├── auth/           # Authentication pages
│   │   │   ├── dashboard/      # Dashboard pages (role-specific)
│   │   │   └── page.tsx        # Landing page
│   │   ├── components/         # React components
│   │   │   ├── providers/      # Context providers
│   │   │   ├── ui/             # Shadcn UI components
│   │   │   └── features/       # Feature-specific components
│   │   ├── lib/                # Utility libraries
│   │   │   └── firebase/       # Firebase configuration
│   │   └── types/              # TypeScript type definitions
│   ├── public/                 # Static assets
│   └── package.json
│
├── functions/                  # Firebase Cloud Functions
│   ├── src/
│   │   ├── auth.ts            # User authentication & role assignment
│   │   ├── leads.ts           # Lead matching & Stripe webhooks
│   │   ├── ar.ts              # AR assessment processing
│   │   └── index.ts           # Function exports
│   └── package.json
│
├── firestore.rules             # Firestore security rules
├── firestore.indexes.json      # Firestore composite indexes
├── storage.rules               # Cloud Storage security rules
├── firebase.json               # Firebase configuration
└── .firebaserc                 # Firebase project aliases

```

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- Firebase CLI: `npm install -g firebase-tools`
- Google Cloud account with billing enabled
- Stripe account

### Environment Setup

1. **Clone the repository**
   ```bash
   cd andanother/homease-ai-frontend
   ```

2. **Install dependencies**
   ```bash
   cd homease-ai-frontend
   npm install
   
   cd ../functions
   npm install
   ```

3. **Configure environment variables**
   
   Create `homease-ai-frontend/.env.local`:
   ```env
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   
   # Firebase Admin (Server-side)
   FIREBASE_CLIENT_EMAIL=your_service_account@your_project.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   
   # NextAuth
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=generate_with_openssl_rand_base64_32
   
   # Google OAuth (optional)
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   
   # Stripe
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   
   # AI Services
   GEMINI_API_KEY=your_gemini_api_key  # Handles both analysis AND image generation
   ```

4. **Initialize Firebase**
   ```bash
   firebase login
   firebase use --add  # Select your Firebase project
   ```

5. **Deploy Firestore Rules**
   ```bash
   firebase deploy --only firestore:rules
   firebase deploy --only firestore:indexes
   firebase deploy --only storage:rules
   ```

### Development

1. **Run the Next.js development server**
   ```bash
   cd homease-ai-frontend
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

2. **Test Cloud Functions locally**
   ```bash
   cd functions
   npm run serve
   ```

3. **Deploy Cloud Functions**
   ```bash
   firebase deploy --only functions
   ```

## 🔑 Key Features

### 1. Role-Based Access Control (RBAC)

The platform supports three user roles with granular permissions:

- **Homeowners**: Create AR assessments, generate leads, view matched contractors
- **Contractors**: View & purchase leads, manage profile & credentials
- **Admins**: Manage users, approve contractors, oversee platform operations

Roles are enforced at multiple layers:
- Firebase Custom Claims (authoritative source)
- NextAuth.js session (frontend)
- Firestore Security Rules (database)
- Cloud Functions (backend)

### 2. AR Assessment Workflow

1. Homeowner uploads photos/AR data → Cloud Storage
2. Upload triggers Pub/Sub message → `ar-assessment-created`
3. Cloud Function processes with Gemini AI
4. Results written to Firestore → Real-time UI update

### 3. Lead Matching System

1. Homeowner submits lead → Firestore + Pub/Sub
2. Cloud Function queries approved contractors by:
   - Service area (ZIP code)
   - Specialties
   - Availability
3. Ranks by rating & reviews
4. Updates lead with top 3 matches

### 4. Payment Flow

**Contractor Onboarding (Stripe Connect)**:
- Create Express account → Stripe-hosted onboarding
- Webhook updates `vettingStatus` on approval

**Lead Purchase**:
- Contractor clicks "Buy Lead" → Stripe Checkout
- Metadata: `{leadId, contractorId}`
- Webhook grants access & logs transaction

## 🔒 Security

### Application Security
- Content Security Policy (CSP) via Next.js middleware
- Input validation with Zod on all API routes
- Secure headers (HSTS, X-Frame-Options, etc.)

### Data Security
- Encryption in transit (TLS 1.3) and at rest (AES-256)
- Firestore Security Rules enforce row-level permissions
- Storage Rules restrict file access by user/role
- No sensitive data in client-side code

### Compliance
- **CCPA**: User data export/deletion via admin panel
- **'HIPAA-lite'**: Data minimization, access logs, encryption
- Regular security audits and penetration testing

## 📊 Database Schema

### Collections

**users**
```typescript
{
  uid: string,
  email: string,
  displayName: string,
  role: 'homeowner' | 'contractor' | 'admin',
  contractorProfile?: {
    businessName: string,
    licenseNumber: string,
    vettingStatus: 'pending' | 'approved' | 'rejected',
    stripeAccountId: string,
    serviceAreaZips: string[],
    specialties: Specialty[],
    averageRating: number,
    reviewCount: number
  }
}
```

**leads**
```typescript
{
  id: string,
  homeownerId: string,
  status: LeadStatus,
  address: Address,
  arAssessmentId: string,
  requiredSpecialties: Specialty[],
  matchedContractorIds: string[],
  purchasedBy: string[],
  leadPrice: number
}
```

**ar-assessments**
```typescript
{
  id: string,
  userId: string,
  status: 'uploading' | 'processing' | 'complete' | 'failed',
  rawDataUrls: string[],
  results?: {
    hazards: Hazard[],
    recommendations: Recommendation[],
    visualizations: string[]
  }
}
```

## 🚢 Deployment

### Frontend (Google Cloud Run)

1. **Build Docker image**
   ```bash
   cd homease-ai-frontend
   docker build -t gcr.io/your-project/homease-frontend:latest .
   docker push gcr.io/your-project/homease-frontend:latest
   ```

2. **Deploy to Cloud Run**
   ```bash
   gcloud run deploy homease-frontend \
     --image gcr.io/your-project/homease-frontend:latest \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --set-env-vars="NEXT_PUBLIC_FIREBASE_PROJECT_ID=..."
   ```

### Backend (Cloud Functions)

```bash
firebase deploy --only functions
```

### CI/CD with GitHub Actions

The repository includes GitHub Actions workflows for:
- **PR Validation**: Linting, type-checking, tests
- **Frontend Deployment**: Build → Push to Artifact Registry → Deploy to Cloud Run
- **Backend Deployment**: Deploy functions on `/functions` changes

See `.github/workflows/` for configuration.

## 🧪 Testing

```bash
cd homease-ai-frontend
npm run test        # Unit tests
npm run test:e2e    # End-to-end tests
npm run lint        # Linting
npm run type-check  # TypeScript check
```

## 📚 Documentation

- [Architecture Details](./info.md)
- [API Documentation](./docs/api.md)
- [Security Model](./docs/security.md)
- [Deployment Guide](./docs/deployment.md)

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m 'Add some feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Open a Pull Request

## 📄 License

Proprietary - All rights reserved

## 🆘 Support

For issues or questions:
- Create an issue in this repository
- Email: support@homease-ai.com
- Documentation: https://docs.homease-ai.com

---

Built with ❤️ for aging-in-place independence

