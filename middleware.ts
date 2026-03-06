import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET 
);

export async function middleware(request: NextRequest) {
  // 1. Check for your authentication token (e.g., a cookie)
  // You will need to set this cookie when the user successfully logs in via your Elysia API
  const token = request.cookies.get('auth-token')?.value;

  // 2. Identify the path the user is trying to visit
  const path = request.nextUrl.pathname;
  const isLoginPage = path.startsWith('/login');

  // 1. If no token exists and user is on a protected route
  if (!token) {
    if (!isLoginPage) {
        return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  try {
    // 2. Verify the token (this checks both the signature and 'exp' field)
    await jwtVerify(token, JWT_SECRET);

    // 3. If valid and user is trying to go to login, send to dashboard
    if (isLoginPage) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
  } catch (error) {
    // 4. Handle Expired or Invalid Token
    // console.error('Token verification failed:', error.code);

    // Only redirect if they aren't already on the login page
    if (!isLoginPage) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      
      // 5. "Logout" - Clear the cookie by setting it to expire immediately
      response.cookies.set('auth-token', '', { 
        path: '/', 
        expires: new Date(0) 
      });
      
      return response;
    }

    return NextResponse.next();
  }

  // 4. If the user HAS a token, and they try to visit /login -> Redirect to dashboard (/)
  if (token && isLoginPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
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