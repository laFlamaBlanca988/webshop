import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth/config";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;

    // Protect admin routes
    if (req.nextUrl.pathname.startsWith("/admin")) {
      if (token?.role !== authConfig.adminRole) {
        return NextResponse.redirect(new URL("/auth", req.url));
      }
    }

    // Protect API routes that require authentication
    if (req.nextUrl.pathname.startsWith("/api")) {
      // Skip auth check for public routes
      const publicRoutes = ["/api/auth", "/api/products"];
      if (
        publicRoutes.some((route) => req.nextUrl.pathname.startsWith(route))
      ) {
        return NextResponse.next();
      }

      if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // Check admin-only API routes
      const adminRoutes = ["/api/admin"];
      if (
        adminRoutes.some((route) => req.nextUrl.pathname.startsWith(route)) &&
        token.role !== authConfig.adminRole
      ) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

// Specify which routes to protect
export const config = {
  matcher: ["/admin/:path*", "/api/:path*", "/profile/:path*"],
};
