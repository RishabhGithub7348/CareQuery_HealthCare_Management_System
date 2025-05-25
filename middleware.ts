import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const user = request.cookies.get("user")?.value;

  if (user && request.nextUrl.pathname === "/auth") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!user && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/auth", "/dashboard/:path*"],
};
