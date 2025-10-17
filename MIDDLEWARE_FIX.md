# Middleware Fix: node:process Error

## Problem

```
UnhandledSchemeError: Reading from "node:process" is not handled by plugins
```

This error occurred because Next.js middleware was trying to use Firebase Admin SDK (a Node.js-only package) without specifying the correct runtime.

## Root Cause

- **Middleware by default runs in Edge Runtime** (lightweight, restricted)
- **Firebase Admin SDK requires Node.js Runtime** (full Node.js APIs)
- **Edge Runtime doesn't support `node:process`** and other Node.js built-ins

## Solution

### Before (Broken):
```typescript
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)',],
};
```

### After (Fixed):
```typescript
export const config = {
  runtime: 'nodejs', // ✅ Enable Node.js runtime
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)',],
};
```

## Key Changes

1. **Added `runtime: 'nodejs'`** to middleware config
2. **Added try-catch** for graceful error handling when env vars are missing
3. **Used correct export name** (`getServerSession` not `auth`)

## Why This Works

Next.js 15.5 introduced stable Node.js runtime support for middleware:

- ✅ Allows Firebase Admin SDK usage
- ✅ Full access to Node.js APIs
- ✅ Can use `node:process`, `node:crypto`, etc.
- ✅ Compatible with server-side packages

## Trade-offs

**Edge Runtime** (default):
- ⚡ Faster cold starts
- 🌍 Runs at the edge (globally distributed)
- ⚠️ Limited APIs (no Node.js built-ins)

**Node.js Runtime** (what we use):
- 🔧 Full Node.js APIs
- ✅ Works with Firebase Admin SDK
- ⚠️ Slightly slower cold starts
- 🏠 Runs in a single region

For HOMEase AI, we need Node.js runtime because:
- We use Firebase Admin SDK for authentication
- We need custom claims for role-based access control
- Security rules need server-side validation

## References

- [Next.js 15.5 Release Notes](https://nextjs.org/blog/next-15-5)
- [Next.js Middleware Runtime](https://nextjs.org/docs/app/building-your-application/routing/middleware#runtime)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)

## Testing

After this fix:
```bash
npm run dev
# ✅ No more "node:process" errors
# ✅ Middleware compiles successfully
# ✅ App loads on http://localhost:3001
```

