import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not set");
}
const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET);

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("auth_token")?.value;
  const isApiRoute = pathname.startsWith("/api/");

  const unauthorized = () =>
    isApiRoute
      ? NextResponse.json({ message: "Unauthorized" }, { status: 401 })
      : NextResponse.redirect(new URL("/login", req.url));

  const forbidden = () =>
    isApiRoute
      ? NextResponse.json({ message: "Forbidden" }, { status: 403 })
      : NextResponse.redirect(new URL("/", req.url));

  if (!token) return unauthorized();

  let payload: { userId?: number; role?: string };
  try {
    const result = await jwtVerify(token, SECRET_KEY);
    payload = result.payload as { userId?: number; role?: string };
  } catch {
    return unauthorized();
  }

  // Rotas /admin/* e /api/admin/* exigem role "mentor"
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    if (payload.role !== "mentor") return forbidden();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/api/dashboard/:path*",
    "/api/admin/:path*",
    "/api/lessons/:path*",
    "/api/profile/:path*",
    "/api/reunions/:path*",
    "/api/activities",
    "/api/notifications",
  ],
};
