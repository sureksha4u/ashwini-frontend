import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('ashwini_token');
  const { pathname } = request.nextUrl;

  // Define protected routes
  const protectedRoutes = ['/dashboard', '/patients', '/pharmacy'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute && !token) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/patients/:path*', '/pharmacy/:path*'],
};
