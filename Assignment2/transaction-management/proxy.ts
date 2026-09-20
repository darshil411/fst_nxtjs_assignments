// proxy.ts
// Next.js Proxy (formerly Middleware) — route protection layer
//
// This middleware is the FIRST line of defense. It validates sessions and
// roles before routes resolve. However, all sensitive route handlers and
// server actions ALSO perform independent authorization (defence in depth).
//
// VERSION NOTE:
//   Next.js 16+ : this file is `proxy.ts` and exports `proxy()`.
//   Next.js 13–15: the identical file is named `middleware.ts` and exports
//                  `middleware()`. Nothing else changes. This project runs
//                  Next.js 16, so `proxy.ts` / `proxy()` is used.
//
// The `matcher` config below limits which paths trigger this layer.

import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// ─────────────────────────────────────────────────────────────
// Route protection rules
// ─────────────────────────────────────────────────────────────

// Routes that require authentication (any role)
const AUTHENTICATED_ROUTES = ["/dashboard", "/transactions"];

// Routes that require ADMIN role
const ADMIN_ROUTES = ["/admin", "/api/admin"];

// Routes that require at least MEMBER role
const MEMBER_ROUTES = ["/api/transactions"];

// Public routes — always accessible
const PUBLIC_ROUTES = ["/", "/login", "/signup", "/api/auth"];

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function matchesAny(pathname: string, routes: string[]): boolean {
  return routes.some((route) =>
    route === "/"
      ? pathname === "/"
      : pathname === route || pathname.startsWith(`${route}/`)
  );
}

// ─────────────────────────────────────────────────────────────
// Middleware
// ─────────────────────────────────────────────────────────────

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow public routes
  if (matchesAny(pathname, PUBLIC_ROUTES)) {
    return NextResponse.next();
  }

  // Read session cookie (lightweight — does NOT verify server-side here)
  // Full session validation is done in route handlers and server actions.
  const sessionCookie = getSessionCookie(request);

  // ── Not authenticated ────────────────────────────────────
  if (!sessionCookie) {
    // API routes → 401 JSON
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Unauthorized — authentication required" },
        { status: 401 }
      );
    }
    // Page routes → redirect to login
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Authenticated: validate role for admin routes ────────
  // We call the internal auth session endpoint to get the real role.
  // This is a lightweight internal fetch — no external network call.
  if (
    matchesAny(pathname, ADMIN_ROUTES) ||
    matchesAny(pathname, MEMBER_ROUTES) ||
    matchesAny(pathname, AUTHENTICATED_ROUTES)
  ) {
    try {
      const sessionRes = await fetch(
        new URL("/api/auth/get-session", request.url),
        {
          headers: {
            cookie: request.headers.get("cookie") ?? "",
          },
        }
      );

      if (!sessionRes.ok) {
        if (pathname.startsWith("/api/")) {
          return NextResponse.json(
            { error: "Unauthorized — invalid session" },
            { status: 401 }
          );
        }
        return NextResponse.redirect(new URL("/login", request.url));
      }

      const sessionData = (await sessionRes.json()) as {
        user?: { role?: string };
      } | null;

      const role = sessionData?.user?.role ?? "MEMBER";

      // Admin routes — require ADMIN role
      if (matchesAny(pathname, ADMIN_ROUTES)) {
        if (role !== "ADMIN") {
          if (pathname.startsWith("/api/")) {
            return NextResponse.json(
              { error: "Forbidden — admin access required" },
              { status: 403 }
            );
          }
          return NextResponse.redirect(new URL("/dashboard?error=forbidden", request.url));
        }
      }

      // Member routes — require MEMBER or ADMIN
      if (matchesAny(pathname, MEMBER_ROUTES)) {
        if (role !== "MEMBER" && role !== "ADMIN") {
          if (pathname.startsWith("/api/")) {
            return NextResponse.json(
              { error: "Forbidden — member access required" },
              { status: 403 }
            );
          }
          return NextResponse.redirect(new URL("/dashboard?error=forbidden", request.url));
        }
      }
    } catch {
      // Session fetch failed — treat as unauthenticated
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { error: "Unauthorized — session validation failed" },
          { status: 401 }
        );
      }
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

// ─────────────────────────────────────────────────────────────
// Matcher — limits which paths trigger this layer
// (excludes static files, _next internals)
// ─────────────────────────────────────────────────────────────

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public assets
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
