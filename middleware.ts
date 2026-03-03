import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. Check for your authentication token (e.g., a cookie)
  // You will need to set this cookie when the user successfully logs in via your Elysia API
  const token = request.cookies.get('auth-token')?.value;

  // 2. Identify the path the user is trying to visit
  const path = request.nextUrl.pathname;
  const isLoginPage = path.startsWith('/login');

  // 3. If the user has NO token, and they are NOT on the login page -> Redirect to /login
  if (!token && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 4. If the user HAS a token, and they try to visit /login -> Redirect to dashboard (/)
  if (token && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 5. Otherwise, let them proceed normally
  return NextResponse.next();
}

// 6. Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT for the ones starting with:
     * - api (Next.js API routes)
     * - _next/static (static files like CSS/JS)
     * - _next/image (image optimization files)
     * - favicon.svg (your site icon)
     */
    '/((?!api|_next/static|_next/image|favicon.svg).*)',
  ],
};