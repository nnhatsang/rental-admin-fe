import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { AUTH_REFRESH_COOKIE } from './utils/consts/token.const';
const PUBLIC_ROUTES = ['/auth/login', '/auth/forgot-password', '/auth/reset-password'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // 1. Kiểm tra xem route có phải public không
  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
  // 2. Lấy token từ cookie (Tên cookie tuỳ thuộc vào backend của bạn set)
  const token = request.cookies.get(AUTH_REFRESH_COOKIE)?.value;

  // 3. Nếu chưa đăng nhập và muốn vào trang admin -> redirect về login
  if (!isPublicRoute && !token) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // 4. Nếu đã đăng nhập mà muốn vào trang login -> redirect về trang chủ admin
  if (isPublicRoute && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|assets|.*\\..*).*)'],
};
