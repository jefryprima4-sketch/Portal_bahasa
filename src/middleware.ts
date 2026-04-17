import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import type { UserRole } from '@/lib/supabase/types';

// Route configuration: which roles can access which path prefixes
const routeRoles: Record<string, UserRole[]> = {
  '/student': ['student'],
  '/instructor': ['instructor'],
  '/admin': ['admin'],
};

// Routes accessible to unauthenticated users
const publicRoutes = ['/login', '/register', '/verify-email'];

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user, role } = await updateSession(request);
  const { pathname } = request.nextUrl;

  const isAuthRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));
  const isLandingPage = pathname === '/';
  const isPublicAsset = pathname.startsWith('/_next') || pathname.startsWith('/api') ||
    /\.(svg|png|jpg|jpeg|gif|webp|ico)$/.test(pathname);

  // 1. Redirect unauthenticated users to login (except public routes)
  if (!user && !isAuthRoute && !isLandingPage && !isPublicAsset) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirectedFrom', pathname);
    return NextResponse.redirect(url);
  }

  // 2. Redirect authenticated users away from auth routes or landing page
  if (user && role && (isAuthRoute || isLandingPage)) {
    const dashboardPath = role === 'admin' ? '/admin' : `/${role}/dashboard`;
    if (pathname !== dashboardPath) {
      return NextResponse.redirect(new URL(dashboardPath, request.url));
    }
  }

  // 3. Role-based route protection
  if (user && role) {
    for (const [pathPrefix, allowedRoles] of Object.entries(routeRoles)) {
      if (pathname.startsWith(pathPrefix)) {
        if (!allowedRoles.includes(role)) {
          // Redirect to their own dashboard
          const dashboardPath = role === 'admin' ? '/admin' : `/${role}/dashboard`;
          return NextResponse.redirect(new URL(dashboardPath, request.url));
        }
        break;
      }
    }
  }

  // 4. Profile page is accessible to all authenticated users
  // (no extra check needed - just needs to be authenticated, handled by step 1)

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
