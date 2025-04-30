import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret_key");

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  try {
    // Verify the JWT token using jose
    await jwtVerify(token, SECRET_KEY);
  } catch (error) {
    console.error("Error in middleware:", error);
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};