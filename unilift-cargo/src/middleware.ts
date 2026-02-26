import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';
import { getUserRole } from './actions/user';
import { AppRoutes } from './constants/AppRoutes';
import { USER_ROLES } from './constants/constants';

const ROLE_REDIRECT_PATHS: Record<string, string> = {
  [USER_ROLES.ADMIN]: AppRoutes.ADMIN_DASHBOARD,
  [USER_ROLES.CONTRACTOR]: AppRoutes.HOME,
  [USER_ROLES.WAREHOUSE_OPERATOR]: AppRoutes.WAREHOUSE_OPERATOR_DASHBOARD,
  [USER_ROLES.PRINCIPAL_EMPLOYER]: AppRoutes.PRINCIPAL_EMPLOYER_DASHBOARD
};

const PROTECTED_PATH_PREFIXES = [
  '/admin',
  '/contractor',
  '/warehouse-operator',
  '/principal-employer'
];

const AUTH_PAGES = [
  AppRoutes.LOGIN,
  AppRoutes.SIGN_UP,
  AppRoutes.FORGOT_PASSWORD,
  AppRoutes.OTP_VERIFICATION,
  AppRoutes.SIGN_UP_PRINCIPAL
];

export async function middleware(request: NextRequest) {
  try {
    const { supabaseResponse, user } = await updateSession(request);
    const userRole = user ? await getUserRole() : null;
    const { pathname } = request.nextUrl;

    // Handle authentication redirects
    if (user) {
      // User exists but has no role
      if (!userRole) {
        return redirectTo(AppRoutes.LOGIN, request.url);
      }

      // Logged-in users shouldn't access auth pages
      if (isAuthPage(pathname)) {
        return redirectTo(ROLE_REDIRECT_PATHS[userRole], request.url);
      }

      // Admin-specific redirect rules
      if (
        (userRole === USER_ROLES.ADMIN &&
          !pathname.startsWith('/admin') &&
          !pathname.startsWith('/invoice')) ||
        (userRole === USER_ROLES.WAREHOUSE_OPERATOR &&
          !pathname.startsWith('/warehouse-operator')) ||
        (userRole === USER_ROLES.PRINCIPAL_EMPLOYER &&
          !pathname.startsWith('/principal-employer'))
      ) {
        const dashboardPath = ROLE_REDIRECT_PATHS[userRole];
        return redirectTo(dashboardPath, request.url);
      }

      // Check if user has access to the requested path based on role
      if (!hasAccessToPath(pathname, userRole)) {
        return redirectTo(ROLE_REDIRECT_PATHS[userRole], request.url);
      }
    } else if (isProtectedRoute(pathname)) {
      // Not logged in but trying to access protected route
      return redirectTo(AppRoutes.LOGIN, request.url);
    }

    return supabaseResponse;
  } catch (error) {
    console.error('Middleware error:', error);
    return redirectTo(AppRoutes.LOGIN, request.url);
  }
}

function redirectTo(path: string, baseUrl: string): NextResponse {
  return NextResponse.redirect(new URL(path, baseUrl));
}

function isAuthPage(pathname: string): boolean {
  return AUTH_PAGES.includes(pathname);
}

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_PATH_PREFIXES.some(prefix => pathname.startsWith(prefix));
}

function hasAccessToPath(pathname: string, role: string): boolean {
  if (pathname.startsWith('/admin') && role !== USER_ROLES.ADMIN) return false;
  if (pathname.startsWith('/contractor') && role !== USER_ROLES.CONTRACTOR)
    return false;
  if (
    pathname.startsWith('/warehouse-operator') &&
    role !== USER_ROLES.WAREHOUSE_OPERATOR
  )
    return false;
  if (
    pathname.startsWith('/principal-employer') &&
    role !== USER_ROLES.PRINCIPAL_EMPLOYER
  )
    return false;
  return true;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
  ]
};
