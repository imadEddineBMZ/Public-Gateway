import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Paths that should be accessible to the public (not protected)
const publicPaths = ['/', '/login', '/register', '/donors', '/hospitals', '/requests'];

/**
 * Middleware function that runs before each request
 * It checks if the user is authenticated when accessing protected routes
 */
export function middleware(request: NextRequest) {
  // Get the path from the request
  const path = request.nextUrl.pathname;
  
  // Check if the path is a protected dashboard route
  const isProtectedPath = path.startsWith('/dashboard');
  
  // Get the authentication token from the cookies
  const token = request.cookies.get('auth_token')?.value;
  
  // If trying to access a protected route without being authenticated
  if (isProtectedPath && !token) {
    console.log(`[MIDDLEWARE] Unauthorized access attempt to ${path}`);
    
    // Create a URL object for the login page with a redirect parameter
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', path);
    
    // Redirect to the login page
    return NextResponse.redirect(loginUrl);
  }
  
  // For all other cases, continue the request
  return NextResponse.next();
}

// Configure middleware to run only on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (public image files)
     * - api routes that don't need auth
     */
    '/((?!_next/static|_next/image|favicon.ico|images|api/public).*)',
  ],
};