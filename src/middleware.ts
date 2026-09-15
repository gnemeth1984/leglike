import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  const protectedPaths = ["/dashboard", "/onboarding", "/admin", "/assessment", "/rehab"];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  if (isProtected && !isLoggedIn) {
    const signInUrl = new URL("/auth/signin", req.nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  if (pathname.startsWith("/admin") && isLoggedIn) {
    const role = (req.auth?.user as any)?.role;
    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/onboarding/:path*", "/admin/:path*", "/assessment/:path*", "/rehab/:path*"],
};
