import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';
import type { Role } from '@/types';

type ResponderType = 'medical' | 'security' | 'driver';

function getDashboardPath(role: Role, responderType?: ResponderType): string {
  if (role === 'admin') return '/dashboard/admin';
  if (role === 'responder') {
    if (responderType === 'medical') return '/dashboard/medical';
    if (responderType === 'security') return '/dashboard/security';
    if (responderType === 'driver') return '/dashboard/driver';
    return '/dashboard/medical';
  }
  if (role === 'medical_officer') return '/dashboard/medical';
  if (role === 'security_officer') return '/dashboard/security';
  if (role === 'driver') return '/dashboard/driver';
  if (role === 'host') return '/host/properties';
  return '/dashboard/worshipper';
}

// Legacy role home pages (keep old routes working)
const LEGACY_ROLE_HOME: Record<string, string> = {
  worshipper: '/worshipper/bookings',
  medical_officer: '/responder',
  security_officer: '/responder',
  driver: '/driver/rides',
  admin: '/admin/dashboard',
  host: '/host/properties',
  responder: '/dashboard/medical',
};

const PROTECTED_PREFIXES: { prefix: string; roles: string[] }[] = [
  { prefix: '/admin', roles: ['admin'] },
  { prefix: '/officer', roles: ['medical_officer', 'security_officer', 'admin', 'responder'] },
  { prefix: '/responder', roles: ['medical_officer', 'security_officer', 'admin', 'responder'] },
  { prefix: '/driver', roles: ['driver', 'admin', 'responder'] },
  { prefix: '/worshipper', roles: ['worshipper', 'admin'] },
  { prefix: '/host', roles: ['host', 'admin'] },
  { prefix: '/dashboard/admin', roles: ['admin'] },
  { prefix: '/dashboard/medical', roles: ['responder', 'medical_officer', 'admin'] },
  { prefix: '/dashboard/security', roles: ['responder', 'security_officer', 'admin'] },
  { prefix: '/dashboard/driver', roles: ['responder', 'driver', 'admin'] },
  { prefix: '/dashboard/worshipper', roles: ['worshipper', 'admin'] },
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const role = token?.role as Role | undefined;
  const responderType = token?.responderType as ResponderType | undefined;

  // Skip root (/) — let page.tsx handle auth-based redirect
  if (pathname === '/') return NextResponse.next();

  // Redirect authenticated users away from login/register
  const isLoginOrRegister =
    pathname === '/login' ||
    pathname === '/register' ||
    pathname.startsWith('/login/') ||
    pathname.startsWith('/register/');

  if (isLoginOrRegister && token && role) {
    return NextResponse.redirect(new URL(getDashboardPath(role, responderType), req.url));
  }

  // Check protected routes
  for (const { prefix, roles } of PROTECTED_PREFIXES) {
    if (pathname.startsWith(prefix)) {
      if (!token || !role) {
        const url = new URL('/login', req.url);
        url.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(url);
      }
      if (!roles.includes(role)) {
        return NextResponse.redirect(new URL(getDashboardPath(role, responderType), req.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/officer/:path*',
    '/driver/:path*',
    '/worshipper/:path*',
    '/host/:path*',
    '/responder/:path*',
    '/dashboard/:path*',
    '/login',
    '/login/:path*',
    '/register',
    '/register/:path*',
    '/forgot-password',
  ],
};
