import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { subtle } from "crypto";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not set");
}

export const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET);

type AuthPayload = { userId: number; role: string };

export async function verifyAuth(): Promise<AuthPayload | NextResponse> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as unknown as AuthPayload;
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}

export function isUnauthorized(result: unknown): result is NextResponse {
  return result instanceof NextResponse;
}

async function sha256Hex(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const buffer = await subtle.digest("SHA-256", encoder.encode(password));
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function verifyPasswordWithMigration(
  inputPassword: string,
  storedHash: string,
  updateHash: (newHash: string) => Promise<void>
): Promise<boolean> {
  if (storedHash.startsWith("$2")) {
    return bcrypt.compare(inputPassword, storedHash);
  }

  const inputSha256 = await sha256Hex(inputPassword);
  if (inputSha256 !== storedHash) return false;

  const newHash = await bcrypt.hash(inputPassword, 12);
  await updateHash(newHash);
  return true;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}
