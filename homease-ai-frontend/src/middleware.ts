import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getServerSession } from "@/auth";

// Define protected routes and their required roles
const protectedRoutes = {
  '/dashboard/homeowner': ['homeowner', 'admin'],
  '/dashboard/contractor': ['contractor', 'admin'],
  '/dashboard/admin': ['admin'],
  '/api/admin': ['admin'],
};

export async function middleware(request: NextRequest) {
  const session = await getServerSession();
  const { pathname } = request.nextUrl;

  // Check if route is protected
  const matchedRoute = Object.keys(protectedRoutes).find(route => 
    pathname.startsWith(route)
  );

  if (matchedRoute) {
    if (!session?.user) {
      // Not authenticated - redirect to sign in
      const signInUrl = new URL('/auth/signin', request.url);
      signInUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(signInUrl);
    }

    const requiredRoles = protectedRoutes[matchedRoute as keyof typeof protectedRoutes];
    const userRole = session.user.role;

    if (!requiredRoles.includes(userRole)) {
      // Not authorized - redirect to home or appropriate dashboard
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Add security headers
  const response = NextResponse.next();
  
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://api.stripe.com",
      "frame-src https://js.stripe.com",
    ].join('; ')
  );

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

