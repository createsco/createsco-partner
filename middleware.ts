import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  console.log("🔍 Middleware: Checking path:", path)

  // Define public paths that don't require authentication
  const isPublicPath =
    path === "/" ||
    path === "/partner/login" ||
    path === "/partner/signup" ||
    path === "/partner/forgot-password" ||
    path === "/admin"

  // Get the token from the cookies
  const token = request.cookies.get("authToken")?.value || ""
  const isAdmin = request.cookies.get("isAdmin")?.value === "true"

  console.log("🔍 Middleware: Auth state", {
    hasToken: !!token,
    isAdmin,
    path,
    cookies: {
      authToken: !!request.cookies.get("authToken"),
      isAdminCookie: request.cookies.get("isAdmin")?.value,
    },
  })

  // Check if the path is for admin routes
  const isAdminPath = path.startsWith("/admin") && path !== "/admin"

  // If trying to access admin routes
  if (isAdminPath) {
    console.log("🔍 Middleware: Admin path detected, checking admin status")

    // If no admin cookie, redirect to admin login
    if (!isAdmin) {
      console.log("❌ Middleware: No admin access, redirecting to admin login")
      return NextResponse.redirect(new URL("/admin", request.url))
    } else {
      console.log("✅ Middleware: Admin access granted")
    }
  }

  // For partner routes that require authentication (excluding API routes)
  const isPartnerProtectedPath = !isPublicPath && !path.startsWith("/api") && !isAdminPath

  if (isPartnerProtectedPath && !token) {
    console.log("❌ Middleware: No auth token for protected path, redirecting to login")
    return NextResponse.redirect(new URL("/partner/login", request.url))
  }

  // If trying to access auth pages while already logged in
  if ((path === "/partner/login" || path === "/partner/signup") && token && !isAdmin) {
    console.log("✅ Middleware: Already authenticated, redirecting to dashboard")
    return NextResponse.redirect(new URL("/partner/dashboard", request.url))
  }

  console.log("✅ Middleware: Allowing access to", path)
  return NextResponse.next()
}

// Configure the paths that should be matched by the middleware
export const config = {
  matcher: [
    /*
     * Match all paths except:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. all root files inside /public (e.g. /favicon.ico)
     */
    "/((?!api|_next|_static|_vercel|[\\w-]+\\.\\w+).*)",
  ],
}
