import { adminSessionTokenName } from "@/admin/packages/utils/constants/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(adminSessionTokenName)?.value;
  const { pathname } = request.nextUrl;
  if ((token && pathname.startsWith("/admin/auth")) || pathname === "/") {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  if (
    !token &&
    pathname.startsWith("/admin") &&
    !pathname.startsWith("/admin/auth")
  ) {
    return NextResponse.redirect(new URL("/admin/auth/signin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/",
  ],
};
