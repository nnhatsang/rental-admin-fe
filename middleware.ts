
import { NextRequest, NextResponse } from 'next/server';

import { AUTH_REFRESH_COOKIE } from './utils/consts/token.const';

const PUBLIC_ROUTES = ['/auth/login', '/auth/forgot-password', '/auth/reset-password'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));

  const token = request.cookies.get(AUTH_REFRESH_COOKIE)?.value;

  if (!isPublicRoute && !token) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  if (isPublicRoute && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}


export const config = {
  // matcher: ['/((?!api|_next/static|_next/image|favicon.ico|assets|.*\\..*).*)'],
  matcher: '/((?!api|static|.*\\..*|_next).*)',
};