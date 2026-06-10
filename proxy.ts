import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { CSRF_COOKIE_NAME, CSRF_REFRESH_COOKIE_NAME } from './utils/consts/token.const';
const publicRoutes = ['/auth/login', '/auth/forgot-password', '/auth/reset-password'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get(CSRF_COOKIE_NAME)?.value;
  const refreshToken = request.cookies.get(CSRF_REFRESH_COOKIE_NAME)?.value;
  const isLoggedIn = Boolean(accessToken || refreshToken);
  const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));

  if (isPublicRoute && isLoggedIn) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (!isPublicRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|assets|.*\\..*).*)'],
};
